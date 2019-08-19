const express =require('express');
require('dotenv').config();

const app =express();

//localhost:3000/location?location=Blah
app.get('/location', (request, response) => {
    try{
        const geoData = require('./geo.json');
        const location = new Location(request.query.location, geoData)
        response.send(location);
    } catch(error){
        response.status(500).send("Sorry! Something went wrong.")
    }
    
});

function Location(query, geoData){
    this.search_query = query,
    this.formatted_query = geoData.results[0].formatted_address;
    this.latitude = geoData.results[0].geometry.location.lat;
    this.longitude = geoData.results[0].geometry.location.lng;
}

app.get('/weather', (request, response) => {
    response.send('it works');
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log('server is listening');
});
