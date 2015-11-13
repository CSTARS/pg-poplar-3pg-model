var express = require('express');
var request = require('superagent');
var parse = require('csv-parse');
//var fs = require('fs');
var app = express();

// Define global variables
var lat, lon, years;

var server = app.listen(3000, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});


app.get('/search', function(req1, res1){
	// GET variables lat, lon, start and end years
	res1.send("Parameters received, retriving data from Daymet");
	lat = req1.query.lat;
	lon = req1.query.lon;
	years = req1.query.year;

	var text;
	var req = request.get('https://daymet.ornl.gov/data/send/saveData?lat='+ 
		lat +'&lon='+ lon + '&year=' + years).buffer().end(function(err, res){
		
			text = res.text;

			//call back API of parse
			parse(text, function(err, output){
				output = output.slice(8); // get rid of header
				//console.log(output[1]);
				//TODO: process downloaded data to 3PG input
		});
	});
});
