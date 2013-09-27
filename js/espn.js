var fn 	 = require('./fn.js'),
	consts= require('./consts.js'),
	util = require('util'),
	Firebase = require('firebase'),
	_ = require('underscore'),
	http = require("http"),
	querystring = require("querystring");

var URL = "http://api.espn.com/v1/sports/soccer/%s/news/?";

function Espn(){
	this.leagues = _.keys(consts.leagues);
	this.key = "7zccjzyeu5f9937c5srpftr6";
	this.langs= {
		es: "es",
		en: "en"
	}
}


Espn.prototype.doGetToEspn = function(league, language, ref, attr, cb){
	this.getHeadlines(league, language, function(data){
		console.log(data);
		if(data!=null)
			fn.writeArrayToFirebase(ref, data[attr]);
		cb();
	});

}

Espn.prototype.getLeagueHeadlines = function(index, language){
	var self = this;
	var leagueId = this.leagues[index];
	var total = this.leagues.length;
	var league = consts.leagues[leagueId];
	var ref = new Firebase(consts.firebase.url).child(consts.firebase.keys.leagues).child(league).child(consts.firebase.keys.headlines);
	self.doGetToEspn(leagueId, language, ref, "headlines", function(){
		index++;
		if(index<total){
			setTimeout(function(){
				self.getLeagueHeadlines(index, language);
			}, 500);
		}
			
		});
}

var getJSON = function(options, onResult)
	{	
    	var prot = http;
	    var req = prot.request(options, function(res)
	    {
	        var output = '';
	        
	        res.setEncoding('utf8');

	        res.on('data', function (chunk) {
	            output += chunk;
	        });

	        res.on('end', function() {
	            var obj = '{}';
			    if (output) obj=JSON.parse(output);
		            onResult(res.statusCode, obj);
		        });
	    });

    req.on('error', function(err) {
        console.log(err);
    });

    req.end();
	};

	Espn.prototype.getHeadlines = function(leagueName, language, callback) {
		var query = querystring.stringify({ apikey: this.key, limit: 50});
		var path = "/v1/sports/soccer/" + leagueName + "/news/?lang="+language + "&" + query;
		var host = "api.espn.com";
		

		var options = {
			host: host,
			path: path,
		    method: 'GET',
		    headers: {
		        'Content-Type': 'application/json'
		    }
		};

		getJSON(options,
	        function(statusCode, result)
	        {
	            // I could work with the result html/json here.  I could also just return it
	            //console.log("onResult: (" + statusCode + ")" + JSON.stringify(result));
	            callback(result);
	            console.log(statusCode);
	            return;
	        });


		};


module.exports = Espn