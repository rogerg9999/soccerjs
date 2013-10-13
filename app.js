var Soccer = require('./js/soccer.js'),
	Espn = require("./js/espn.js");
	async = require('async');

var kue = require('kue')
  , jobs = kue.createQueue();

var cronJob = require('cron').CronJob;

var soccer = new Soccer();
var espn = new Espn();

/*setInterval(function(){
    					soccer.getLiveScore();
    				}, 30000);*/
//soccer.getLeagueStandingsBySeason();
//soccer.getFixturesByLeagueAndSeason();
//soccer.getLiveScore();

//espn.getLeagueHeadlines(0, espn.langs.es);
//espn.getLeagueHeadlines(0, espn.langs.en);

function repeatJob(id){
  jobs.create('headlines', {
    title: 'headline '+ id,
    index: id
}).save();
}

function cronTask(){
	
	jobs.process('headlines', function(job, done){
	var index = job.data.index;
	espn.getLeagueHeadlines(index, espn.langs.es, function(){
		setTimeout(function(){
			repeatJob(++index);
			done();
		}, 3000);
	});
  
});
}


//jobs.promote(3000);

//jobs.process('headlines', cronTask());

//repeatJob(0);

//kue.app.listen(3000);



//Every minute at XX:00
var liveScores = new cronJob("0 * * * * *", function(){soccer.getLiveScore()}, null, true);

//Every hour at XX:10:30
var headlines = new cronJob("30 10 * * * *", function(){espn.getLeagueHeadlines(0, espn.langs.en)}, null, true);

//Every hour at XX:15:30
var headlines = new cronJob("30 15 * * * *", function(){espn.getLeagueHeadlines(0, espn.langs.es)}, null, true);

//Every day at 00:00:30
var standings = new cronJob("30  0 0 * * *", function(){soccer.getStandings(0, "1314")}, null, true);

//Every month at day 1 and hour 01:10:30
var fixtures =  new cronJob("30 10 1 1 * *", function(){soccer.getFixtures(0, "1314")}, null, true);

