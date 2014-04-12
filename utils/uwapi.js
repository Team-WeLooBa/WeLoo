//A simple wrapper class for UW Open API endpoint
var apiToken = require('../private/secret.js');
// Constructor
function UWApi() {
  // always initialize all instance properties
  this.host = 'http://api.uwaterloo.ca/v2/';
  this.token = apiToken.uwApiToken;
  this.rest = require('restler');
}

// class methods
UWApi.prototype.getjson = function(path, cb) {
	var url = this.host+path+'.json?key='+this.token;
	// console.info("UWAPI get: "+url);
	this.rest.get(url).on('complete', function(data) {
    cb(data);
  });
};

// export the class
module.exports = new UWApi();