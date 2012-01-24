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
    $.ajaxSetup({ beforeSend : function(xhr, settings){ 
        settings.url += "?oauth_token=" + token + "&alt=jsonc";
    }});
}