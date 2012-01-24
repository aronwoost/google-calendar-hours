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

//TODO override needed, since ?callback="" is supported natively
function overrideSync(token) {
    var superSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {

        //console.log("sync()");
        console.dir(model);
        //model.url += "?oauth_token="+token+"&alt=jsonc";
        //superSync(method, model, options);

        switch (method) {
        	case "read":
                if(!token) {
                    var testFile;

                    if(model.url === "https://www.google.com/calendar/feeds/default/owncalendars/full") {
                        dummyFile = "/calendars.json";
                    } else {
                        dummyFile = "/test.json";
                    }

                    $.ajax({
                        type: "GET",
                        url: dummyFile,
                        dataType: "json",
                        success: function(data){
                            options.success(data);
                        }
                    });                    
                } else {
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
                }
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

//http://stackoverflow.com/questions/7785079/how-use-token-authentication-with-rails-devise-and-backbone-js	

/*

A quick-and-dirty solution would be to "inhere" the Backbone.sync function.

Like this:

    // call this from (i.e) Player.authenticate 
    function overrideSync(token) {
        var superSync = Backbone.sync;
        Backbone.sync = function(method, model, options) {
            model.url += "?token="+token;
            superSync(method, model, options);
    	}
    }

Note, that the token is added to the model url. So if you fetch the model/collection again, another token is appended to the url (which might lead to unexpected results).

*/
/*

function overrideSync(token) {
    var superSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        model.url += "?token="+token;
        superSync(method, model, options);
	}
}

*/