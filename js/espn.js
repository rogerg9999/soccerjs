var fn 	 = require('./fn.js'),
	consts= require('./consts.js'),
	util = require('util'),
	Firebase = require('firebase'),
	_ = require('underscore'),
	http = require("http"),
	querystring = require("querystring");

var URL = "http://api.espn.com/v1/sports/soccer/%s/news/?";

var fireRef = new Firebase(consts.firebase.url);

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
			var fiew = new Firebase(consts.firebase.url).child(headlines);
			fn.writeArrayToFirebase(ref, data[attr], "id", language);
		cb();
	});

}

function writeToFirebase(headline, language, league){
	if(!headline["headline"] || !headline['images'] || !headline.images[0])
		return;
	var d = new Date(headline["published"]);
	var priority = d.getTime();
	fireRef.child("headlines").child(headline["id"]).update(headline, function(error){
		if(!error){
			fireRef.child(language).child("headlines").child(headline["id"]).setWithPriority(true, priority);
			fireRef.child("news").child(language).child(league).child(headline["id"]).set(true);
			fireRef.child("news").child(language).child(league).child(headline["id"]).setPriority(priority);
		}
	});
}

Espn.prototype.writeHeadlines = function(index, language, callback){
	var self = this;
	var leagueId = this.leagues[index];
	var total = this.leagues.length;
	var league = consts.leagues[leagueId];
	self.getHeadlines(leagueId, language, function(data){
		console.log(data);
		if(data != null){
			var headlines = data["headlines"];
			_.map(headlines, function(headline){
				writeToFirebase(headline, language, league);
			});

			callback();
		}

	});

}

Espn.prototype.getLeagueHeadlines = function(index, language){
	var self = this;
	var total = this.leagues.length;
	this.writeHeadlines(index, language, function(){
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