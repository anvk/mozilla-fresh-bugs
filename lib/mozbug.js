/*global require*/

var https = require('https'),
    _ = require('lodash'),
    fs = require('fs');

var debug = true,
    bugs = [],
    filteredBugs = [],
    stubDataFilePath = './stubData.json';

var generateURL = function(options) {
  options = options || {};

  var args = options.args || [],
      bug_status = options.bug_status || [],
      include_fields = options.include_fields || [],
      url = options.base + '?';

  for (var i=0, len=args.length, arg; i < len; ++i) {
    arg = args[i];
    url = url + arg.name + '=' + arg.value + '&';
  }

  for (var i=0, len=bug_status.length; i < len; ++i) {
    url = url + 'bug_status' + '=' + bug_status[i] + '&';
  }

  for (var i=0, len=include_fields.length; i < len; ++i) {
    url = url + 'include_fields' + '=' + include_fields[i] + '&';
  }

  url = url + 'product' + '=' + options.product + '&';

  // remove last character which is either ? or &
  url = url.slice(0,-1);

  return url;
};

var makeRequest = function(urlPath, callback) {
  var options = {
    host: 'bugzilla.mozilla.org',
    port: 443,
    path: urlPath,
    method: 'GET'
  };

  var reqGet = https.request(options, function(res) {
    var str = '';

    res.on('data', function(chunk) {
      str += chunk;
    });

    res.on('end', function() {
      callback(JSON.parse(str));
    });
  });

  reqGet.end();
  reqGet.on('error', function(e) {
    console.error(e);
  });
};

var printResult = function(bugs) {
  var separator = '   ';

  console.log('Hi there!');
  console.log('Ready to contribute?');
  console.log('I found ' + bugs.length + ' bugs for ya.');
  console.log();

  bugs = _(bugs).chain()
    .sortBy('last_change_time')
    .reverse()
    .value();

  bugs.forEach(function(bug) {
    console.log([
      bug.summary,
      bug.last_change_time,
      'comments: ' + bug.comments.length,
      'history: ' + bug.history.length
    ].join(separator));
    console.log();
  });
};

var path = generateURL({
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

var getUnassignedBugs = function(data) {
  bugs = data.bugs || [];

  for (var i=0, len = bugs.length, bug; i < len; ++i) {
    bug = bugs.pop();

    // if bug assigned to someone already, then we do no care
    if (bug.assigned_to_detail.id !== 1) {
      continue;
    }

    getBugDetails(bug);
  }
};

var addBug = function(bug, comments, history) {
  bug.comments = comments;
  bug.history = history;

  filteredBugs.push(bug);

  if (bugs.length === 0) {
    processBugs(filteredBugs);
  }
};

var getBugDetails = function(bug) {
  var comments, history;

  var finished = _.after(2, function() {
    addBug(bug, comments, history);
  });

  makeRequest('/rest/bug/' + bug.id + '/comment', function(data) {
    comments = data.bugs[bug.id].comments,
    finished();
  });

  makeRequest('/rest/bug/' + bug.id + '/history', function(data) {
    history = data.bugs[0].history;
    finished();
  });

};

var processBugs = function(bugs) {
  printResult(bugs);
};


// starting point
if (debug) {
  fs.readFile(stubDataFilePath, 'utf8', function(err,data) {
    if (err) {
      return console.log(err);
    }

    processBugs(JSON.parse(data));
  });
}
else {
  makeRequest(path, getUnassignedBugs);
}