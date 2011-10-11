/* SYNC */

var TokenSync = function(method, model, resp){ 
	console.log("TokenSync()");
	console.log(arguments);
	console.log(model.url);
	//success();
	
	var lsAuth = sessionStorage.getItem("auth");
	if(lsAuth) {
		resp.success(JSON.parse(lsAuth));
	} else {
		resp.error({msg:"noToken"});
	}
}

function overrideSync(token) {
	var superSync = Backbone.sync;
	Backbone.sync = function(method, model, options){ 
		console.log("sync()");
		console.log(arguments);
		console.log(model.url);
		model.url += "?token="+token;
		superSync(method, model, options);
	}
}