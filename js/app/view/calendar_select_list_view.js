define([
    "backbone",
    "underscore",
    "text!app/templates/calendar_select_list.html",
    "text!app/templates/calendar_list_select_option_item.html",
    "spin"
  ],
  function (Backbone, _, calendarSelectListTmpl, calendarListSelectOptionItemTmpl) {

  "use strict";

  var spinnerOptions = {
    lines: 12, // The number of lines to draw
    length: 1, // The length of each line
    width: 4, // The line thickness
    radius: 10, // The radius of the inner circle
    color: "#000", // #rgb or #rrggbb
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false // Whether to use hardware acceleration
  };

  var CalendarSelectList = Backbone.View.extend({
    id:"calendars",
    template: _.template(calendarSelectListTmpl),
    optionTmpl: _.template(calendarListSelectOptionItemTmpl),
    events: {
      "change select": "calendarChanged"
    },
    initialize: function(){
      this.model.get("calendarsCollection").bind("sync", this.calendarsReceived, this);
      this.model.bind("calendarSelectionChanged", this.updateView, this);
      this.model.bind("calendarLoadingStart", this.updateView, this);
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
      collection.each(function(item) {
        this.$el.find("select").append(this.optionTmpl({value:item.id, text:item.getTitle()}));
      }, this);
    },
    calendarChanged: function(evt) {
      evt.preventDefault();
      evt.stopPropagation(); // TODO remove
      this.model.setSelectedCalendarById(evt.target.value);
    }
  });

  return CalendarSelectList;
});