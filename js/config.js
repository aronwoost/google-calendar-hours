require.config({
  paths:{
    jquery: "vendor/jquery-1.7.1",
    underscore: "vendor/underscore-1.4.4",
    backbone: "vendor/backbone-1.0.0",

    text: "vendor/text-2.0.7",

    moment: "vendor/moment-2.0.0",

    spin: "vendor/spin.min",

    daterangepicker: "vendor/daterangepicker",

    "bootstrap-collapse": "vendor/plugins/bootstrap-collapse",
    "bootstrap-transition": "vendor/plugins/bootstrap-transition"
  },

  shim:{
    underscore: {
      exports: "_"
    },
    backbone: {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    },
    spin: ["jquery"],
    daterangepicker: ["jquery"],
    "bootstrap-collapse": ["jquery"],
    "bootstrap-transition" :  ["jquery"]
  }
});

require(
  [
    "app/model/calendar_collection",
    "app/view/main_view"
  ],
  function (CalendarCollection, MainView) {
    var config = {lastSelectedCalendarIndex:null, lastSelectedRangeIndex:null};
    var lsConfig = localStorage.getItem("config");
    if (lsConfig) {
      config = JSON.parse(lsConfig);
    }

    var calendarCollection = new CalendarCollection(null, {config:config});
    var app = new MainView({model:calendarCollection}, {config:config});
  }
);