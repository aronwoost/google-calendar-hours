define([
    "backbone",
    "underscore",
    "text!app/templates/options.html"
  ],
  function (Backbone, _, optionsTmpl) {

  "use strict";

  var Options = Backbone.View.extend({
    template: undefined,
    events: {
      "change #optionsRadios1": "changeRadio1",
      "change #optionsRadios2": "changeRadio2"
    },
    initialize: function() {
      this.model.bind("change:range", this.update, this);
      this.template = _.template(optionsTmpl);
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

  return Options;
});