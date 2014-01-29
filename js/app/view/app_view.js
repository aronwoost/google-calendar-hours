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
    attributes:{
      id:"app"
    },
    initialize: function(model, opts) {
      this.model.bind("calendarLoadingStart", this.calendarLoadingStart, this);

      // calendar select list
      var calendarSelectList = new CalendarSelectList({model:this.model});
      this.$el.append(calendarSelectList.render());

      //change range selectlist
      this.rangeSelectList = new RangeSelectList({model:this.model.get("selectedRange")});
      this.$el.append(this.rangeSelectList.render());

      //change range btns
      this.rangeChangeBtns = new RangeChangeBtns({model:this.model.get("selectedRange")});
      this.$el.append(this.rangeChangeBtns.render());

      //date picker
      var config = (opts && opts.config) || {};
      this.datePicker = new DatePicker({model:this.model.get("selectedRange")}, {config: config});
      this.$el.append(this.datePicker.render());

      //output
      this.output = new Output({model:this.model});
      this.$el.append(this.output.render());

      //options
      var options = new Options({model:this.model.get("selectedRange")});
      this.$el.append(options.render());
    },
    render:function(){
      return this.$el;
    },
    calendarLoadingStart:function(){
      this.output.showSpinner();
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