describe("RangeModel", function() {

	it('should return day range', function (done) {

		var rangeModel = new RangeModel();
		rangeModel.updateRangeByIndex(0);
		var rangeObj = rangeModel.getRangeObj();
		expect(rangeObj.type).to.be("day");
		expect(rangeObj.start.toString()).to.be(Date.today().toString());
		expect(rangeObj.end.toString()).to.be(Date.today().add(1).days().toString());
		rangeModel.changeRange(1);
		rangeObj = rangeModel.getRangeObj();
		expect(rangeObj.type).to.be("day");
		expect(rangeObj.start.toString()).to.be(Date.today().add(1).days().toString());
		expect(rangeObj.end.toString()).to.be(Date.today().add(2).days().toString());
		done();

	});

	it('should return week range (sunday)', function (done) {

		var rangeModel = new RangeModel();
		rangeModel.updateRangeByIndex(1);
		var rangeObj = rangeModel.getRangeObj();
		expect(rangeObj.type).to.be("week");
		var d1 = Date.today().moveToDayOfWeek(0, -1);
		expect(rangeObj.start.toString()).to.be(d1.toString());
		expect(rangeObj.end.toString()).to.be(d1.clone().addDays(6).addHours(23).addMinutes(59).addSeconds(59).toString());
		rangeModel.changeRange(1);
		rangeObj = rangeModel.getRangeObj();
		expect(rangeObj.type).to.be("week");
		d1 = Date.today().addWeeks(1).moveToDayOfWeek(0, -1);
		expect(rangeObj.start.toString()).to.be(d1.toString());
		expect(rangeObj.end.toString()).to.be(d1.clone().addDays(6).addHours(23).addMinutes(59).addSeconds(59).toString());
		done();

	});

	it('should return week range (monday)', function (done) {

		var rangeModel = new RangeModel();
		rangeModel.updateRangeByIndex(1);
		rangeModel.updateWeekStart("monday");
		var rangeObj = rangeModel.getRangeObj();
		expect(rangeObj.type).to.be("week");
		var d1 = Date.today().clone().monday().addWeeks(-1);
		expect(rangeObj.start.toString()).to.be(d1.toString());
		expect(rangeObj.end.toString()).to.be(d1.clone().addDays(6).addHours(23).addMinutes(59).addSeconds(59).toString());
		rangeModel.changeRange(1);
		rangeObj = rangeModel.getRangeObj();
		expect(rangeObj.type).to.be("week");
		d1 = Date.today().clone().monday();
		expect(rangeObj.start.toString()).to.be(d1.toString());
		expect(rangeObj.end.toString()).to.be(d1.clone().addDays(6).addHours(23).addMinutes(59).addSeconds(59).toString());
		done();

	});

	it('should return month range', function (done) {

		var rangeModel = new RangeModel();
		rangeModel.updateRangeByIndex(2);
		var rangeObj = rangeModel.getRangeObj();
		expect(rangeObj.type).to.be("month");
		expect(rangeObj.start.toString()).to.be(Date.today().moveToFirstDayOfMonth().toString());
		expect(rangeObj.end.toString()).to.be(Date.today().addMonths(1).moveToFirstDayOfMonth().toString());
		rangeModel.changeRange(1);
		rangeObj = rangeModel.getRangeObj();
		expect(rangeObj.type).to.be("month");
		expect(rangeObj.start.toString()).to.be(Date.today().addMonths(1).moveToFirstDayOfMonth().toString());
		expect(rangeObj.end.toString()).to.be(Date.today().addMonths(2).moveToFirstDayOfMonth().toString());
		done();

	});

	it('should return year range', function (done) {

		var rangeModel = new RangeModel();
		rangeModel.updateRangeByIndex(3);
		var rangeObj = rangeModel.getRangeObj();
		expect(rangeObj.type).to.be("year");
		expect(rangeObj.start.toString()).to.be(Date.today().moveToMonth(0, -1).moveToFirstDayOfMonth().toString());
		expect(rangeObj.end.toString()).to.be(Date.today().moveToMonth(0, 1).moveToFirstDayOfMonth().toString());
		rangeModel.changeRange(1);
		rangeObj = rangeModel.getRangeObj();
		expect(rangeObj.type).to.be("year");
		expect(rangeObj.start.toString()).to.be(Date.today().addYears(1).moveToMonth(0, -1).moveToFirstDayOfMonth().toString());
		expect(rangeObj.end.toString()).to.be(Date.today().addYears(1).moveToMonth(0, 1).moveToFirstDayOfMonth().toString());
		done();

	});

	it('should return total range', function (done) {

		var rangeModel = new RangeModel();
		rangeModel.updateRangeByIndex(4);
		var rangeObj = rangeModel.getRangeObj();
		expect(rangeObj.type).to.be("total");
		expect(rangeObj.start).to.be(0);
		expect(rangeObj.end.toString()).to.be("Infinity");
		done();

	});

});