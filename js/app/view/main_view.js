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
    initialize: function(model, options) {
      this.model.bind("connectSuccess", this.connectSuccess, this);

      this.introView = new IntroView();

      var auth = JSON.parse(sessionStorage.getItem("auth")),
        self = this;

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

        $(document).ajaxError(function(evt, xhr, ajax) {
          if (xhr.status === 401 || xhr.status === 403) {
            sessionStorage.removeItem("auth");
            self.introView.show();
            self.appView.hide();
          } else if(xhr.status !== 0) {
            alert("Error - "+ xhr.status +"\n\n" + ajax.url);
          }
        });

        this.model.fetch();
      } else {
        this.introView.showGoogleBtn();
      }
    },
    connectSuccess: function() {
      this.introView.hide();
      this.appView.show();
    }
  });

  return App;
});
