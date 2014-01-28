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
      "change #optionsRadios1": "changeRadio1",
      "change #optionsRadios2": "changeRadio2"
    },
    initialize: function() {
      this.model.bind("change:range", this.update, this);
    },
    render: function() {
      this.$el.html(this.template({checked:this.model.getWeekStart()}));
      this.$el.hide();
      return this.$el;
    },
    changeRadio1: function(){
      this.model.updateWeekStart("sunday");
    },
    changeRadio2: function(){
      this.model.updateWeekStart("monday");
    },
    update: function(model, value) {
      if(value === "week") {
        this.$el.show();
      } else {
        this.$el.hide();
      }
    }
  });

  return Options;
});