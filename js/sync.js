/* SYNC */

var TokenSync = function(method, model, resp) {
    var lsAuth = sessionStorage.getItem("auth");
    if (lsAuth) {
        resp.success(JSON.parse(lsAuth));
    } else {
        resp.error({
            msg: "noToken"
        });
    }
}

function doAjaxSetup(token) {
    $.ajaxSetup({
        beforeSend: function(xhr, settings){ 
            settings.url += "&oauth_token=" + token + "";
        }
    });
}

var GchSync = function (method, model, options) {
    options.timeout = 10000; // required, or the application won't pick up on 404 responses
    options.dataType = "jsonp";
    return Backbone.sync(method, model, options);
};