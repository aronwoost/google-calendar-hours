define([
    "backbone"
  ],
  function (Backbone) {

  "use strict";

  var endpointUrl = "https://www.googleapis.com/calendar/v3/calendars/:id/events?singleEvents=true&maxResults=2500";

  var EventsCollection = Backbone.Collection.extend({
    model: Backbone.Model,
    initialize:function(models, options){
      this.bind("sync", this.synced, this);
      this.originalUrl = endpointUrl.split(":id").join(options.calendarId);
      this.url = this.originalUrl;
    },
    parse: function(response) {
      return response.items;
    },
    synced:function(collection, response) {
      var nextPageToken = response.nextPageToken;
      if(nextPageToken){
        this.url = this.originalUrl + "&pageToken=" + nextPageToken;
        this.fetch({remove: false});
      } else {
        this.trigger("eventsReceived", this);
      }
    }
  });

  return EventsCollection;
});