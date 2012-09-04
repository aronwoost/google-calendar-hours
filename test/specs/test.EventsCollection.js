describe("EventsCollection", function() {

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

	var itemsReq1 = [
		{name:"item1"},
		{name:"item2"},
		{name:"item3"}
	];

	var itemsReq2 = [
		{name:"item4"},
		{name:"item5"},
		{name:"item6"}
	];

	responses = {
		"http://testurl":{body:JSON.stringify({nextPageToken:"123", items:itemsReq1})},
		"http://testurl?pageToken=123":{body:JSON.stringify({items:itemsReq2})}
	};

	it('should fetch event items', function (done) {
		var eventsCollection = new EventsCollection();
		eventsCollection.setUrl("http://testurl");
		eventsCollection.fetch();
		eventsCollection.bind('reset', function(data){
			expect(data.length).to.be(6);
			done();
		}, this);
	});

});