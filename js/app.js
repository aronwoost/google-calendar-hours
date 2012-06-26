
$(function() {
	var App = Backbone.View.extend({
		el: $("body"),
		events: {
			'connectError': 'connectError'
		},
		initialize: function() {
			this.model.bind('connectError', this.connectError, this);

			this.introView = new IntroView();
			this.$el.find("#container").append(this.introView.render());

			var auth = JSON.parse(sessionStorage.getItem("auth"));

			if(auth) {
				this.appView = new AppView({model:this.model});
				this.$el.find("#container").append(this.appView.render());

				this.introView.hide();

				$.ajaxSetup({
					beforeSend: function(xhr, settings){ 
						settings.url += "?access_token=" + auth.accessToken + "";
					}
				});
				this.model.fetch();
			}
		},
		connectError: function() {
			console.log("connectError");
			this.introView.show();
			this.appView.hide();
		}
	});

	var config = {lastSelectedCalendarIndex:null, lastSelectedRangeIndex:null};
	var lsConfig = localStorage.getItem("config");
	if(lsConfig) {
		config = JSON.parse(lsConfig);
	}

	var appModel = new AppModel({config:config});
	var app = new App({model: appModel});
});