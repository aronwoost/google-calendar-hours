/*global Backbone:false, _:false, $:false */

var spinnerOptions = {
	lines: 12, // The number of lines to draw
	length: 1, // The length of each line
	width: 4, // The line thickness
	radius: 10, // The radius of the inner circle
	color: '#000', // #rgb or #rrggbb
	speed: 1, // Rounds per second
	trail: 60, // Afterglow percentage
	shadow: false, // Whether to render a shadow
	hwaccel: false // Whether to use hardware acceleration
};

var btnLabel = {
	day: "to today",
	week: "to this week",
	month: "to this month",
	year: "to this year"
};

var IntroView = Backbone.View.extend({
	template: undefined,
	events:{
		'click a#authBtn': 'connectWithGoogle'
	},
	id:"intro",
	initialize:function(){
		this.$el.css("width", "100%");
		this.template = _.template($('#tmplIntro').html());
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

var AppView = Backbone.View.extend({
	attributes:{
		id:"app"
	},
	initialize: function() {
		this.model.bind('calendarLoadingStart', this.calendarLoadingStart, this);

		// calendar select list
		var calendarSelectList = new CalendarSelectList({model:this.model});
		this.$el.append(calendarSelectList.render());

		//change range selectlist
		this.rangeSelectList = new RangeSelectList({model:this.model.get("selectedRange")});
		this.$el.append(this.rangeSelectList.render());

		//change range btns
		this.rangeChangeBtns = new RangeChangeBtns({model:this.model.get("selectedRange")});
		this.$el.append(this.rangeChangeBtns.render());

		//output
		this.output = new Output({model:this.model});
		this.$el.append(this.output.render());

		//options
		var options = new Options({model:this.model.get("selectedRange")});
		this.$el.append(options.render());
	},
	render:function(){
		return this.$el;
	},
	calendarLoadingStart:function(){
		this.output.showSpinner();
	},
	show:function(){
		this.$el.css("display", "block");
	},
	hide:function(){
		this.$el.css("display", "none");
	}
});

var CalendarSelectList = Backbone.View.extend({
	id:"calendars",
	template: undefined,
	events: {
		'change select': 'calendarChanged'
	},
	initialize: function(){
		this.model.get("calendarsCollection").bind("reset", this.calendarsReceived, this);
		this.model.bind("calendarSelectionChanged", this.updateView, this);
		this.model.bind("calendarLoadingStart", this.updateView, this);

		this.template = _.template($('#tmplCalenderSelectList').html());
	},
	render: function() {
		this.$el.html(this.template());
		this.$el.find("#spinnerContainer").spin(spinnerOptions);
		return this.$el;
	},
	updateView: function(cid) {
		this.$el.find("#pleaseSelect").remove();
		this.$el.find("select").val(cid);
		// seems that setting the value the first time (sometimes) doesn't work
		// this makes it sure
		if(this.$el.find("select").get(0).value===""){
			var self = this;
			setTimeout(function(){
				self.$el.find("select").val(cid);
			}, 50);
		}
	},
	calendarsReceived: function(collection) {
		this.$el.find("#spinnerContainer").remove();
		this.$el.find("select").css("display", "block");
		var compiled = _.template($('#calendarListSelectOptionItem').html());
		collection.each(function(item) {
			this.$el.find("select").append(compiled({value:item.id, text:item.getTitle()}));
		}, this);
	},
	calendarChanged: function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		this.model.setSelectedCalendarById(evt.target.value);
	}
});

var RangeSelectList = Backbone.View.extend({
	template: undefined,
	events:{
		'change select#rangeList': 'rangeSelected'
	},
	initialize: function() {
		this.model.bind('change:range', this.update, this);
		this.template = _.template($('#tmplRangeSelectList').html());
	},
	render: function() {
		this.$el.css("display", "none");
		this.$el.append(this.template());
		return this.$el;
	},
	update: function(model, value) {
		if(!value) {
			return;
		}
		this.$el.css("display", "block");
		this.$el.find("#rangeList").val(value);
	},
	rangeSelected: function(evt) {
		this.model.updateRangeByIndex(evt.target.selectedIndex);
	},
	show:function(){
		this.$el.css("display", "block");
	}
});

var RangeChangeBtns = Backbone.View.extend({
	template: undefined,
	events: {
		'click a#prev': 'changeRangePrev',
		'click a#reset': 'changeRangeReset',
		'click a#next': 'changeRangeNext'
	},
	initialize: function() {
		this.model.bind('change:range', this.update, this);
		this.template = _.template($('#rangeChangeBtns').html());
	},
	render: function() {
		this.$el.css("display", "none");
		this.$el.css("text-align", "center");
		this.$el.addClass("btn-group");
		this.$el.html(this.template({
			to: '',
			disableBtns: null
		}));
		return this.$el;
	},
	disableBtns: false,
	update: function(model, value) {
		this.$el.css("display", "block");
		var middleBtnLabel = btnLabel[value] || "";
		this.disableBtns = value === "total";
		this.$el.html(this.template({
			to: middleBtnLabel,
			disableBtns: this.disableBtns
		}));
	},
	changeRangePrev: function(evt) {
		evt.preventDefault();
		if(this.disableBtns){
			return;
		}
		this.model.changeRange(-1);
	},
	changeRangeReset: function(evt) {
		evt.preventDefault();
		if(this.disableBtns){
			return;
		}
		this.model.changeRange(0);
	},
	changeRangeNext: function(evt) {
		evt.preventDefault();
		if(this.disableBtns){
			return;
		}
		this.model.changeRange(1);
	},
	show:function(){
		this.$el.css("display", "block");
	}
});

var Output = Backbone.View.extend({
	template: undefined,
	detailsShown: false,
	initialize: function() {
		this.model.bind('updateOutput', this.updateView, this);
		this.template = _.template($('#tmplOutput').html());
	},
	render: function() {
		return this.$el;
	},
	updateView: function(data) {
		var hours = Math.round(data.hours*100)/100,
			rangeObj = data.range,
			range = "",
			$showDetails;

		if (rangeObj.type === "day") {
			range = rangeObj.start.format('dddd, MMMM d, YYYY');
		} else if (rangeObj.type === "week") {
			range = rangeObj.start.format('DD.MM.YYYY') + " - " + rangeObj.end.format('DD.MM.YYYY');
		} else if (rangeObj.type === "month") {
			range = rangeObj.start.format('MMMM, YYYY');
		} else if (rangeObj.type === "year") {
			range = rangeObj.start.format('YYYY');
		}

		this.$el.html(this.template({
			hours: hours,
			projects: data.projects,
			range: range
		}));

		// add listener onto details collapse thingy to save state
		$showDetails = this.$('#showDetails');
		$showDetails.on('show', $.proxy(this.onDetailsShown, this));
		$showDetails.on('hide', $.proxy(this.onDetailsHidden, this));
		if (this.detailsShown) {
			$showDetails.collapse('show');
		}
	},
	showSpinner: function() {
		var spinnerContainer = $("<div id='spinnerContainer' style='position:relative; left:150px; top:40px;'></div>");
		var spinner = spinnerContainer.spin(spinnerOptions);
		this.$el.html(spinnerContainer);
	},
	show: function() {
		this.$el.css("display", "block");
	},
	onDetailsShown: function(evt) {
		this.detailsShown = true;
	},
	onDetailsHidden: function(evt) {
		this.detailsShown = false;
	}
});

var Options = Backbone.View.extend({
	template: undefined,
	events: {
		'change #optionsRadios1': 'changeRadio1',
		'change #optionsRadios2': 'changeRadio2'
	},
	initialize: function() {
		this.model.bind('change:range', this.update, this);
		this.template = _.template($('#tmplOptions').html());
	},
	render: function() {
		this.$el.html(this.template({checked:this.model.getWeekStart()}));
		this.$el.css("display", "none");
		return this.$el;
	},
	changeRadio1: function(evt){
		this.model.updateWeekStart("sunday");
	},
	changeRadio2: function(evt){
		this.model.updateWeekStart("monday");
	},
	update: function(model, value) {
		if(value === "week") {
			this.$el.css("display", "block");
		} else {
			this.$el.css("display", "none");
		}
	}
});