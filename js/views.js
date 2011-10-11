/* VIEWS */

var CalendarListSelectOptionItem = Backbone.View.extend({
    tagName: 'option',
    // name of (orphan) root tag in this.el
    initialize: function() {
        _.bindAll(this, 'render');
        // every function that uses 'this' as the current object should be in here
    },
    render: function() {
        $(this.el).html(this.model.getTitle());
		$(this.el).attr("value", this.model.cid);
        return this;
        // for chainable calls, like .render().el
    }
});