//A simple wrapper class for UW Open API endpoint
// Constructor
function UWApi() {
  // always initialize all instance properties
  this.host = 'http://api.uwaterloo.ca/v2/';
  this.token = process.env.UW_API_TOKEN;
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