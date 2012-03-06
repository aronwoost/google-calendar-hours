/* MODELS */

var Calendar = Backbone.Model.extend({
	sync:GchSync,
    defaults: {
        "items": null
    },
	createCalendar: function() {
		this.url = "https://www.googleapis.com/calendar/v3/calendars/" + this.get("id") + "/events";
		// override parse, since we want to set the items, when parse is called 
		this.parse = function(response) {
			if(response.error) {
				this.trigger("connectError", response);
				return;
			}
			this.set({items:response.items});
		};
	},
	hasCalendarData: function() {
		return this.get("items") !== null;
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
			totalHours = 0;
		
		this.get("items").map(function(item){
			var itemDataStart = new Date(item.start.dateTime);
			var itemDataEnd = new Date(item.end.dateTime);
			if(itemDataStart > start && itemDataEnd < end) {
				var diff = new Date(item.end.dateTime) - new Date(item.start.dateTime);
				var hours = diff/1000/60/60;
				totalHours += hours;
			}
		}, this);				
		
		return totalHours;
	}	
});

var CalendarsCollection = Backbone.Collection.extend({
    model: Calendar,
    sync: GchSync,
    url: "https://www.googleapis.com/calendar/v3/users/me/calendarList",
	parse: function(response) {
		if(response.error) {
			this.trigger("connectError", response);
			return;
		}
	    return response.items;
	}
});

//

var RangeModel = Backbone.Model.extend({
    defaults: {
		"today":Date.today().getTime(),
		"currentDatePointer":Date.today(),
		"range":null,
		"rangeObj":{}
    },
    initialize: function() {
		this.updateRangeObj();
    },
	updateRangeByIndex: function(index) {
		switch (index) {
		   case 0:
		      this.set({range:"day"}); break;
		   case 1:
		      this.set({range:"week"}); break;
		   case 2:
		      this.set({range:"month"}); break;
		   case 3:
		      this.set({range:"year"}); break;
		   case 4:
		      this.set({range:"total"}); break;
		}
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
			d1 = currentDate.clone().moveToDayOfWeek(0, -1);
			d2 = currentDate.clone().moveToDayOfWeek(0);
		} else if(range === "month") {
			d1 = currentDate.clone().moveToFirstDayOfMonth();
			d2 = currentDate.clone().moveToLastDayOfMonth().add(1).days();
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
			this.set({currentDatePointer:currentDate}); //TODO don't know, why I need to set this explicitly
			this.updateRangeObj();
			return;
		}	
		
		if(range === "day") {
			currentDate.addDays(direction);
		} else if(range === "week") {
			currentDate.addWeeks(direction);
		} else if(range === "month") {
			currentDate.addMonths(direction);
		}
		this.updateRangeObj();
	}
});		

//

var ApiTokenModel = Backbone.Model.extend({
	sync:TokenSync,
    defaults: {
		"accessToken":null
    },
	hasApiToken: function() {
		return this.get("accessToken") != null;
	}
});

//

var AppModel = Backbone.Model.extend({
    defaults: {
		"selectedCalendar":null,
		"selectedRange":new RangeModel(),
		"calendarsCollection":null,
		"hasPrevItem":false,
		"hasNextItem":false
    },
    initialize: function() {
		var calendarsCollection = new CalendarsCollection();
		calendarsCollection.bind('reset', this.loadCalendarsCollectionComplete, this);
		calendarsCollection.bind('error', this.loadCalendarsCollectionError, this);
		calendarsCollection.bind('connectError', this.connectError, this);
		this.set({calendarsCollection: calendarsCollection});
		this.set({selectedRangeObj: this.get("selectedRange").getRangeObj()});
		this.get("selectedRange").bind("change:rangeObj", this.updateOutput, this);
    },
	fetch: function(){
		this.get("calendarsCollection").fetch();
	},
	loadCalendarsCollectionComplete: function(collection){
		this.trigger("calendarListComplete", collection);
	},	
	loadCalendarsCollectionError: function(collection){
		this.trigger("calendarListError", collection);
	},
	setSelectedCalendarByIndex: function(index) {
		if(index < 0 || index == this.get("calendarsCollection").length) {
			return;
		}
		var model = this.get("calendarsCollection").at(index);
		if(model.hasCalendarData()){
			this.set({selectedCalendar: model});
			this.updateOutput();
		} else {
			this.trigger("calendarLoadingStart");
			model.createCalendar();
			model.bind('change', this.calendarDataReady, this);				
			model.bind('error', this.calendarDataError, this);	
			model.fetch();
		}
		this.set({hasPrevItem:(index>0), hasNextItem:(index<this.get("calendarsCollection").length - 1)})

		// set default range, if null (seams this is the first calendar selection evar)
		var currentRange = this.get("selectedRange").get("range");
		if(!currentRange) {
			this.get("selectedRange").set({range:"month"});
			this.get("selectedRange").updateRangeObj();
		}
	},
	setSelectedRangeByIndex: function(index) {
		this.get("selectedRange").updateRangeByIndex(index);
		this.updateOutput();
	},			
	calendarDataReady: function(model) {
		this.set({selectedCalendar: model});
		this.updateOutput();
	},
	calendarDataError: function(model, resp) {
		console.log("calendarDataError");
		console.log(resp);
		console.dir(resp.getAllResponseHeaders());
		console.dir(resp.statusCode());
	},
	getSelectedRange: function() {
		//console.log(this.get("selectedRangeObj"));
		return this.get("selectedRange").getRangeObj();
	},
	changeCalendar: function(offset) {
		var currentIndex = this.get("calendarsCollection").models.indexOf(this.get("selectedCalendar"));
		this.setSelectedCalendarByIndex(currentIndex+offset);
	},
	updateOutput: function() {
		if(!this.get("selectedCalendar")) return;
		this.trigger("updateOutput", {hours:this.get("selectedCalendar").getHours(this.getSelectedRange()), range:this.getSelectedRange()});
	},
	connectError: function (data) {
		this.trigger("connectError", data);
	}
});