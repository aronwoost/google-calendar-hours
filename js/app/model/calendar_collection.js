define([
    "backbone",
    "app/model/calendar_model"
  ],
  function (Backbone, CalendarModel) {

  "use strict";

  var CalendarsCollection = Backbone.Collection.extend({
    model: CalendarModel,
    url: "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    parse: function(response) {
      return response.items;
    }
  });

  return CalendarsCollection;
});