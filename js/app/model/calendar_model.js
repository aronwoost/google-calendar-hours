define([
    "backbone",
    "app/model/event_collection"
  ],
  function (Backbone, EventsCollection) {

  "use strict";

  var Calendar = Backbone.Model.extend({
    initialize:function(){
      this.eventsCollection = new EventsCollection(null, {calendarId: this.id});
      this.eventsCollection.bind("eventsReceived", this.eventsReceived, this);
    },
    eventsReceived: function(){
      this.trigger("eventsReceived", this);
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
          title = item.get("summary") || "",
          name = title.toLowerCase().replace(/[^\w.]/g, ""); // TODO normalize

        itemDataStart = new Date(item.get("start").dateTime);
        itemDataEnd = new Date(item.get("end").dateTime);
        if (itemDataStart > start && itemDataEnd < end) {
          diff = new Date(item.get("end").dateTime) - new Date(item.get("start").dateTime);
          hours = diff/1000/60/60;
          totalHours += hours;

          if (typeof projects[name] === "undefined") {
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

  return Calendar;
});