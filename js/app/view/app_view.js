define([
    "backbone",
    "underscore",
    "app/view/calendar_select_list_view",
    "app/view/range_select_list_view",
    "app/view/range_change_btns_view",
    "app/view/date_picker_view",
    "app/view/output_view",
    "app/view/options_view"
  ],
  function (Backbone, _, CalendarSelectList, RangeSelectList, RangeChangeBtns,
    DatePicker, Output, Options) {

  "use strict";

  var AppView = Backbone.View.extend({
    id: "app",
    initialize: function(model, opts) {
      var calendarSelectList = new CalendarSelectList({model:this.model});
      this.$el.append(calendarSelectList.render());

      this.config = (opts && opts.config) || {};

      this.model.bind("eventsReceived", this.updateView, this);
    },
    updateView: function() {
      var selectRange = this.model.selectedRange;

      this.model.off("eventsReceived", this.updateView, this);

      //change range selectlist
      this.rangeSelectList = new RangeSelectList({model:selectRange});
      this.$el.append(this.rangeSelectList.render());

      //change range btns
      this.rangeChangeBtns = new RangeChangeBtns({model:selectRange});
      this.$el.append(this.rangeChangeBtns.render());

      //date picker
      this.datePicker = new DatePicker({model:selectRange}, {config: this.config});
      this.$el.append(this.datePicker.render());

      //output
      this.output = new Output({model:this.model});
      this.$el.append(this.output.render());

      //options
      var options = new Options({model:selectRange});
      this.$el.append(options.render());
    },
    render:function(){
      return this.$el;
    },
    show:function(){
      this.$el.show();
    },
    hide:function(){
      this.$el.hide();
    }
  });

  return AppView;
});