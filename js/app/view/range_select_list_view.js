define([
    "backbone",
    "underscore",
    "text!app/templates/range_select_list.html"
  ],
  function (Backbone, _, rangeSelectListTmpl) {

  "use strict";

  var RangeSelectList = Backbone.View.extend({
    template: _.template(rangeSelectListTmpl),
    events:{
      "change select#rangeList": "rangeSelected"
    },
    initialize: function() {
      this.model.bind("change:range", this.update, this);
    },
    render: function() {
      this.$el.hide();
      this.$el.append(this.template());
      return this.$el;
    },
    update: function(model, value) {
      if(!value) {
        return;
      }
      this.$el.show();
      this.$el.find("#rangeList").val(value);
    },
    rangeSelected: function(evt) {
      this.model.updateRangeByIndex(evt.target.selectedIndex);
    },
    show:function(){
      this.$el.show();
    }
  });

  return RangeSelectList;
});