var leagues = { 
            "esp.1": "La Liga",
            "eng.1": "English Premier League",
            "fra.1": "Ligue 1",
            "ger.1": "Bundesliga",
            "ita.1": "Serie A",
            "ned.1": "Eredivisie",
            "sco.1": "Scottish Premier League",
            "gre.1": "Superleague Greece",
            "bel.1": "Jupiler League",
            "tur.1": "Süper Lig",
            "den.1": "Superliga",
            "uefa.champions": "Champions League",
            "uefa.europa":"Europe League",
            "por.1":"Primeira Liga",
            "usa.1": "Major League Soccer", 
            "swe.1": "Allsvenskan",
            "eng.fa": "FA Cup",
            "eng.worthington": "League Cup",
            "mex.1": "Mexican Primera League",
            "bra.1": "Brasileirao",
            "rus.1": "Russian Football Premier League",
            "eng.2": "English League Championship",
            "ita.2": "Serie B"
          }; 


var firebase = {url: "https://r0gerg.firebaseio.com/",
			    keys: {
			    	leagues: "leagues",
			    	fixtures: "fixtures",
			    	standings: "standings",
			    	liveScores: "liveScores",
			    	headlines: "headlines"
			    }};



module.exports.firebase = firebase;
module.exports.leagues = leagues;
