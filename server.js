'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();


// Application Dependencies
const express =require('express');
const cors = require('cors');



// Application Setup
const superagent = require('superagent');
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log('server is listening');
});

const app = express();
app.use(cors());


// API Routes
//route for location
app.get('/location', (request, response) => {
    // this is a try catch to see if we can get location data
    try {
        const locationData = searchToLatLong(request.query.data);
        response.send(locationData);
      }
      catch(error) {
        console.error(error);
        response.status(500).send('Status: 500. So sorry, something went wrong.');
      }
});

//route for weather
app.get('/weather', (request, response) => {
try{
    const darkData = require('./darkysky.json');

    let weatherResults = []

//fills weatherResults array 
    darkData.daily.data.forEach(day => {
        weatherResults.push(new Weather(day));
    });
//return results
    response.send(weatherResults);
} catch(error){
    response.status(500).send("Sorry! Something went wrong.")
}
});

//location contstructor
function Location(query, res){
    this.search_query = query,
    this.formatted_query = geoData.results[0].formatted_address;
    this.latitude = geoData.results[0].geometry.location.lat;
    this.longitude = geoData.results[0].geometry.location.lng;
}
//weather contruction
function Weather(darkData){
//unformatted day in seconds
    let rawTime = darkData.time;
    this.forecast = darkData.summary;
//use built in Date constructor. This example is odd because it has time in seconds.
//(0, 15): first and last characters 
    this.time = new Date (rawTime * 1000).toString().slice(0,15);
};

//app.listen is on ln 17
