define([
    "backbone",
    "underscore"
  ],
  function (Backbone, _) {

  "use strict";

  var EventsCollection = Backbone.Collection.extend({
    model: Backbone.Model,
    initialize:function(){
      this.bind("sync", this.synced, this);
    },
    parse: function(response) {
      return response.items;
    },
    synced:function(collection, response) {
      var nextPageToken = response.nextPageToken;
      if(nextPageToken){
        if(this.originalUrl.indexOf("?") !== -1){
          this.url = this.originalUrl + "&pageToken=" + nextPageToken;
        }else{
          this.url = this.originalUrl + "?pageToken=" + nextPageToken;
        }
        this.fetch({remove: false});
      } else {
        this.trigger("eventsReceived", this);
      }
    },
    setUrl:function(url){
      this.originalUrl = url;
      this.url = url;
    }
  });

  return EventsCollection;
});