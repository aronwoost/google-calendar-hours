define([
    "backbone",
    "moment"
  ],
  function (Backbone, moment) {

  "use strict";

  var RangeModel = Backbone.Model.extend({
    defaults: {
      "range":null,
      "rangeObj":{},
      "rangeIndex":null
    },
    initialize: function() {
      this.currentDatePointer = moment().startOf("day");
      this.currentDatePointerEnd = moment().startOf("day");
      this.weekStart = "sunday";
    },
    rangeIndexMappings: ["day", "week", "month", "year", "total", "custom"],
    updateRangeByIndex: function(index) {
      this.set({range:this.rangeIndexMappings[index]});
      this.set({rangeIndex:index});
      this.updateRangeObj();
    },
    updateCustomRange: function(start, end) {
      this.currentDatePointer = moment(start);
      this.currentDatePointerEnd = moment(end);
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
          d1 = this.currentDatePointer.clone().day(0);
        } else {
          d1 = this.currentDatePointer.clone().day(1);
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
      } else if(range === "custom") {
        d1 = this.currentDatePointer.clone();
        d2 = this.currentDatePointerEnd.clone();
      }

      this.set({rangeObj:{start:d1, end:d2, type:range, weekStart:this.weekStart}});
    },
    getRangeObj: function() {
      return this.get("rangeObj");
    },
    changeRange: function(direction, custom) {
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
      } else if(range === "custom") {
        this.currentDatePointer = custom.start;
        this.currentDatePointerEnd = custom.end;
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

  return RangeModel;
});