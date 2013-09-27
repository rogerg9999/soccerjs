var request = require('request'),
    xmltojs = require('libxml-to-js'),
    client = require('client-http'), 
    qs = require('querystring'),
    rest = require('rest');



var post = function(url, params, cb){
  request.post(url, params, function(error, response, body){
    cb(error, body);
  });
}

var get = function(url, params, cb){
  if(params){
    url += qs.stringify(params);
  }
  
  var opts= {
    url: url
  }
  /*request(opts, function(error, response, body){
    cb(error, body);
  });*/
  rest(url).then(function(response){
    cb(null, response);
  });
  
}

var writeArrayToFirebase = function(ref, objects, key){
  if(objects==null)
    return;
  for(var i = 0; i< objects.length; i++){
    var obj = sanitizeObject(objects[i]);
    var refObj = (key!= null && obj[key]!= null)? ref.child(obj[key]) : ref.child(i+1);
    refObj.update(obj);
  }
}

var parseXml= function(body, resultAttr, cb){
  var self = this;
  var objects;
  console.log(body);
  xmltojs(body, function (err, result) {
    if(err){
      console.log(err);
      return;
    }
      objects = result[resultAttr];
  });
    if(cb){
      cb(objects);
    }
}


var sanitizeObject = function(obj) {
  if (typeof obj != typeof {}) {
    return obj;
  }

  var newObj = {};
  var special = [".", "$", "/", "[", "]"];
  for (var key in obj) {
    var sum = -1;
    for (var i in special) {
      sum += (key.indexOf(special[i])) + 1;
    }
    if (sum < 0) {
      if (key == "date" || key == "pubdate" || key == "pubDate") {
        if (obj[key]) {
          newObj[key] = obj[key].toString();
        }
      } else if (key == "#") {
        newObj["value"] = sanitizeObject(obj[key]);
      } else if (key.indexOf("#") >= 0) {
        newObj["@" + key.replace("#", "")] = sanitizeObject(obj[key]);
      } else if (sanitizeObject(obj[key]) && key != "") {
        newObj[key] = sanitizeObject(obj[key]);
      }
    }
  }
  return newObj;
}

module.exports.get = get;
module.exports.post = post;
module.exports.sanitizeObject = sanitizeObject;
module.exports.writeArrayToFirebase = writeArrayToFirebase;
module.exports.parseXml = parseXml;
