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


function daysInMonth(month,year) {
	if(new Date(year, 2, 0).getDate() == 29 && month == 12){
		return new Date(year, month, 0).getDate() -1;
	}
 	return new Date(year, month, 0).getDate();
}

app.get('/search', function(req1, res1){
	// GET variables lat, lon, start and end years
	var lat = req1.query.lat;
	var lon = req1.query.lon;
	var years = req1.query.year;

	var text;
	var req = request.get('https://daymet.ornl.gov/data/send/saveData?lat='+ 
		lat +'&lon='+ lon + '&year=' + years).buffer().end(function(err, res){
			if(res.status != 200){
				// Daymet server error
				return(-1);
			}

			text = res.text;

			//call back API of parse
			parse(text, function(err, output){
				output = output.slice(8); // get rid of header
				var res = [];
				var ptr = [0,0,0,0,0,0];
				// process downloaded data to 3PG input
				years = years.split(','); //how many years
				var len = years.length;
				for(yr =0; yr < len; yr ++){
					var cumdays = 0;
					for(m = 1; m <= 12; m++){
						var dim = daysInMonth(m, Number(years[yr]));
						ptr = [0,0,0,0,0,0];
						for(j = 0; j < dim; j++ ){ // For a given month
							ptr[0] += Number(output[yr*365 + cumdays + j][7]);
							ptr[1] += Number(output[yr*365 + cumdays + j][6]);
							var tdmean = Number(output[yr*365 + cumdays + j][8])/1000;
							tdmean = (Math.log(tdmean/0.6108)*237.3)/(17.27 - Math.log(tdmean/0.6108));
							ptr[2] += tdmean;
							ptr[3] += Number(output[yr*365 + cumdays + j][3]);
							ptr[4] += Number(output[yr*365 + cumdays + j][4]) * 
							Number(output[yr*365 +  cumdays + j][2])/1e6;
							ptr[5] += Number(output[yr*365 + cumdays + j][2])/3600;
						}
						// Update after reading one month data
						cumdays += dim
						ptr[0] /= dim;
						ptr[1] /= dim;
						ptr[2] /= dim;
						ptr[4] /= dim;
						ptr[5] /= dim;
						res.push(ptr);
					}
				}
				console.log(JSON.stringify(res)); // return JSON object
		});
	});
});
