/*global CalendarsCollection:true */

describe("CalendarsCollection", function() {

	var xhr,
		requests,
		responses = {},
		defaultStatus = 200,
		jsonHeader = {"Content-Type": "application/json"};

	before(function(){

		xhr = sinon.useFakeXMLHttpRequest();
		requests = [];

		xhr.onCreate = function (xhr) {
			requests.push(xhr);
			setTimeout(function(){
				var r = responses[xhr.url];
				if(!r) {
					throw new Error("Error: response not set " + xhr.url);
				}

				var status = r.status || defaultStatus;
				var headers = r.headers || jsonHeader;

				xhr.respond(status, headers, r.body);
			}, 1);
		};
	});

	//FIXME implement
	xit('should error', function (done) {

		responses = {
			"https://www.googleapis.com/calendar/v3/users/me/calendarList":{status:404, body:null}
		};

		var calendarsCollection = new CalendarsCollection();
		calendarsCollection.fetch();
		calendarsCollection.bind('reset', function(data){
			expect(data.length).to.be(6);
			done();
		}, this);
	});

	it('should fetch calendar list', function (done) {

		var items = [
			{summary:"cal1", id:"1"},
			{summary:"cal2", id:"2"},
			{summary:"cal3", id:"3"}
		];

		responses = {
			"https://www.googleapis.com/calendar/v3/users/me/calendarList":{body:JSON.stringify({items:items})}
		};

		var calendarsCollection = new CalendarsCollection();
		calendarsCollection.fetch();
		calendarsCollection.bind('reset', function(data){
			expect(data.length).to.be(3);
			done();
		}, this);
	});

});