/*global require*/

var https = require('https');

var options = {
  host: 'bugzilla.mozilla.org',
  port: 443,
  path: '/rest/bug?f1=bug_mentor&o1=isnotempty&whiteboard_type=contains_all&bug_status=NEW&bug_status=ASSIGNED&bug_status=REOPENED&bug_status=UNCONFIRMED&include_fields=id&include_fields=assigned_to&include_fields=summary&include_fields=last_change_time&product=%20Firefox',
  method: 'GET'
};

var callback = function(res) {
  var str = '';

  console.log("statusCode: ", res.statusCode);

  res.on('data', function(chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  res.on('end', function() {
    console.info('GET result:\n');
    console.log(str);
    console.info('\n\nCall completed');
  });

};

// do the GET request
var reqGet = https.request(options, callback);
reqGet.end();
reqGet.on('error', function(e) {
  console.error(e);
});


//https://bugzilla.mozilla.org/bzapi/bug?f1=bug_mentor&o1=isnotempty&whiteboard_type=contains_all&bug_status=NEW&bug_status=ASSIGNED&bug_status=REOPENED&bug_status=UNCONFIRMED&include_fields=id&include_fields=assigned_to&include_fields=summary&include_fields=last_change_time&product=%20Firefox


//https://bugzilla.mozilla.org/bzapi/bug?f1=bug_mentor&o1=isnotempty&whiteboard_type=contains_all&bug_status=NEW&bug_status=ASSIGNED&bug_status=REOPENED&bug_status=UNCONFIRMED&include_fields=id&include_fields=assigned_to&include_fields=summary&include_fields=last_change_time&product=%20Firefox%20OS