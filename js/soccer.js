var	Firebase= require('firebase'),
	_ = require('underscore'),
	fn = require('./fn.js'),
	xmltojs = require('libxml-to-js'),
	consts = require('./consts.js');

var fireRef = new Firebase(consts.firebase.url);

function Soccer(){
    this.leagues = _.values(consts.leagues);
    this.xmlsoccer = {
				url: "http://www.xmlsoccer.com/FootballData.asmx/",
				ApiKey: "BHWYWCDUWXQWYREGACHXMFULOPFNAGNNZCKNXJOLOJFRXZCRLL",
				ids: {
					standings: "TeamLeagueStanding",
					match: "Match",
					id: "Id"},
				methods: {
				 	GetLeagueStandingsBySeason : "GetLeagueStandingsBySeason",
				 	GetLiveScore : "GetLiveScore",
				 	GetFixturesByLeagueAndSeason :  "GetFixturesByLeagueAndSeason",
				 	GetAllLeagues : "GetAllLeagues"
				 }};
}

Soccer.prototype.writeLeagues = function(){
	var ref = fireRef.child("leagues");
	_.map(this.leagues, function(league){
		console.log(league);
		ref.child(league).set(true);
	});
}


Soccer.prototype.getAllLeagues = function(){
	var self = this;
	var args= {form:{
				"ApiKey": this.xmlsoccer.ApiKey
				}};
    fn.post(this.xmlsoccer.methods.getAllLeagues, args, function(error, body){
		fn.parseXml(body, "League", function(objects){
			if(objects != null){
				console.log(objects);
				var allLeagues = [];
				_.map(objects, function(o){
					allLeagues.push[o.Name];
					console.log(o.Name);
				});
			}
		});
	});

}

Soccer.prototype.getLiveScore = function(){
	var self = this;
	var args= {form:{
				"ApiKey": self.xmlsoccer.ApiKey
				}};
	self.doPost(self.xmlsoccer.methods.GetLiveScore, args, function(data){
		if(data!=null){
			var livescores = data[self.xmlsoccer.ids.match];
			_.map(livescores, function(livescore){
				self.writeLivescoreToFirebase(fn.sanitizeObject(livescore));
			});	
		}	

	});
}


Soccer.prototype.writeLivescoreToFirebase = function(livescore){
	fireRef.child("live").child(livescore["Id"]).update(livescore, function(error){
		if(!error){
			fireRef.child("fixtures").child(livescore["Id"]).once('value', function(snap){
				var data = snap.val();
				console.log(data);
				if(data.Round)
					fireRef.child("actual").child(data.League).child(data.Round).set(true);
			});
		}
	});
}


Soccer.prototype.getStandings = function(index, season){
	var self = this;
	var league = self.leagues[index];
	var total = self.leagues.length;
	var args= {form:{
				"ApiKey": this.xmlsoccer.ApiKey,
				"league": league,
				"seasonDateString" : season
				}};
	self.doPost(this.xmlsoccer.methods.GetLeagueStandingsBySeason, args, function(data){
		console.log(data);
		if(data!=null){
			var standings = data[self.xmlsoccer.ids.standings];
			if(standings){
				for(var i=0; i<standings.length; i++){
				var standing = standings[i];
				if(standing!=null)
					self.writeStandingToFirebase(standing, league, season, i+1);
				}
			}
			
		}

		index++;
		if(index < total){
			setTimeout(function(){
				self.getStandings(index, season);
			}, 300);
		}
	});
}

Soccer.prototype.writeStandingToFirebase = function(standing, league, season, index){
	fireRef.child("standings").child(season).child(league).child(index).update(standing);
}

Soccer.prototype.getFixtures = function(index, season){
	var self = this;
	var league = self.leagues[index];
	var total = self.leagues.length;
	var args= {form:{
				"ApiKey": this.xmlsoccer.ApiKey,
				"league": league,
				"seasonDateString" : season
				}};
	self.doPost(this.xmlsoccer.methods.GetFixturesByLeagueAndSeason, args, function(data){
		if(data!=null){
			var fixtures = data[self.xmlsoccer.ids.match];
			_.map(fixtures, function(fixture){
				if(fixture!=null && fixture["Id"])
					self.writeFixtureToFirebase(fixture, league, season);
			});
		}

		index++;
		if(index < total){
			setTimeout(function(){
				self.getFixtures(index, season);
			}, 300);
		}
	});
}


Soccer.prototype.writeFixtureToFirebase = function(fixture, league, season){
	fireRef.child("fixtures").child(fixture["Id"]).update(fn.sanitizeObject(fixture), function(error){
		if(!error){
			console.log(fixture);
			if(fixture["Round"])
				fireRef.child("matches").child(season).child(league).child(fixture["Round"]).child(fixture["Id"]).set(true);
			else
				fireRef.child("matches").child(season).child(league).child(fixture["Id"]).set(true);
		}
	});
};


Soccer.prototype.doPost = function(method, args, callback){
	var self = this;
	var url = this.xmlsoccer.url + method;
	fn.post(url, args, function(error, body){
		xmltojs(body, function (err, result) {
			callback(result);
		});
		
	});
}


module.exports = Soccer;




