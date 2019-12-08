define([
    "backbone",
    "underscore",
    "text!app/templates/range_change_btn.html"
  ],
  function (Backbone, _, rangeChangeBtns) {

  "use strict";

  var btnLabel = {
    day: "to today",
    week: "to this week",
    month: "to this month",
    year: "to this year"
  };

  var RangeChangeBtns = Backbone.View.extend({
    className: "range-change-btns btn-group",
    template: _.template(rangeChangeBtns),
    events: {
      "click a": "changeRange"
    },
    initialize: function() {
      this.model.bind("change:range", this.update, this);
    },
    render: function() {
      this.update();
      return this.$el;
    },
    update: function() {
      var value = this.model.get("range");

      this.$el.html(this.template({
        hide: value === "custom" || value == "total",
        to: btnLabel[value] || ""
      }));
    },
    changeRange: function(evt) {
      var change = parseInt(this.$(evt.target).data("change"), 10);

      evt.preventDefault();

      this.model.changeRange(change);
    }
  });

  return RangeChangeBtns;
});