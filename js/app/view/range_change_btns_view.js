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
    template: _.template(rangeChangeBtns),
    events: {
      "click a#prev": "changeRangePrev",
      "click a#reset": "changeRangeReset",
      "click a#next": "changeRangeNext"
    },
    initialize: function() {
      this.model.bind("change:range", this.update, this);
    },
    render: function() {
      this.$el.css("display", "none");
      this.$el.css("text-align", "center");
      this.$el.css("margin-bottom", "9px");
      this.$el.addClass("btn-group");
      this.$el.html(this.template({
        to: "",
        disableBtns: null
      }));
      return this.$el;
    },
    disableBtns: false,
    update: function(model, value) {
      if(model.get("range") === "custom") {
        this.$el.hide();
      } else {
        this.$el.show();
      }

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
      this.$el.show();
    }
  });

  return RangeChangeBtns;
});