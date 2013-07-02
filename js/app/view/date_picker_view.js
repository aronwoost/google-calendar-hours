define([
    "jquery",
    "backbone",
    "underscore",
    "moment",
    "daterangepicker"
  ],
  function ($, Backbone, _, moment) {

  "use strict";

  var DatePicker = Backbone.View.extend({
    config: null,
    className: "input-prepend",
    initialize: function(model, options) {
      this.config = (options && options.config);
      this.$el.hide();
      if(this.model.get("range") === "custom") {
        this.$el.show();
      }
      this.model.bind('change:range', this.update, this);
    },
    render: function() {
      var self = this;
      var input = $("<input type='text'>");
      if(this.config.customStart && this.config.customEnd) {
        input.val(moment(this.config.customStart).format("DD.MM.YYYY")+" - "+moment(this.config.customEnd).format("DD.MM.YYYY"));
      }
      input.css("width", "250px");
      this.$el.append('<span class="add-on"><i class="icon-calendar"></i></span>');
      this.$el.append(input);
      this.$el.find("input").daterangepicker({
        format: "DD.MM.YYYY"
      }, function(start, end){
        self.model.changeRange(null, {start: start, end: end});
      });
      return this.$el;
    },
    update: function(model) {
      if(model.get("range") === "custom") {
        this.$el.show();
        var input = this.$el.find("input");
        if(input.val() === "") {
          input.focus();
        }
      } else {
        this.$el.hide();
      }
    }
  });

  return DatePicker;
});