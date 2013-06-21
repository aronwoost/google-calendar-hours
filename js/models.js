/*global Backbone:true _:true */

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
			if(this.originalUrl.indexOf("?") !== -1){
				this.url = this.originalUrl + "&pageToken=" + this.nextPageToken;
			}else{
				this.url = this.originalUrl + "?pageToken=" + this.nextPageToken;
			}
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
		this.eventsCollection.setUrl("https://www.googleapis.com/calendar/v3/calendars/" + this.get("id") + "/events?singleEvents=true");
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
				} else {
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

var RangeModel = Backbone.Model.extend({
	defaults: {
		"range":null,
		"rangeObj":{},
		"rangeIndex":null
	},
	initialize: function() {
		this.currentDatePointer = moment().startOf("day");
		this.weekStart = "sunday";
	},
	rangeIndexMappings: ["day", "week", "month", "year", "total"],
	updateRangeByIndex: function(index) {
		this.set({range:this.rangeIndexMappings[index]});
		this.set({rangeIndex:index});
		this.updateRangeObj();
	},
	updateRangeObj: function() {
		var range = this.get("range"),
			d1, d2;

		if(range === "day") {
			d1 = this.currentDatePointer.clone();
			d2 = this.currentDatePointer.clone().add("days", 1);
		} else if(range === "week") {
			if(this.weekStart === "sunday") {
				//TODO re-check if this works as expected
				/*if(this.currentDatePointer.is().sunday()) {
					d1 = this.currentDatePointer.clone();
				} else {*/
					d1 = this.currentDatePointer.clone().day(0);
				//}
			} else {
				/*if(this.currentDatePointer.is().monday()) {
					d1 = this.currentDatePointer.clone();
				} else {*/
					d1 = this.currentDatePointer.clone().day(1);
				//}
			}
			d2 = d1.clone().add("weeks", 1);
		} else if(range === "month") {
			d1 = this.currentDatePointer.clone().startOf("month");
			d2 = this.currentDatePointer.clone().startOf("month").add("month", 1);
		} else if(range === "year") {
			d1 = this.currentDatePointer.clone().startOf("year");
			d2 = d1.clone().add("year", 1);
		} else if(range === "total") {
			d1 = moment(0);
			d2 = moment("Dec 31, 2040");
		}

		this.set({rangeObj:{start:d1, end:d2, type:range, weekStart:this.weekStart}});
	},
	getRangeObj: function() {
		return this.get("rangeObj");
	},
	changeRange: function(direction) {
		var range = this.get("range");

		if(direction === 0) {
			this.currentDatePointer = moment().startOf("day");
			this.updateRangeObj();
			return;
		}

		if(range === "day") {
			this.currentDatePointer.add("days", direction);
		} else if(range === "week") {
			this.currentDatePointer.add("weeks", direction);
		} else if(range === "month") {
			this.currentDatePointer.add("months", direction);
		} else if(range === "year") {
			this.currentDatePointer.add("years", direction);
		}
		this.updateRangeObj();
	},
	updateWeekStart: function(day) {
		if(this.weekStart === day) {
			return;
		}
		this.weekStart = day;
		this.updateRangeObj();
	},
	getWeekStart: function(){
		return this.weekStart;
	}
});

var AppModel = Backbone.Model.extend({
	defaults: {
		"selectedCalendar":null,
		"selectedRange":new RangeModel(),
		"calendarsCollection":null
	},
	config:null,
	initialize: function(defaults, options) {
		this.config = options.config;
		var calendarsCollection = new CalendarsCollection();
		calendarsCollection.bind('reset', this.loadCalendarsCollectionComplete, this);
		calendarsCollection.bind('error', this.connectError, this);
		this.set({calendarsCollection: calendarsCollection});
		this.set({selectedRangeObj: this.get("selectedRange").getRangeObj()});
		this.get("selectedRange").updateWeekStart(this.config.weekStart || "monday");
		this.get("selectedRange").bind("change:rangeObj", this.updateOutput, this);
	},
	fetch: function(){
		this.get("calendarsCollection").fetch();
	},
	loadCalendarsCollectionComplete: function(collection){
		this.trigger("calendarListComplete", collection);
		if(this.config.lastSelectedCalendarCid) {
			this.setSelectedCalendarById(this.config.lastSelectedCalendarCid);
		}
	},
	setSelectedCalendarById: function(id) {
		var model = this.get("calendarsCollection").get(id);
		if(!model){
			return;
		}
		if(model.hasCalendarData()){
			this.set({selectedCalendar:model});
			this.updateOutput();
		} else {
			this.trigger("calendarLoadingStart", id);
			model.fetchEvents();
			model.bind('eventsReceived', this.calendarDataReady, this);
			model.bind('connectError', this.connectError, this);
		}

		// set default range, if null (seams this is the first calendar selection ever)
		var currentRange = this.get("selectedRange").get("range");
		if(!currentRange) {
			if(this.config.lastSelectedRangeIndex !== null) {
				this.get("selectedRange").updateRangeByIndex(this.config.lastSelectedRangeIndex);
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

		if(!cal){
			return;
		}

		hours = cal.getHours(this.getSelectedRange());
		this.trigger("updateOutput", {
			hours: hours.total,
			projects: hours.projects,
			range: this.getSelectedRange()
		});
		this.trigger("calendarSelectionChanged",cal.id);
		this.updateConfig();
	},
	connectError: function (data) {
		this.trigger("connectError", data);
	},
	updateConfig: function() {
		var selectedCalendarId = this.get("selectedCalendar").id,
			rangeIndex = this.get("selectedRange").attributes.rangeIndex,
			weekStart = this.get("selectedRange").getRangeObj().weekStart;

		if(this.config.lastSelectedCalendarCid !== selectedCalendarId || this.config.lastSelectedRangeIndex !== rangeIndex || this.config.weekStart !== weekStart) {
			this.config = {lastSelectedRangeIndex:rangeIndex, lastSelectedCalendarCid:selectedCalendarId, weekStart:weekStart};
			localStorage.setItem("config", JSON.stringify(this.config));
		}
	}
});