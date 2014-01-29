define([
    "backbone",
    "app/model/range_model",
    "app/model/calendar_collection"
  ],
  function (Backbone, RangeModel, CalendarsCollection) {

  "use strict";

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
      calendarsCollection.bind("sync", this.loadCalendarsCollectionComplete, this);
      this.set({calendarsCollection: calendarsCollection});
      this.set({selectedRangeObj: this.get("selectedRange").getRangeObj()});
      this.get("selectedRange").updateWeekStart(this.config.weekStart || "monday");
      this.get("selectedRange").bind("change:rangeObj", this.updateOutput, this);
    },
    fetch: function(){
      this.get("calendarsCollection").fetch();
    },
    loadCalendarsCollectionComplete: function(){
      var currentCalendarId = (this.get("selectedCalendar") && this.get("selectedCalendar").id) || -1;
      this.trigger("calendarSelectionChanged", currentCalendarId);

      this.trigger("connectSuccess");
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
        this.trigger("calendarSelectionChanged", id);
        this.set({selectedCalendar:model});
        this.updateOutput();
      } else {
        this.trigger("calendarSelectionChanged", id);
        model.fetchEvents();
        model.bind("eventsReceived", this.calendarDataReady, this);
      }

      // set default range, if null (seams this is app startup)
      var currentRange = this.get("selectedRange").get("range");
      if(!currentRange) {
        if(this.config.lastSelectedRangeIndex !== null) {
          this.get("selectedRange").updateRangeByIndex(this.config.lastSelectedRangeIndex);
          if(this.config.lastSelectedRangeIndex === 5) {
            this.get("selectedRange").updateCustomRange(this.config.customStart, this.config.customEnd);
          }
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
      this.updateConfig();
    },
    updateConfig: function() {
      var selectedCalendarId = this.get("selectedCalendar").id,
        rangeIndex = this.get("selectedRange").attributes.rangeIndex,
        weekStart = this.get("selectedRange").getRangeObj().weekStart,
        customStart = null,
        customEnd = null;

      if(rangeIndex === 5) {
        customStart = this.get("selectedRange").getRangeObj().start.toJSON();
        customEnd = this.get("selectedRange").getRangeObj().end.toJSON();
      }

      this.config = {
        lastSelectedRangeIndex:rangeIndex,
        lastSelectedCalendarCid:selectedCalendarId,
        weekStart:weekStart,
        customStart:customStart,
        customEnd:customEnd
      };
      localStorage.setItem("config", JSON.stringify(this.config));
    }
  });

  return AppModel;
});