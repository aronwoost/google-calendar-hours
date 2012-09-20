/*global Calendar:true */

describe("Calendar", function() {

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

	it('should error', function (done) {

		responses = {
			"https://www.googleapis.com/calendar/v3/calendars/1/events":{status:404, body:null}
		};

		var calendar = new Calendar({summary:"cal1", id:"1"});
		calendar.fetchEvents();
		calendar.bind('connectError', function(data){
			done();
		}, this);
	});

	it('should fetch calendar list', function (done) {

		var items = [
			{name:"item1"},
			{name:"item2"},
			{name:"item3"}
		];

		responses = {
			"https://www.googleapis.com/calendar/v3/calendars/1/events":{body:JSON.stringify({items:items})}
		};

		var calendar = new Calendar({summary:"cal1", id:"1"});
		calendar.fetchEvents();
		calendar.bind('eventsReceived', function(data){
			expect(data.hasCalendarData()).to.be(true);
			expect(data.getTitle()).to.be("cal1");
			expect(data.getUrl()).to.be("1");
			expect(data.eventsCollection.length).to.be(3);
			done();
		}, this);
	});

});