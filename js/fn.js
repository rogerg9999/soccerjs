var request = require('request'),
    xmltojs = require('libxml-to-js'),
    qs = require('querystring');


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

var writeArrayToFirebase = function(ref, objects, key, lang){
  if(objects==null){
    console.log("writeArrayToFirebase objetcs is null");
    return;
  }
  for(var i = 0; i< objects.length; i++){
    var obj = sanitizeObject(objects[i]);
    if(lang)
      obj.lang = lang;
    var refObj = (key!= null && obj[key]!= null)? ref.child(obj[key]) : ref.child(i+1);
    refObj.update(obj);
  }
}

var parseXml= function(body, resultAttr, cb){
  xmltojs(body, function (err, result) {
    if(err){
      console.log(err);
      cb(null);
      return;
    }
      var objects = result[resultAttr];

      cb(objects);

  });
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
