
function auth() {
	var clientId = "502172359025.apps.googleusercontent.com";
	var callbackUrl = location.href + "auth.html";
	var scope = "https://www.google.com/calendar/feeds/";

	var regUrl = "https://accounts.google.com/o/oauth2/auth?client_id="+clientId+"&redirect_uri="+callbackUrl+"&scope="+scope+"&response_type=token";

	window.location = regUrl;
};

$(function() {

	var config = {lastSelectedCalendarIndex:null, lastSelectedRangeIndex:null};
	var lsConfig = localStorage.getItem("config");
	if(lsConfig) {
		config = JSON.parse(lsConfig);
	}

	var AppView = Backbone.View.extend({
		el: $("body"),

		events: {
			'change select#calList': 'calendarSelectlistChanged',
			'change select#rangeList': 'rangeSelected',
			'click #calendars a#prev': 'prevCalendar',
			'click #calendars a#next': 'nextCalendar',
			'click a#connect': 'connectWithGoogle',
			'connectError': 'connectError'
		},

		initialize: function() {

			this.drawUi();
			
			this.model.bind('calendarListComplete', this.hideCalendarListSpinner, this);
			this.model.bind('calendarLoadingStart', this.showCalendarSpinner, this);
			this.model.bind('connectError', this.connectError, this);

			this.model.bind('calendarListError', this.calendarListError, this);
			this.model.bind('change:selectedCalendar', this.selectedCalendarChanged, this);
			this.model.get("selectedRange").bind('change:rangeObj', this.selectedCalendarChanged, this);
			//appModel.fetch();
			
			var auth = JSON.parse(sessionStorage.getItem("auth"));

			if(!auth) {
				$("#intro").show();
				$("#app").hide();
			} else {
				$.ajaxSetup({
					beforeSend: function(xhr, settings){ 
						settings.url += "?access_token=" + auth.accessToken + "";
					}
				});
				this.model.fetch();
			}

		},

		calendarSelectlistChanged: function(evt) {
			this.model.setSelectedCalendarByIndex(evt.target.selectedIndex);
		},

		rangeSelected: function(evt) {
			this.model.setSelectedRangeByIndex(evt.target.selectedIndex);
		},

		prevCalendar: function(evt) {
			evt.preventDefault();
			this.model.changeCalendar(-1);
		},

		nextCalendar: function(evt) {
			evt.preventDefault();
			this.model.changeCalendar(1);
		},

		connectWithGoogle: function(evt) {
			evt.preventDefault();

			var clientId = "502172359025.apps.googleusercontent.com";
			var callbackUrl = "http://aronwoost.github.com/google-calendar-hours/auth.html";
			var scope = "https://www.google.com/calendar/feeds/";

			var reqUrl = "https://accounts.google.com/o/oauth2/auth?client_id="+clientId+"&redirect_uri="+callbackUrl+"&scope="+scope+"&response_type=token";

			window.location = reqUrl;
		},

		calendarListError: function(collection) {
			$("#intro").show();
			$("#app").hide();
			//TODO tell user what went wrong
		},

		drawUi: function(collection) {
			
			var spinnerContainer = $("<div id='spinnerContainer' style='position:relative; left:20px; top:15px;'></div>");
			var spinner = spinnerContainer.spin(spinnerOptions);
			$(this.el).find("#calendars").append(spinnerContainer);

			// calendar select list 
			var calendarSelectList = new CalendarSelectList(this.model.get("selectedCalendar"));
			this.model.get("calendarsCollection").bind("reset", calendarSelectList.calendarsReceived, calendarSelectList);
			this.model.bind("calendarSelectionChanged", calendarSelectList.updateView, calendarSelectList);
			$(this.el).find("#calendars").append(calendarSelectList.render());

			//change range selectlist
			var rangeSelectList = new RangeSelectList({model:this.model.get("selectedRange")});
			$(this.el).find("#range").append(rangeSelectList.render());
			rangeSelectList.update(null, this.model.get("selectedRange").get("range"));
			
			//change range btns
			var rangeChangeBtns = new RangeChangeBtns({model:this.model.get("selectedRange")});
			$(this.el).find("#changeRange").append(rangeChangeBtns.render());
			
			//output
			this.output = new Output();
			this.model.bind('updateOutput', this.output.updateView, this.output);
			$(this.el).find("#output").append(this.output.render());
			
			//output
			this.options = new Options({model:this.model.get("selectedRange")});
			// this.model.bind('updateOutput', this.output.updateView, this.output);
			$(this.el).find("#options").append(this.options.render());

			$("#intro").hide();
			$("#app").show();
		},
		
		selectedCalendarChanged: function(m, collection) {
			$(this.el).find("#range").css("display", "block");
			$(this.el).find("#changeRange").css("display", "block");
			$(this.el).find("#output").css("display", "block");
		},

		hideCalendarListSpinner: function() {
			$(this.el).find("#spinnerContainer").remove();
		},

		showCalendarSpinner: function() {
			this.output.showSpinner();
		},

		connectError: function() {
			console.log("connectError");
			$("#intro").show();
			$("#app").hide();
		}
	});

	var appModel = new AppModel({config:config});
	var app = new AppView({model: appModel});
});