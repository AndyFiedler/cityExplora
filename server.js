const express =require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');

const app =express();
app.use(cors());

//localhost:3000/location?location=Blah


//api routes
//route for location
app.get('/location', (request, response) => {
    try{
        superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODEAPI_KEY}`)
        .then((geoData) => {
            const location = new Location(request.query.data, geoData.body);
            response.send(location);
        });
        
    } catch(error){
        response.status(500).send("Sorry! Something went wrong.")
    }
    
});

app.get('/weather', getWeather);
app.get('/events', getEvents);

//is this different than line 72-74 functionally? V
app.listen(PORT, () => console.log(`Listening on ${PORT}`));


//route for weather
app.get('/weather', (request, response) => {
try{
    const darkData = require('./darkysky.json');

    let weatherResults = []

//fills weatherResults array 
    darkData.daily.data.forEach(day => {
//
        weatherResults.push(new Weather(day));
    });
//return results
    response.send(weatherResults);
} catch(error){
    response.status(500).send("Sorry! Something went wrong.")
}
});

//location contstructor
function Location(query, geoData){
    this.search_query = query,
    this.formatted_query = geoData.results[0].formatted_address;
    this.latitude = geoData.results[0].geometry.location.lat;
    this.longitude = geoData.results[0].geometry.location.lng;
    
}
//weather constructor/////////////////////
function Weather(day) {
    this.forecast = day.summary;
    this.time = new Date(day.time * 1000).toString().slice(0, 15);
  };

//event constructor/////////////////////
  function Event(event) {
    this.link = event.url;
    this.name = event.name.text;
    this.event_date = new Date(event.start.local).toString().slice(0, 15);
    this.summary = event.summary;
  };

  function searchToLatLong(query) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  
    return superagent.get(url)
      .then(res => {
        return new Location(query, res);
      })
      .catch(error => handleError(error));
  };
  //fleshes out getWeather function in app.get(ln28) so it will get weather data from API on searched location. adds all relevent(that i specified) info to a new array with .map
  function getWeather(request, response) {
    const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  
    superagent.get(url)
      .then(result => {
        const weatherSummaries = result.body.daily.data.map(day => {
          return new Weather(day);
        });
  
        response.send(weatherSummaries);
      })
      .catch(error => handleError(error, response));
  };

  //fleshes out getEvents function(ln29) so it gets events for searched location from api and where the event is located within that location. adds all of the info to an array and sends to page
  function getEvents(request, response) {
    const url = `https://www.eventbriteapi.com/v3/events/search?token=${process.env.EVENTBRITE_API_KEY}&location.address=${request.query.data.formatted_query}`;
  
    superagent.get(url)
      .then(result => {
        const events = result.body.events.map(eventData => {
          const event = new Event(eventData);
          return event;
        });
  
        response.send(events);
      })
      .catch(error => handleError(error, response));
  }
  //lets me know if server is on and working
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log('server is listening');
});

