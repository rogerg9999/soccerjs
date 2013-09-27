var	Firebase= require('firebase'),
	_ = require('underscore'),
	fn = require('./fn.js'),
	consts = require('./consts.js');

var fireRef = new Firebase(consts.firebase.url);

function Soccer(){
    this.leagues = _.values(consts.leagues);
    this.xmlsoccer = {
				url: "http://www.xmlsoccer.com/FootballData.asmx/",
				ApiKey: "BHWYWCDUWXQWYREGACHXMFULOPFNAGNNZCKNXJOLOJFRXZCRLL",
				ids: {
					standings: "TeamLeagueStanding",
					match: "Match"},
				methods: {
				 	GetLeagueStandingsBySeason : "GetLeagueStandingsBySeason",
				 	GetLiveScore : "GetLiveScore",
				 	GetFixturesByLeagueAndSeason :  "GetFixturesByLeagueAndSeason",
				 	GetAllLeagues : "GetAllLeagues"
				 }};
}

Soccer.prototype.getFixturesByLeagueAndSeason = function(){
	this._getMethodByLeagueAndSeason(this.xmlsoccer.methods.GetFixturesByLeagueAndSeason, this.xmlsoccer.ids.match, consts.firebase.keys.fixtures, 0, 300);
};

Soccer.prototype.getLeagueStandingsBySeason = function(){
	this._getMethodByLeagueAndSeason(this.xmlsoccer.methods.GetLeagueStandingsBySeason, this.xmlsoccer.ids.standings, consts.firebase.keys.standings, 0, 300);
};

Soccer.prototype.getAllLeagues = function(){
	var self = this;
	var args= {form:{
				"ApiKey": this.xmlsoccer.ApiKey
				}};
    fn.post(this.xmlsoccer.methods.getAllLeagues, args, function(error, body){
		fn.parseXml(body, "LEAGUE", function(objects){
			if(objects != null){
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
				"ApiKey": this.xmlsoccer.ApiKey
				}};
	var ref = fireRef.child(consts.firebase.keys.liveScores);
	this._doPostToXmlSoccer(this.xmlsoccer.methods.GetLiveScore , args, this.xmlsoccer.match, ref);
}


Soccer.prototype._getMethodByLeagueAndSeason = function(method, attr, root, done, time, key){
	var self = this;
	var total = self.leagues.length;
	var args= {form:{
				"ApiKey": this.xmlsoccer.ApiKey,
				"league": "",
				"seasonDateString" : "1314"
				}};
	var leaguesRef = fireRef.child(consts.firebase.keys.leagues);
	args.form.league = this.leagues[done];
	var ref = leaguesRef.child(args.form.league).child(root);

	self._doPostToXmlSoccer(method, args, attr, ref, key);
    	if(time){
	    	done++;
			if(done < total)
				setTimeout(function(){
					self._getMethodByLeagueAndSeason(method, attr, root, done, time, key);
				}, time);	
    	}
}


Soccer.prototype._doPostToXmlSoccer = function(method, args, attr, ref, key){
	var self = this;
	var url = this.xmlsoccer.url + method;
    fn.post(url, args, function(error, body){
    	console.log(body);
    	fn.parseXml(body, attr, function(objects){
    		if(objects != null){
    			fn.writeArrayToFirebase(ref, objects, key);
    		}
    	});
	});
}


module.exports = Soccer;




