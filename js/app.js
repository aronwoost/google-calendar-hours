$(function() {

    /* APP */

    var AppView = Backbone.View.extend({
        el: $("body"),

        events: {
            'change select#calList': 'calendarSelectlistChanged',
            'change select#rangeList': 'rangeSelected',
            'click a#connect': 'connectWithGoogle',
            'click a#prev': 'changeRangePrev',
            'click a#reset': 'changeRangeReset',
            'click a#next': 'changeRangeNext'
        },

        calendarSelectlistChanged: function(evt) {
            this.model.setSelectedCalendarByIndex(evt.target.selectedIndex);
        },

        rangeSelected: function(evt) {
            this.model.setSelectedRangeByIndex(evt.target.selectedIndex);
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
            this.model.bind('calendarListComplete', this.drawCalendarList, this);
            this.model.bind('change:selectedCalendar', this.selectedCalendarChanged, this);
            this.model.get("selectedRange").bind('change:rangeObj', this.selectedCalendarChanged, this);
            //appModel.fetch();
            
			var apiTokenModel = new ApiTokenModel();
            apiTokenModel.bind('error', this.apiTokenError, this);
            apiTokenModel.bind('change', this.apiTokenComplete, this);
            apiTokenModel.fetch();
        },

        apiTokenError: function(model, resp) {
            console.log("apiTokenError");
            console.log(arguments);
            //$(this.el).find("#calendars").html("<a href='' id='connect'>Connect with Google Calendar</a>");
			this.model.fetch();
        },

        apiTokenComplete: function(model, resp) {
            console.log("apiTokenComplete");
            console.log(arguments);

            overrideSync(model.get("accessToken"));

            this.model.fetch();
        },

        drawCalendarList: function(collection) {
            $(this.el).find("#calendars").html("<select name='list' id='calList'></select>");
            _(collection.models).each(function(item) {
                var optionItem = new CalendarListSelectOptionItem({
                    model: item
                });

                $(this.el).find("#calList").append(optionItem.render().el);
            },
            this);
        },

        selectedCalendarChanged: function(model, collection) {

            $(this.el).find("#range").css("display", "block");
            $(this.el).find("#changeRange").css("display", "block");
            $(this.el).find("#output").css("display", "block");

            var rangeObj = this.model.getSelectedRange();
            console.log(rangeObj);
            var hours = this.model.get("selectedCalendar").getHours(rangeObj);

            var html = hours + "<br/>";

            if (rangeObj.type === "day") {
                html += rangeObj.start.toString('dddd, MMMM d, yyyy');
            } else if (rangeObj.type === "week") {
                html += rangeObj.start.toString('dddd, MMMM d, yyyy') + " - " + rangeObj.end.toString('dddd, MMMM d, yyyy');
            } else if (rangeObj.type === "month") {
                html += rangeObj.start.toString('MMMM, yyyy');
            } else if (rangeObj.type === "year") {
                html += rangeObj.start.toString('dddd, MMMM d, yyyy') + " - " + rangeObj.end.toString('dddd, MMMM d, yyyy');
            }

            $(this.el).find("#output").html(html);
        }

    });


    var appModel2 = new AppModel();
    var app = new AppView({model: appModel2});
});