define([
    "backbone",
    "underscore",
    "text!app/templates/calendar_select_list.html",
    "spin"
  ],
  function (Backbone, _, calendarSelectListTmpl) {

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
    events: {
      "change select": "calendarChanged"
    },
    initialize: function(){
      this.model.bind("calendarSelectionChanged", this.updateView, this);
    },
    render: function() {
      this.updateView();
      this.$el.find("#spinnerContainer").spin(spinnerOptions);
      return this.$el;
    },
    updateView: function(cid) {
      var data = {
        data: {
          cid:cid,
          calendars: this.model.get("calendarsCollection").toJSON()
        }
      };
      this.$el.html(this.template(data));
    },
    calendarChanged: function(evt) {
      evt.preventDefault();
      evt.stopPropagation(); // TODO remove
      this.model.setSelectedCalendarById(evt.target.value);
    }
  });

  return CalendarSelectList;
});