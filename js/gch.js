$(document).ready(function(){
	
	var authObj = sessionStorage.getItem("auth");
	
	if(authObj) {
		var authJson = JSON.parse(authObj);
		console.dir(authJson);
	}
	
	$("#main").find("#auth").click(function(event){
		event.preventDefault();
		auth();
	});
});

function auth() {
	
	var clientId = "502172359025.apps.googleusercontent.com";
	var callbackUrl = "http://aronwoost.github.com/google-calendar-hours/auth.html";
	var scope = "https://www.google.com/calendar/feeds/";
	
	var regUrl = "https://accounts.google.com/o/oauth2/auth?client_id="+clientId+"&redirect_uri="+callbackUrl+"&scope="+scope+"&response_type=token";
	
	console.log(regUrl);
	
	window.location = regUrl;
};