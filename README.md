## Visit: [google-calendar-hours.com](http://google-calendar-hours.com/)
(or [aronwoost.github.io/google-calendar-hours](http://aronwoost.github.com/google-calendar-hours/))

After connecting you could see something like this:

![screenshot 2019-01-05 20-10-20](https://user-images.githubusercontent.com/16663028/50728189-4ffe3500-1126-11e9-86d2-707de027fa97.png)

## Run locally
```
git clone git@github.com:aronwoost/google-calendar-hours.git
cd google-calendar-hours
python -m SimpleHTTPServer 8000
```

This will clone the repo and start a webserver. Now you can open [http://localhost:8000/](http://localhost:8000/) in the browser.


## Testing and building
Open `index_dev.html` to run the non-optimized version. Every file will be loaded one by one. The redirection back from google *will not work* with `index_dev.html`, instead use `/` to auth agains google (OAuth token will be saved in sessionStorage) and then head back to `index_dev.html` for testing.

### Docker
To start a local NGINX hosting the static files, run:

```
$ docker run \
  --name gch \
  -v /<path-to-project>:/usr/share/nginx/html:ro \
  -d \
  -p 80:80 \
  nginx
```

### Build
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
