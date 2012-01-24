function getURLParameter(name, searchOrHash) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function auth() {
    var clientId = "502172359025.apps.googleusercontent.com";
    var callbackUrl = "http://aronwoost.github.com/google-calendar-hours/auth.html";
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
            'click #changeRange a#prev': 'changeRangePrev',
            'click #changeRange a#reset': 'changeRangeReset',
            'click #changeRange a#next': 'changeRangeNext'
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

        changeRangePrev: function(evt) {
            evt.preventDefault();
            this.model.get("selectedRange").changeRange( - 1);
        },

        changeRangeReset: function(evt) {
            evt.preventDefault();
            this.model.get("selectedRange").changeRange(0);
        },

        changeRangeNext: function(evt) {
            evt.preventDefault();
            this.model.get("selectedRange").changeRange(1);
        },

        initialize: function() {

            this.iceMode = getURLParameter("iceMode");

			this.drawUi();
			
            //this.model.bind('calendarListComplete', this.drawCalendarList, this);
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

            // $(this.el).find("#calendars").html("<a href='' id='connect'>Connect with Google Calendar</a>");
            $("#intro").show();
            $("#app").hide();            
        },

        apiTokenComplete: function(model, resp) {
            //console.log("apiTokenComplete");
            //console.log(arguments);

            doAjaxSetup(model.get("accessToken"));
            this.model.fetch();
        },

		calendarListError: function(collection) {
			if(this.apiTokenModel.hasApiToken()) {
				$(this.el).find("#calendars").html("There was a problem with the Google Authentication<br/><a href='' id='connect'>Reconnect with Google Calendar</a>");
			} else {
				//TODO other msg here?
				$(this.el).find("#calendars").html("There was a problem with the Google Authentication<br/><a href='' id='connect'>Reconnect with Google Calendar</a>");
			}
		},

        drawUi: function(collection) {
			
            /*
			// prev btn
			var prevBtn = new CalendarPrevNextBtn({label: "Prev"});
			this.model.bind('change:hasPrevItem', prevBtn.updateView, prevBtn);
			
            $(this.el).find("#calendars").append(prevBtn.render().el);
			*/

			// calendar select list 
			var calendarSelectList = new CalendarSelectList();
			//var calendarSelectList = new CalendarSelectList({model:this.model.get("calendarsCollection")});
            this.model.bind("change:selectedCalendar", calendarSelectList.updateView, calendarSelectList);
            this.model.get("calendarsCollection").bind("reset", calendarSelectList.calendarsReceived, calendarSelectList);
			$(this.el).find("#calendars").append(calendarSelectList.render().el);
			
            /*
			// next btn
			var nextBtn = new CalendarPrevNextBtn({label: "Next"});
			this.model.bind('change:hasNextItem', nextBtn.updateView, nextBtn);
			
            $(this.el).find("#calendars").append(nextBtn.render().el);
			*/

			//change range selectlist
			var rangeSelectList = new RangeSelectList();
			this.model.get("selectedRange").bind('change:range', rangeSelectList.updateView, rangeSelectList);
            $(this.el).find("#range").append(rangeSelectList.render().el);
            rangeSelectList.updateView(null, this.model.get("selectedRange").get("range"));
			
			//change range btns
			var rangeChangeBtns = new RangeChangeBtns();
			this.model.get("selectedRange").bind('change:range', rangeChangeBtns.updateView, rangeChangeBtns);
            $(this.el).find("#changeRange").append(rangeChangeBtns.render().el);
			
			//output
			var output = new Output();
			this.model.bind('updateOutput', output.updateView, output);
            $(this.el).find("#output").append(output.render().el);

            $("#intro").hide();
            $("#app").show();
        },
		
        selectedCalendarChanged: function(m, collection) {
            $(this.el).find("#range").css("display", "block");
            $(this.el).find("#changeRange").css("display", "block");
            $(this.el).find("#output").css("display", "block");
        }
    });

    var appModel = new AppModel();
    var app = new AppView({model: appModel});
});