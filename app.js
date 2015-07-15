'use strict';

/* global require */

var fs = require('fs'),
    MozillaFreshBugs = require('./dist/mozilla-fresh-bugs.js'),
    mozillaFreshBugs = new MozillaFreshBugs();

var debug = true,
    stubDataFilePath = './test/testData.json';

var path = mozillaFreshBugs._generateURL({
  base: '/rest/bug',
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
    'last_change_time',
    'comments'
  ]
});

// starting point
if (debug) {
  fs.readFile(stubDataFilePath, 'utf8', function(err,data) {
    if (err) {
      return console.log(err);
    }

    mozillaFreshBugs.processBugs(JSON.parse(data));
  });
}
else {
  mozillaFreshBugs.serveFresh(path);
  //mozillaFreshBugs.makeRequest(path, getUnassignedBugs);
}
