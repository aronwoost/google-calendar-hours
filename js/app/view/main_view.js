define([
    "jquery",
    "backbone",
    "app/view/intro_view",
    "app/view/app_view"
  ],
  function ($, Backbone, IntroView, AppView) {

  "use strict";

  var App = Backbone.View.extend({
    el: $("body"),
    events: {
      "connectError": "connectError"
    },
    initialize: function(model, options) {
      this.model.bind('connectError', this.connectError, this);
      this.model.bind('connectSuccess', this.connectSuccess, this);

      this.introView = new IntroView();

      var auth = JSON.parse(sessionStorage.getItem("auth"));

      if(auth) {
        this.appView = new AppView({model:this.model}, {config:options.config});
        this.$el.find("#container").append(this.appView.render());

        this.introView.hide();

        $.ajaxSetup({
          beforeSend: function(xhr, settings){
            if(settings.url.indexOf("?") !== -1){
              settings.url += "&access_token=" + auth.accessToken;
            } else {
              settings.url += "?access_token=" + auth.accessToken;
            }
          }
        });
        this.model.fetch();
      } else {
        this.introView.showGoogleBtn();
      }
    },
    connectError: function(model, xhr) {
      if(xhr.status === 401) {
        this.introView.show();
        this.appView.hide();
      } else if(xhr.status !== 0) {
        alert("Error - "+ xhr.status +"\n\n" + model.url);
      }
    },
    connectSuccess: function() {
      this.introView.hide();
      this.appView.show();
    }
  });

  return App;
});
