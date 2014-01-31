define([
    "jquery",
    "backbone",
    "underscore",
    "text!app/templates/output.html",
    "bootstrap-collapse",
    "bootstrap-transition"
  ],
  function ($, Backbone, _, outputTmpl) {

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

  var Output = Backbone.View.extend({
    template: _.template(outputTmpl),
    detailsShown: false,
    initialize: function() {
      this.model.bind("viewUpdate", this.updateView, this);
    },
    render: function() {
      this.updateView();
      return this.$el;
    },
    updateView: function() {
      var calendar = this.model.selectedCalendar;

      // waiting for user to select calendar
      if(!calendar) {
        return;
      }

      if(!calendar.isSynced()) {
        var spinnerContainer = $("<div id='spinnerContainer' style='position:relative; left:150px; top:40px;'></div>");
        var spinner = spinnerContainer.spin(spinnerOptions);
        this.$el.html(spinnerContainer);
        return;
      }

      var data = calendar.getHours(this.model.selectedRange.getRangeObj());

      var hours = Math.round(data.total*100)/100,
        rangeObj = this.model.getSelectedRange(),
        range = "",
        $showDetails;


      if (rangeObj.type === "day") {
        range = rangeObj.start.format("dddd, MMMM D, YYYY");
      } else if (rangeObj.type === "week") {
        range = rangeObj.start.format("DD.MM.YYYY") + " - " + rangeObj.end.format("DD.MM.YYYY");
      } else if (rangeObj.type === "month") {
        range = rangeObj.start.format("MMMM, YYYY");
      } else if (rangeObj.type === "year") {
        range = rangeObj.start.format("YYYY");
      }

      this.$el.html(this.template({
        hours: hours,
        projects: data.projects,
        range: range
      }));

      // add listener onto details collapse thingy to save state
      $showDetails = this.$("#showDetails");
      $showDetails.on("show", $.proxy(this.onDetailsShown, this));
      $showDetails.on("hide", $.proxy(this.onDetailsHidden, this));
      if (this.detailsShown) {
        $showDetails.collapse("show");
      }
    },
    show: function() {
      this.$el.show();
    },
    onDetailsShown: function() {
      this.detailsShown = true;
    },
    onDetailsHidden: function() {
      this.detailsShown = false;
    }
  });

  return Output;
});