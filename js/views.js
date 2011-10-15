var CalendarListSelectOptionItem = Backbone.View.extend({
    tagName: 'option',
    initialize: function() {
    },
    render: function() {
        $(this.el).html(this.model.getTitle());
		$(this.el).attr("value", this.model.cid);
        return this;
    }
});

var RangeChangeBtns = Backbone.View.extend({
    tagName: 'div',
    initialize: function() {
    },
	updateView: function(model, value) {
		//TODO optimize
		switch (value) {
			case "day":
				$(this.el).html('<a href="" id="prev">PREV</a> || <a href="" id="reset">RESET to today</a> || <a href="" id="next">NEXT</a>');
				break;
			case "week":
				$(this.el).html('<a href="" id="prev">PREV</a> || <a href="" id="reset">RESET to this week</a> || <a href="" id="next">NEXT</a>');
				break;
			case "month":
				$(this.el).html('<a href="" id="prev">PREV</a> || <a href="" id="reset">RESET to this month</a> || <a href="" id="next">NEXT</a>');
				break;
			case "year":
				$(this.el).html('<a href="" id="prev">PREV</a> || <a href="" id="reset">RESET to this year</a> || <a href="" id="next">NEXT</a>');
				break;
			case "total":
				$(this.el).html('');
				break;
		}
	},
    render: function() {
        $(this.el).html('<a href="" id="prev">PREV</a> || <a href="" id="reset">RESET</a> || <a href="" id="next">NEXT</a>');
        return this;
    }
});



var CalendarSelectList = Backbone.View.extend({
    tagName: 'select',

    events: {
        'change': 'removePleaseSelect'
    },

	removePleaseSelect: function(evt) {
		$(this.el).find("#pleaseSelect").remove();		
	},

    initialize: function() {
    },

	updateView: function(model, value) {
		$(this.el).val(value.cid);	
	},

    render: function() {
		$(this.el).attr("id", "calList");
		$(this.el).append("<option value='' selected='selected' id='pleaseSelect'>Please select calendar</option>");
		_(this.model.models).each(function(item) {
		    var optionItem = new CalendarListSelectOptionItem({
		        model: item
		    });

		    $(this.el).append(optionItem.render().el);
		},
		this);		
        return this;
    }
});

var Output = Backbone.View.extend({
    tagName: 'div',
	
    initialize: function() {
    },

	updateView: function(data) {
		//console.log(data);
        var hours = data.hours;
		var rangeObj = data.range;
        var html = hours + "<br/>";

        if (rangeObj.type === "day") {
            html += rangeObj.start.toString('dddd, MMMM d, yyyy');
        } else if (rangeObj.type === "week") {
            html += rangeObj.start.toString('dddd, MMMM d, yyyy') + " - " + rangeObj.end.toString('dddd, MMMM d, yyyy');
        } else if (rangeObj.type === "month") {
            html += rangeObj.start.toString('MMMM, yyyy');
        } else if (rangeObj.type === "year") {
            html += rangeObj.start.toString('dddd, MMMM d, yyyy') + " - " + rangeObj.end.toString('dddd, MMMM d, yyyy');
        }

        $(this.el).html(html);
	},

    render: function() {
        return this;
    }
});

var RangeSelectList = Backbone.View.extend({
    tagName: 'select',
	
    initialize: function() {
    },

	updateView: function(model, value) {
		$(this.el).val(value);	
	},

    render: function() {
		$(this.el).attr("id", "rangeList");
		$(this.el).append("<option value='day'>Day</option>");
		$(this.el).append("<option value='week'>Week</option>");
		$(this.el).append("<option value='month'>Month</option>");
		$(this.el).append("<option value='year'>Year</option>");
		$(this.el).append("<option value='total'>Total</option>");
        return this;
    }
});

var CalendarPrevNextBtn = Backbone.View.extend({
    tagName: 'a',
    initialize: function() {
    },
	updateView: function(model, value) {
		if(value) {
			$(this.el).css("color", "black");
		} else {
			$(this.el).css("color", "grey");
		}
	},
    render: function() {
        $(this.el).html(this.options.label.toUpperCase());
		$(this.el).attr("id", this.options.label);
		$(this.el).attr("href", "");
        return this;
    }
});