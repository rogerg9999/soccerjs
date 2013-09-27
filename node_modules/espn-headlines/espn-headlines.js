var http = require("http");
var querystring = require("querystring");

module.exports = function(key) {
	this.key = key;

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
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });

    req.end();
	};

	this.getHeadlines = function(sportName, leagueName, callback) {
	var query = querystring.stringify({ insider: 'no', apikey: this.key, limit: 20});
	var path = "/v1/sports/" + sportName + "/" + leagueName + "/news/headlines/top/?" + query;
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
        });


	};

}