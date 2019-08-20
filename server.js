const express =require('express');
const cors = require('cors');
require('dotenv').config();

const app =express();
app.use(cors());

//localhost:3000/location?location=Blah



//route for location
app.get('/location', (request, response) => {
    try{
        const geoData = require('./geo.json');
        const location = new Location(request.query.location, geoData)
        response.send(location);
    } catch(error){
        response.status(500).send("Sorry! Something went wrong.")
    }
    
});

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
//weather contruction
function Weather(darkData){
//unformatted day in seconds
    let rawTime = darkData.time;
    this.forecast = darkData.summary;
//use built in Date constructor. This example is odd because it has time in seconds.
//(0, 15): first and last characters 
    this.time = new Date (rawTime * 1000).toString().slice(0,15);
};

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log('server is listening');
});

