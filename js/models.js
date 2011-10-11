/* MODELS */

var CalendarList = Backbone.Model.extend({
    defaults: {
        "calendar": null
    },
	createCalendar: function(url) {
		var calendar = new CalendarCollection();
		calendar.url = url;
		this.set({calendar: calendar});
		return calendar;
	},
	hasCalendarData: function() {
		return this.get("calendar") !== null;
	},
    getTitle: function() {
        return this.get("title");
    },
    getUrl: function() {
        return this.get("eventFeedLink");
    }
});

var CalendarListCollection = Backbone.Collection.extend({
    model: CalendarList,
    url: "calendars.json",
	parse: function(response) {
	    return response.data.items;
	}
});

//

var Calendar = Backbone.Model.extend({
    defaults: function() {
        return { };
    }
});

var CalendarCollection = Backbone.Collection.extend({
    model: Calendar,
	getHours: function(rangeObj) {
		
		var start = rangeObj.start;
		var end = rangeObj.end;
		
		var totalHours = 0;
		
		_(this.models).each(function(calendarItem){
			calendarItem.get("when").map(function(item){
				var itemDataStart = new Date(item.start);
				var itemDataEnd = new Date(item.end);
				if(itemDataStart > start && itemDataEnd < end) {
					var diff = new Date(item.end) - new Date(item.start);
					var hours = diff/1000/60/60;
					totalHours += hours;
				}
			});
			
		}, this);				
		
		return totalHours;
	},
	parse: function(response) {
	    return response.data.items;
	}
});

//

var RangeModel = Backbone.Model.extend({
    defaults: {
		"today":Date.today().getTime(),
		"currentDatePointer":Date.today(),
		"range":"month",
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
		"token":null
    }
});

//

var AppModel = Backbone.Model.extend({
    defaults: {
		"selectedCalendar":null,
		"selectedRange":new RangeModel(),
		"calendarsCollection":null
    },
    initialize: function() {
		var calendarsCollection = new CalendarListCollection();
		calendarsCollection.bind('reset', this.loadCalendarsCollectionComplete, this);				
		this.set({calendarsCollection: calendarsCollection});
		this.set({selectedRangeObj: this.get("selectedRange").getRangeObj()});
    },
	fetch: function(){
		this.get("calendarsCollection").fetch();
	},
	loadCalendarsCollectionComplete: function(collection){
		this.trigger("calendarListComplete", collection);
	},
	setSelectedCalendarByIndex: function(index) {
		var model = this.get("calendarsCollection").at(index);
		if(model.hasCalendarData()){
			console.log("has data");
			this.set({selectedCalendar: model.calendar});
		} else {
			console.log("has no data");
			var itemCollection = model.createCalendar("test.json");
			itemCollection.bind('reset', this.calendarDataReady, this);							
			itemCollection.fetch();
		}
	},
	setSelectedRangeByIndex: function(index) {
		this.get("selectedRange").updateRangeByIndex(index);
	},			
	calendarDataReady: function(collection) {
		this.set({selectedCalendar: collection});
	},
	getSelectedRange: function() {
		//console.log(this.get("selectedRangeObj"));
		return this.get("selectedRange").getRangeObj();
	}
});