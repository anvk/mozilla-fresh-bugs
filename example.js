'use strict';

/* global require */

var fs = require('fs'),
    MozillaFreshBugs = require('./dist/mozilla-fresh-bugs.js'),
    mozillaFreshBugs = new MozillaFreshBugs();

var debug = true,
    stubDataFilePath = './test/testData.json';

var options = {
  product: '%20Firefox',
  args: [
    { name: 'f1', value: 'bug_mentor' },
    { name: 'o1', value: 'isnotempty' },
    { name: 'whiteboard_type', value: 'contains_all' }
  ],
  bug_status: [
    'NEW',
    'ASSIGNED',
    'REOPENED',
    'UNCONFIRMED'
  ],
  include_fields: [
    'id',
    'assigned_to',
    'summary',
    'last_change_time'
  ]
};

var callback = function(error, data) {
  if (error) {
    return console.error(error);
  }

  mozillaFreshBugs.log();
};

// starting point
if (debug) {
  fs.readFile(stubDataFilePath, 'utf8', function(error, data) {
    if (error) {
      return console.log(error);
    }

    mozillaFreshBugs._processMozillaBugData(JSON.parse(data).bugs, callback);
  });
}
else {
  mozillaFreshBugs.serveFresh(options, callback);
}
