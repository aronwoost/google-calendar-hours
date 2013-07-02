define([
    "backbone",
    "underscore"
  ],
  function (Backbone, _) {

  "use strict";

  var EventsCollection = Backbone.Collection.extend({
    model: Backbone.Model,
    initialize:function(){
      this.bind("add", this.added, this);
    },
    parse: function(response) {
      if(response.nextPageToken) {
        this.nextPageToken = response.nextPageToken;
      } else {
        this.nextPageToken = null;
      }
      return response.items;
    },
    reset:function(models){
      this.add(models, {silent:true});
      this.getNextPage();
    },
    added:function(){
      this.getNextPage();
    },
    /*
    Throttel this call (see underscore docs) so that the fetch is only called
    once, even though several add events are incomming.
    */
    getNextPage:_.throttle(function(){
      if(this.nextPageToken){
        if(this.originalUrl.indexOf("?") !== -1){
          this.url = this.originalUrl + "&pageToken=" + this.nextPageToken;
        }else{
          this.url = this.originalUrl + "?pageToken=" + this.nextPageToken;
        }
        this.fetch({add: true});
      } else {
        this.trigger("sync", this);
      }
    }, 0),
    setUrl:function(url){
      this.originalUrl = url;
      this.url = url;
    }
  });

  return EventsCollection;
});