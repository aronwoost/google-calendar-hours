/* MODELS */

var EventsCollection = Backbone.Collection.extend({
	model: Backbone.Model,
	initialize:function(){
		this.bind('add', this.added, this);
	},
	parse: function(response) {
		if(response.nextPageToken) {
			this.nextPageToken = response.nextPageToken;
		} else {
			this.nextPageToken = null;
		}
		return response.items;
	},
	reset:function(models){
		this.add(models, {silent:true});
		this.getNextPage();
	},
	added:function(){
		this.getNextPage();
	},
	/*
	Throttel this call (see underscore docs) so that the fetch is only called
	once, even though several add events are incomming.
	*/
	getNextPage:_.throttle(function(){
		if(this.nextPageToken){
			this.url = this.originalUrl + "?pageToken=" + this.nextPageToken;
			this.fetch({add: true});
		} else {
			this.trigger("reset", this);
		}
	}, 0),
	setUrl:function(url){
		this.originalUrl = url;
		this.url = url;
	}
});

var Calendar = Backbone.Model.extend({
	initialize:function(){
		this.eventsCollection = new EventsCollection();
		this.eventsCollection.setUrl("https://www.googleapis.com/calendar/v3/calendars/" + this.get("id") + "/events");
		this.eventsCollection.bind('reset', this.eventsReceived, this);
		this.eventsCollection.bind('error', this.connectError, this);
	},
	eventsReceived: function(){
		this.trigger("eventsReceived", this);
	},
	connectError: function(){
		this.trigger("connectError", this);
	},
	fetchEvents: function() {
		this.eventsCollection.fetch();
	},
	hasCalendarData: function() {
		return this.eventsCollection.length !== 0;
	},
	getTitle: function() {
		return this.get("summary");
	},
	getUrl: function() {
		return this.get("id");
	},
	getHours: function(rangeObj) {
		var start = rangeObj.start,
			end = rangeObj.end,
			totalHours = 0,
			projects = {};

		this.eventsCollection.map(function(item){
			var itemDataStart,
				itemDataEnd,
				diff,
				hours,
				title = item.get('summary'),
				name = title.toLowerCase().replace(/[^\w.]/g, ""); // TODO normalize

			itemDataStart = new Date(item.get("start").dateTime);
			itemDataEnd = new Date(item.get("end").dateTime);
			if (itemDataStart > start && itemDataEnd < end) {
				diff = new Date(item.get("end").dateTime) - new Date(item.get("start").dateTime);
				hours = diff/1000/60/60;
				totalHours += hours;

				if (typeof projects[name] === 'undefined') {
					projects[name] = {
						hours: hours,
						label: title
					};
				}
				else {
					projects[name].hours += hours;
				}
			}
		}, this);

		return {
			total: totalHours,
			projects: this._sortProjectDetails(projects)
		};
	},
	_sortProjectDetails: function(projects) {
		var projectList = [];
		for (var p in projects) {
			projectList.push(projects[p]);
		}
		projectList.sort(function (a, b) {
			return (a.hours > b.hours) ? -1 : (a.hours < b.hours) ? 1 : 0;
		});
		return projectList;
	}
});

var CalendarsCollection = Backbone.Collection.extend({
	model: Calendar,
	url: "https://www.googleapis.com/calendar/v3/users/me/calendarList",
	parse: function(response) {
		return response.items;
	}
});

//

var RangeModel = Backbone.Model.extend({
	defaults: {
		"currentDatePointer":Date.today(),
		"range":null,
		"rangeObj":{},
		"weekStart":"sunday",
		"rangeIndex":null
	},
	initialize: function() {
		this.updateRangeObj();
	},
	rangeIndexMappings: ["day", "week", "month", "year", "total"],
	updateRangeByIndex: function(index) {
		this.set({range:this.rangeIndexMappings[index]});
		this.set({rangeIndex:index});
		this.updateRangeObj();
	},
	updateRangeObj: function() {
		var range = this.get("range"),
			d1,
			d2,
			currentDate = this.get("currentDatePointer");

		if(range === "day") {
			d1 = currentDate.clone();
			d2 = currentDate.clone().add(1).days();
		} else if(range === "week") {
			if(this.get("weekStart") === "sunday") {
				if(currentDate.is().sunday()) {
					d1 = currentDate.clone();
				} else {
					d1 = currentDate.clone().sunday().addWeeks(-1);
				}
			} else {
				if(currentDate.is().monday()) {
					d1 = currentDate.clone();
				} else {
					d1 = currentDate.clone().monday().addWeeks(-1);
				}
			}
			d2 = d1.clone().addDays(6).addHours(23).addMinutes(59).addSeconds(59);
		} else if(range === "month") {
			d1 = currentDate.clone().moveToFirstDayOfMonth();
			d2 = currentDate.clone().moveToLastDayOfMonth().add(1).days();
		} else if(range === "year") {
			d1 = currentDate.clone().moveToMonth(0, -1).moveToFirstDayOfMonth();
			d2 = currentDate.clone().moveToMonth(0, 1).moveToFirstDayOfMonth();
		} else if(range === "total") {
			d1 = 0;
			d2 = Number.POSITIVE_INFINITY;
		}
		this.set({rangeObj:{start:d1, end:d2, type:range}});
	},
	getRangeObj: function() {
		return this.get("rangeObj");
	},
	changeRange: function(direction) {
		var range = this.get("range"),
			currentDate = this.get("currentDatePointer");

		if(direction === 0) {
			currentDate = Date.today();
			this.set({currentDatePointer:currentDate}); //TODO don't understand why I need to set this explicitly
			this.updateRangeObj();
			return;
		}

		if(range === "day") {
			currentDate.addDays(direction);
		} else if(range === "week") {
			currentDate.addWeeks(direction);
		} else if(range === "month") {
			currentDate.addMonths(direction);
		} else if(range === "year") {
			currentDate.addYears(direction);
		}
		this.updateRangeObj();
	},
	updateWeekStart: function(day) {
		this.set({weekStart:day});
		this.updateRangeObj();
	}
});

//

var AppModel = Backbone.Model.extend({
	defaults: {
		"selectedCalendar":null,
		"selectedRange":new RangeModel(),
		"calendarsCollection":null,
		"config":null
	},
	initialize: function() {
		var calendarsCollection = new CalendarsCollection();
		calendarsCollection.bind('reset', this.loadCalendarsCollectionComplete, this);
		calendarsCollection.bind('error', this.connectError, this);
		this.set({calendarsCollection: calendarsCollection});
		this.set({selectedRangeObj: this.get("selectedRange").getRangeObj()});
		this.get("selectedRange").bind("change:rangeObj", this.updateOutput, this);
	},
	fetch: function(){
		this.get("calendarsCollection").fetch();
	},
	loadCalendarsCollectionComplete: function(collection){
		this.trigger("calendarListComplete", collection);
		if(this.get("config").lastSelectedCalendarCid) {
			this.setSelectedCalendarByCid(this.get("config").lastSelectedCalendarCid);
		}
	},
	setSelectedCalendarByCid: function(cid) {
		var model = this.get("calendarsCollection").getByCid(cid);
		if(model.hasCalendarData()){
			this.set({selectedCalendar:model});
			this.updateOutput();
		} else {
			this.trigger("calendarLoadingStart", cid);
			model.fetchEvents();
			model.bind('eventsReceived', this.calendarDataReady, this);
			model.bind('connectError', this.connectError, this);
		}

		// set default range, if null (seams this is the first calendar selection ever)
		var currentRange = this.get("selectedRange").get("range");
		if(!currentRange) {
			if(this.get("config").lastSelectedRangeIndex !== null) {
				this.get("selectedRange").updateRangeByIndex(this.get("config").lastSelectedRangeIndex);
			} else {
				this.get("selectedRange").updateRangeByIndex(2);
			}
		}
	},
	calendarDataReady: function(model) {
		this.set({selectedCalendar:model});
		this.updateOutput();
	},
	getSelectedRange: function() {
		return this.get("selectedRange").getRangeObj();
	},
	updateOutput: function() {
		var cal = this.get("selectedCalendar"),
			hours;

		if(!cal) return;

		hours = cal.getHours(this.getSelectedRange());
		this.trigger("updateOutput", {
			hours: hours.total,
			projects: hours.projects,
			range: this.getSelectedRange()
		});
		this.trigger("calendarSelectionChanged",cal.cid);
		this.updateConfig();
	},
	connectError: function (data) {
		this.trigger("connectError", data);
	},
	updateConfig: function() {
		var selectedCalendarCid = this.get("selectedCalendar").cid,
			rangeIndex = this.get("selectedRange").attributes.rangeIndex;

		if(this.get("config").lastSelectedCalendarCid !== selectedCalendarCid || this.get("config").lastSelectedRangeIndex !== rangeIndex) {
			this.set({config:{lastSelectedRangeIndex:rangeIndex, lastSelectedCalendarCid:selectedCalendarCid}});
			localStorage.setItem("config", JSON.stringify(this.get("config")));
		}
	}
});