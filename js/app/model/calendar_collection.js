define([
    "backbone",
    "app/model/calendar_model",
    "app/model/range_model"
  ],
  function (Backbone, CalendarModel, RangeModel) {

  "use strict";

  var CalendarsCollection = Backbone.Collection.extend({
    model: CalendarModel,
    url: "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    selectedCalendar: null,
    selectedRangeObj: null,
    initialize: function(defaults, options) {
      this.config = options.config;
      this.on("sync", this.onSync, this);
      this.selectedRange = new RangeModel(null, {config: this.config});
      this.selectedRangeObj = this.selectedRange.getRangeObj();
      this.selectedRange.bind("change:rangeObj", this.onRangeObjChange, this);
    },
    parse: function(response) {
      return response.items;
    },
    onSync: function(){
      var currentCalendarId = (this.selectedCalendar && this.selectedCalendar.id) || -1;
      this.trigger("viewUpdate", currentCalendarId);

      this.trigger("connectSuccess");
      if(this.config.lastSelectedCalendarCid) {
        this.setSelectedCalendarById(this.config.lastSelectedCalendarCid);
      }
    },
    setSelectedCalendarById: function(id) {
      var model = this.get(id);
      if(!model){
        return;
      }

      this.selectedCalendar = model;
      this.updateConfig();
      this.updateView();

      if(!model.hasCalendarData()){
        model.fetchEvents();
        model.bind("eventsReceived", this.updateView, this);
      }
    },
    getSelectedRange: function() {
      return this.selectedRange.getRangeObj();
    },
    onRangeObjChange: function() {
      this.updateConfig();
      this.updateView();
    },
    updateView: function() {
      if(!this.selectedCalendar) {
        return;
      }
      this.trigger("viewUpdate", this.selectedCalendar.id);
    },
    updateConfig: function() {
      var selectedCalendarId = this.selectedCalendar.id;
      var rangeIndex = this.selectedRange.attributes.rangeIndex;
      var rangeObj = this.selectedRange.getRangeObj();
      var weekStart = rangeObj.weekStart;
      var sortBy = rangeObj.sortBy;
      var customStart = null;
      var customEnd = null;

      if (rangeIndex === 5) {
        customStart = this.selectedRange.getRangeObj().start.toJSON();
        customEnd = this.selectedRange.getRangeObj().end.toJSON();
      }

      this.config = {
        lastSelectedRangeIndex:rangeIndex,
        lastSelectedCalendarCid:selectedCalendarId,
        weekStart:weekStart,
        sortBy:sortBy,
        customStart:customStart,
        customEnd:customEnd
      };
      localStorage.setItem("config", JSON.stringify(this.config));
    }
  });

  return CalendarsCollection;
});