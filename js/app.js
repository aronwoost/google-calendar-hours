function getURLParameter(name, searchOrHash) {
	return decodeURI(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	);
}

function auth() {
	var clientId = "502172359025.apps.googleusercontent.com";
	var callbackUrl = location.href + "auth.html";
	var scope = "https://www.google.com/calendar/feeds/";

	var regUrl = "https://accounts.google.com/o/oauth2/auth?client_id="+clientId+"&redirect_uri="+callbackUrl+"&scope="+scope+"&response_type=token";

	console.log(regUrl);

	window.location = regUrl;    
};

$(function() {

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

		initialize: function() {

			this.iceMode = getURLParameter("iceMode");

			this.drawUi();
			
			this.model.bind('calendarListComplete', this.hideCalendarListSpinner, this);
			this.model.bind('calendarLoadingStart', this.showCalendarSpinner, this);
			this.model.bind('connectError', this.connectError, this);

			this.model.bind('calendarListError', this.calendarListError, this);
			this.model.bind('change:selectedCalendar', this.selectedCalendarChanged, this);
			this.model.get("selectedRange").bind('change:rangeObj', this.selectedCalendarChanged, this);
			//appModel.fetch();
			
			this.apiTokenModel = new ApiTokenModel();
			this.apiTokenModel.bind('error', this.apiTokenError, this);
			this.apiTokenModel.bind('change', this.apiTokenComplete, this);
			this.apiTokenModel.fetch();
		},

		apiTokenError: function(model, resp) {
			console.log("apiTokenError");
			console.log(arguments);

			$("#intro").show();
			$("#app").hide();            
		},

		apiTokenComplete: function(model, resp) {
			doAjaxSetup(model.get("accessToken"));
			this.model.fetch();
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
			$(this.el).find("#calendars").append(calendarSelectList.render().el);

			//change range selectlist
			var rangeSelectList = new RangeSelectList({model:this.model.get("selectedRange")});
			$(this.el).find("#range").append(rangeSelectList.render().el);
			rangeSelectList.update(null, this.model.get("selectedRange").get("range"));
			
			//change range btns
			var rangeChangeBtns = new RangeChangeBtns({model:this.model.get("selectedRange")});
			$(this.el).find("#changeRange").append(rangeChangeBtns.render().el);
			
			//output
			this.output = new Output();
			this.model.bind('updateOutput', this.output.updateView, this.output);
			$(this.el).find("#output").append(this.output.render().el);
			
			//output
			this.options = new Options({model:this.model.get("selectedRange")});
			// this.model.bind('updateOutput', this.output.updateView, this.output);
			$(this.el).find("#options").append(this.options.render().el);

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

	var appModel = new AppModel();
	var app = new AppView({model: appModel});
});