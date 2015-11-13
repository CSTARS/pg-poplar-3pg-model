var express = require('express');
var request = require('superagent');
var parse = require('csv-parse');
//var fs = require('fs');
var app = express();

// Define global variables

var server = app.listen(3000, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});


app.get('/search', function(req1, res1){
	// GET variables lat, lon, start and end years
	var lat = req1.query.lat;
	var lon = req1.query.lon;
	var years = req1.query.year;

	var text;
	var req = request.get('https://daymet.ornl.gov/data/send/saveData?lat='+ 
		lat +'&lon='+ lon + '&year=' + years).buffer().end(function(err, res){
			text = res.text;

			//call back API of parse
			parse(text, function(err, output){
				output = output.slice(8); // get rid of header
				var res = [];
				var ptr = [0,0,0,0,0,0];
				//TODO: process downloaded data to 3PG input
				var len = years.split(',').length; //how many years
				for(idx =0; idx < len; idx ++){
					var DOY = [365,334,304,273,243,212,181,151,120,90,59,31];
					var DIM = [31,30,31,30,31,31,30,31,30,31,28,31];
					var m = DIM.pop();
					var cur = DOY.pop(); 
					for(i = 0; i <= 365; i++){ // Manual way to loop over months
						if(i == cur){
							ptr[0] /= m;
							ptr[1] /= m;
							ptr[2] /= m;
							ptr[4] /= m;
							ptr[5] /= m;
							res.push(ptr);
							cur = DOY.pop();
							m = DIM.pop();
							ptr = [0,0,0,0,0,0];
							if(i == 365)break;
						}
						//update ptr elements
						ptr[0] += Number(output[idx*365 + i][7]);
						ptr[1] += Number(output[idx*365 + i][6]);
						var tdmean = Number(output[idx*365 + i][8])/1000;
						tdmean = (Math.log(tdmean/0.6108)*237.3)/(17.27 - Math.log(tdmean/0.6108));
						ptr[2] += tdmean;
						ptr[3] += Number(output[idx*365 + i][3]);
						ptr[4] += Number(output[idx*365 + i][4]) * Number(output[idx*365 + i][2])/1e6;
						ptr[5] += Number(output[idx*365 + i][2])/3600;
					}
				}
				console.log(JSON.stringify(res)); // return JSON object
		});
	});
});
