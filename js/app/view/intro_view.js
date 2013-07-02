define([
    "backbone",
    "underscore",
    "text!app/templates/intro.html"
  ],
  function (Backbone, _, introTmpl) {

  "use strict";

  var IntroView = Backbone.View.extend({
    template: undefined,
    events:{
      "click a#authBtn": "connectWithGoogle"
    },
    id:"intro",
    initialize:function(){
      this.$el.css("width", "100%");
      this.template = _.template(introTmpl);
    },
    render:function(){
      this.$el.html(this.template());
      return this.$el;
    },
    connectWithGoogle:function(evt){
      evt.preventDefault();
      evt.stopPropagation();

      var clientId = "502172359025.apps.googleusercontent.com",
        callbackUrl = location.origin + location.pathname + "auth.html",
        scope = "https://www.googleapis.com/auth/calendar.readonly";

      var reqUrl = "https://accounts.google.com/o/oauth2/auth?client_id="+clientId+"&redirect_uri="+callbackUrl+"&scope="+scope+"&response_type=token";

      window.location = reqUrl;
    },
    show:function(){
      this.$el.css("display", "block");
    },
    hide:function(){
      this.$el.css("display", "none");
    }
  });

  return IntroView;
});