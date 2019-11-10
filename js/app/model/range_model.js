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
    initialize: function(data, options) {
      var config = options.config;

      this.currentDatePointer = moment().startOf("day");
      this.currentDatePointerEnd = moment().startOf("day");
      this.weekStart = "sunday";
      this.sortBy = "amount";

      if (config) {
        if (config.lastSelectedRangeIndex !== null) {
          this.updateRangeByIndex(config.lastSelectedRangeIndex);
          if (config.lastSelectedRangeIndex === 5) {
            this.updateCustomRange(config.customStart, config.customEnd);
          }
          if (config.weekStart) {
            this.updateWeekStart(config.weekStart);
          }
          if (config.sortBy) {
            this.updateSortBy(config.sortBy);
          }
        } else {
          this.updateRangeByIndex(2);
        }
      }
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

      if (range === "day") {
        d1 = this.currentDatePointer.clone();
        d2 = this.currentDatePointer.clone().add("days", 1);
      } else if (range === "week") {
        if (this.weekStart === "sunday") {
          d1 = this.currentDatePointer.clone().day(0);
        } else {
          d1 = this.currentDatePointer.clone().subtract("days", 1).day(1);
        }
        d2 = d1.clone().add("weeks", 1);
      } else if (range === "month") {
        d1 = this.currentDatePointer.clone().startOf("month");
        d2 = this.currentDatePointer.clone().startOf("month").add("month", 1);
      } else if (range === "year") {
        d1 = this.currentDatePointer.clone().startOf("year");
        d2 = d1.clone().add("year", 1);
      } else if (range === "total") {
        d1 = moment(0);
        d2 = moment("Dec 31, 2040");
      } else if (range === "custom") {
        d1 = this.currentDatePointer.clone();
        d2 = this.currentDatePointerEnd.clone();
      }

      this.set({
        rangeObj: {
          start: d1,
          end: d2,
          type: range,
          weekStart: this.weekStart,
          sortBy: this.sortBy,
        }
      });
    },
    getRangeObj: function() {
      return this.get("rangeObj");
    },
    changeRange: function(direction, custom) {
      var range = this.get("range");

      if (direction === 0) {
        this.currentDatePointer = moment().startOf("day");
        this.updateRangeObj();
        return;
      }

      if (range === "day") {
        this.currentDatePointer.add("days", direction);
      } else if (range === "week") {
        this.currentDatePointer.add("weeks", direction);
      } else if (range === "month") {
        this.currentDatePointer.add("months", direction);
      } else if (range === "year") {
        this.currentDatePointer.add("years", direction);
      } else if (range === "custom") {
        this.currentDatePointer = custom.start;
        this.currentDatePointerEnd = custom.end;
      }
      this.updateRangeObj();
    },
    updateWeekStart: function(day) {
      if (this.weekStart === day) {
        return;
      }
      this.weekStart = day;
      this.currentDatePointer.add("days", 1)
      this.updateRangeObj();
    },
    getWeekStart: function() {
      return this.weekStart;
    },
    updateSortBy: function(sort) {
      if (this.sortBy === sort) {
        return;
      }
      this.sortBy = sort;
      this.updateRangeObj();
    },
    getSortBy: function() {
      return this.sortBy;
    },
  });

  return RangeModel;
});