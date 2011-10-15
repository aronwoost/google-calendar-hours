/* SYNC */

var TokenSync = function(method, model, resp) {
    //console.log("TokenSync()");
    //console.log(arguments);
    var lsAuth = sessionStorage.getItem("auth");
    if (lsAuth) {
        resp.success(JSON.parse(lsAuth));
    } else {
        resp.error({
            msg: "noToken"
        });
    }
}

function overrideSync(token) {
    var superSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {


        //console.log("sync()");
        //console.log(model.url);
        //model.url += "?oauth_token="+token+"&alt=jsonc";
        //superSync(method, model, options);

        switch (method) {
        	case "read":
				$.jsonp({
				      "url": model.url + "?oauth_token=" + token + "&alt=jsonc&callback=?",
				      success: function(resp) {
						//console.log("success");
						//console.dir(resp);
						options.success(resp);
				      },
				      error: function(d,msg) {
				        //console.log("error");
						//console.dir(d);
						//console.log(msg);
						options.error(msg);
					}
				});
	            break;
	        case "create":
	            break;
	        case "update":
	            break;
	        case "delete":
	            break;
        }
    }
}