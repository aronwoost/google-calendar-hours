$(document).ready(function(){
	
	/*
	var d1 = Date.today();
	var d2 = Date.today().add(1).days();
	console.log(d1);
	console.log(d2);
	
	return;
	*/
	
	if(getURLParameter("debugToken", location.search) != "null") {
		console.log("!= null");
		sessionStorage.setItem("auth", JSON.stringify({accessToken:getURLParameter("debugToken", location.search)}));
	}
	
	var authObj = sessionStorage.getItem("auth");

	if(authObj) {
		var authJson = JSON.parse(authObj);
		console.dir(authJson.accessToken);
		
		fetch(authJson.accessToken);
	}
	
	$("#main").find("#auth").click(function(event){
		event.preventDefault();
		auth();
	});
});

var calenders;

function fetch(token) {
	$.ajax({
		type: "GET",
		url: "https://www.google.com/calendar/feeds/default/owncalendars/full?oauth_token="+token+"&alt=jsonc",
		dataType: "json",
		success: function (data) {
			console.dir(data);
			calenders = data.data.items;
			
			$("#calendars").find("select").html( $.tmpl("calendersOpt", calenders) );
			$("#calendars").find("select").change(function(){
				var calUrl = $(this).val();
				console.log(calUrl);
				fetchCalendar(calUrl, token);
			});
			/*$("#calendars").find("a").click(function(event){
				event.preventDefault();
				fetchCalendar($(this).attr("href"), token)
			});*/	
		}
	});	
}

function fetchCalendar(url, token) {
	$.ajax({
		type: "GET",
		url: url + "?oauth_token="+token+"&alt=jsonc",
		dataType: "json",
		success: function (data) {
			console.dir(data);
			
			//var items = data.data.items;
			
			var whenArray = [];
			for (var i=0; i < data.data.items.length; i++) {
				var item = data.data.items[i];
				whenArray = whenArray.concat(item.when);
			};
			console.log(whenArray);
			//var testDate = new Date(whenArray[0].start);
			//console.log(testDate.getTime());
			//console.log(testDate);
			//processDates(whenArray);
			
			$("#range").find("select").change(function(){
				var range = $(this).val(),
					d1, 
					d2, 
					filtered,
					itemDataStart,
					itemDataEnd;
				
				if(range === "today") {
					console.log("today");
					
					d1 = Date.today().getTime();
					d2 = Date.today().add(1).days().getTime();
					
					filtered = whenArray.filter(function(item) {
						itemDataStart = new Date(item.start).getTime();
						itemDataEnd = new Date(item.end).getTime();
						
						if(itemDataStart > d1 && itemDataEnd < d2) {
							return true;
						} else {
							return false;
						}
					});
				} else if(range === "week") {
					console.log("week");
					
					d1 = Date.today().moveToDayOfWeek(0, -1);
					d2 = Date.today().moveToDayOfWeek(0);
					
					filtered = whenArray.filter(function(item) {
						itemDataStart = new Date(item.start).getTime();
						itemDataEnd = new Date(item.end).getTime();
						
						if(itemDataStart > d1 && itemDataEnd < d2) {
							return true;
						} else {
							return false;
						}
					});					
				} else if(range === "month") {
						console.log("month");

						d1 = Date.today().moveToFirstDayOfMonth();
						d2 = Date.today().moveToLastDayOfMonth().add(1).days();
						
						console.log(d1, d2);

						filtered = whenArray.filter(function(item) {
							itemDataStart = new Date(item.start).getTime();
							itemDataEnd = new Date(item.end).getTime();

							if(itemDataStart > d1 && itemDataEnd < d2) {
								return true;
							} else {
								return false;
							}
						});					
					}
				
				console.dir(filtered);
				processDates(filtered)
				
				//fetchCalendar(calUrl, token);
			});			
		}
	});	
}

function processDates(datesArray) {
	var totalHours = 0;
	for (var i=0; i < datesArray.length; i++) {
		var date = datesArray[i];
		var start = new Date(date.start);
		var end = new Date(date.end);
		var diff = end - start;
		var hours = diff/1000/60/60;
		totalHours += hours;
		console.log("diff: "+diff+" sec: "+(diff/1000)+" min: "+(diff/1000/60)+" std: "+(diff/1000/60/60));
	};
	console.log("total hours: "+totalHours);
	console.log("days: "+(totalHours/8));
};

function auth() {
	
	var clientId = "502172359025.apps.googleusercontent.com";
	var callbackUrl = "http://aronwoost.github.com/google-calendar-hours/auth.html";
	var scope = "https://www.google.com/calendar/feeds/";
	
	var regUrl = "https://accounts.google.com/o/oauth2/auth?client_id="+clientId+"&redirect_uri="+callbackUrl+"&scope="+scope+"&response_type=token";
	
	console.log(regUrl);
	
	window.location = regUrl;
};

function getURLParameter(name, searchOrHash) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(searchOrHash)||[,null])[1]
    );
}