var calendersLi = "<div>"
+	"<div><a href='${eventFeedLink}'>${title}</a></div>"
+"</div>";
$.template( "calendersLi", calendersLi);

var calendersOpt = "<option value='${eventFeedLink}'>${title}</option>"
$.template( "calendersOpt", calendersOpt);