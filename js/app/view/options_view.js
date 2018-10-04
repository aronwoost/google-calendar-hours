define([
    "backbone",
    "underscore",
    "text!app/templates/options.html"
  ],
  function (Backbone, _, optionsTmpl) {

  "use strict";

  var Options = Backbone.View.extend({
    template: _.template(optionsTmpl),
    events: {
      "change #optionsRadios1": "changeRadioStartOfTheWeek",
      "change #optionsRadios2": "changeRadioStartOfTheWeek",
      "change #optionsRadiosSortBy1": "changeRadioSortBy",
      "change #optionsRadiosSortBy2": "changeRadioSortBy"
    },
    initialize: function() {
      this.model.bind("change:range", this.update, this);
    },
    render: function() {
      this.$el.html(this.template({
        checked1: this.model.getWeekStart(),
        checked2: this.model.getSortBy(),
      }));
      
      var range = this.model.get("range");
      if (range !== "week") {
        this.$el.find("#startOfTheWeek").hide();
      }
      
      return this.$el;
    },
    changeRadioStartOfTheWeek: function(event) {
      this.model.updateWeekStart(event.currentTarget.value);
    },
    changeRadioSortBy: function(event) {
      this.model.updateSortBy(event.currentTarget.value);
    },
    update: function(model, value) {
      var $start = this.$el.find("#startOfTheWeek");
      if (value === "week") {
        $start.show();
      } else {
        $start.hide();
      }
    }
  });

  return Options;
});