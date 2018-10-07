define([
    "jquery",
    "backbone",
    "underscore",
    "text!app/templates/output.html",
    "moment",
    "bootstrap-collapse",
    "bootstrap-transition"
  ],
  function ($, Backbone, _, outputTmpl, moment) {

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
      if (!calendar) {
        return;
      }

      if (!calendar.isSynced()) {
        var spinnerContainer = $("<div id='spinnerContainer' style='position:relative; left:150px; top:40px;'></div>");
        var spinner = spinnerContainer.spin(spinnerOptions);
        this.$el.html(spinnerContainer);
        return;
      }

      var rangeObj = this.model.selectedRange.getRangeObj();
      var data = calendar.getHours(rangeObj);
      var hours = Math.round(data.total*100)/100;
      var range = "";
      var $showDetails;

      var downloadLink = "";
      var filename = "";

      if (rangeObj.sortBy === "date") {
        downloadLink = "Start,End,Title,Hours\n";
        
        for (var i = 0; i < data.projects.length; i++) {
          downloadLink += moment(data.projects[i].date).format("DD.MM.YYYY HH:mm") + ",";
          downloadLink += moment(data.projects[i].end).format("DD.MM.YYYY HH:mm") + ",";
          downloadLink += "\"" + data.projects[i].label + "\",";
          downloadLink += data.projects[i].hours;
          downloadLink += "\n";
        }

        downloadLink = this._getBlobUrl(downloadLink);
        filename = calendar.get("summary").replace("\"","") + "_" + rangeObj.start.format("MMMM_YYYY") + "_(" + moment().format("YYYYMMDDHHmmss") + ").csv";
      }

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
        range: range,
        sortBy: rangeObj.sortBy,
        outputDate: this.outputDate,
        downloadLink: downloadLink,
        filename: filename
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
    outputDate: function(date) {
      return moment(date).format("DD.MM.");
    },
    onDetailsShown: function() {
      this.detailsShown = true;
    },
    onDetailsHidden: function() {
      this.detailsShown = false;
    },
    _getBlobUrl: function(content) {
      var MIME_TYPE = "text/csv;charset=UTF-8";
      var UTF8_BOM = "\uFEFF";
      var blob = new Blob([UTF8_BOM + content], {type:MIME_TYPE});
      return window.URL.createObjectURL(blob);
    }
  });

  return Output;
});