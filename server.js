const express =require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');

const client = new pg.Client(process.env.DB_CONNECTION_STRING);
client.connect();

const app =express();
app.use(cors());

//localhost:3000/location?location=Blah



//route for location
app.get('/location', (request, response) => {
    try{
        let SQL = 'SELECT * FROM locations WHERE search_query=$1';
        let VALUES = [request.query.data];

        client.query(SQL, VALUES).then(results => {
            if(results.rows.length === 0){
                superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODEAPI_KEY}`)
                .then((geoData) => {
                    console.log(geoData.body);
                    const location = new Location(request.query.data, geoData.body);
                    SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)'
                    VALUES = Object.values(location);
                    client.query(SQL, VALUES).then(results => {
                        console.log(results);
                        response.send(location);
                    });
                });
            } else {
                console.log('I came from database');
                response.send(results.rows);
            }

        });
       
        
    } catch(error){
        response.status(500).send("Sorry! Something went wrong.")
    }
    
});


app.get('/weather', (request, response) => {
    try {
      const url = `https://api.darksky.net/forecast/${process.env.DARKSKYAPI_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  
      return superagent.get(url)
        .then((result) => {
          const weatherSummaries = result.body.daily.data.map((day) => new Weather(day));
            response.send(weatherSummaries);
          });
          
        } catch(error) {
            response.status(500).send('Dis website is broke. Call someone who cares.');
        } 
        
  });
  app.get('/events', (request, response) => {
    console.log('Workin');
    try {
      const url = `https://www.eventbriteapi.com/v3/events/search/?token=${process.env.EVENTBRITE_API_KEY}&location.latitude=${request.query.data.latitude}&location.longitude=${request.query.data.longitude}&location.within=10km`;
  
      return superagent.get(url)
        .then((result) => {
          const eventSummaries = result.body.events.map((event) => new Event(event));
            response.send(eventSummaries);
          });
          
        } catch(error) {
            response.status(500).send('Shit\'s on fire yo.');
        } 
  });
        
  




// //route for weather
// app.get('/weather', (request, response) => {
// try{
//     const darkData = require('./darkysky.json');

//     let weatherResults = []

// //fills weatherResults array 
//     darkData.daily.data.forEach(day => {
// //
//         weatherResults.push(new Weather(day));
//     });
// //return results
//     response.send(weatherResults);
// } catch(error){
//     response.status(500).send("Sorry! Something went wrong.")
// }
// });

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

