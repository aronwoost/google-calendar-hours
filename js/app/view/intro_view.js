define([
    "jquery",
    "backbone"
  ],
  function ($, Backbone) {

  "use strict";

  var IntroView = Backbone.View.extend({
    el: $("#intro"),
    events:{
      "click a#authBtn": "connectWithGoogle"
    },
    connectWithGoogle:function(evt){
      evt.preventDefault();

      var clientId = "502172359025.apps.googleusercontent.com",
        callbackUrl = location.origin + location.pathname + "auth.html",
        scope = "https://www.googleapis.com/auth/calendar.readonly",
        reqUrl = "https://accounts.google.com/o/oauth2/auth?client_id="+clientId+"&redirect_uri="+callbackUrl+"&scope="+scope+"&response_type=token";

      window.location = reqUrl;
    },
    show:function(){
      this.showGoogleBtn();
      this.$el.show();
    },
    hide:function(){
      this.$el.hide();
    },
    showGoogleBtn:function(){
      this.$el.find("#authBtn").removeAttr("disabled");
      this.$el.find("#authBtn").text("Connect to Google Calendar");
    }
  });

  return IntroView;
});