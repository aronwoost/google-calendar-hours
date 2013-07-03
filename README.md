## Visit: [google-calendar-hours.com](http://google-calendar-hours.com/)
(or [aronwoost.github.io/google-calendar-hours](http://aronwoost.github.com/google-calendar-hours/))

## Testing and building
Open ```index_dev.html``` to run the non-optimized version. Every file will be loaded one by one. The redirection back from google *will not work* with ```index_dev.html```, instead use `/` to auth agains google (OAuth token will be saved in sessionStorage) and then head back to ```index_dev.html``` for testing.

To build the app use [r.js](https://github.com/jrburke/r.js/):

```
# install
npm install -g requirejs

# build
r.js -o js/build.js
```

## Stuff used
* [Backbone.js](http://backbonejs.org/)
* [Underscore.js](http://documentcloud.github.com/underscore/#)
* jQuery
* [Moment.js](http://momentjs.com/)
* [spin.js](http://fgnass.github.com/spin.js/)
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/) CSS
* [ReguireJS](http://requirejs.org/)
* [Google Calendar API v3](https://developers.google.com/google-apps/calendar/)

## Contributors
[Philipp Kyeck](https://github.com/pkyeck)

## License 

MIT