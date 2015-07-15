'use strict';

/* global require */

import _ from 'lodash';
import request from 'request';

var debug = true,
    stubDataFilePath = './stubData.json';

export default class MozillaFreshBugs {
  constructor() {
    this._bugs = [];
    this._filteredBugs = [];
  }

  serveFresh(options = {}) {
    let _getUnassignedBugs = this._getUnassignedBugs;

    this.makeRequest(this._generateURL(options), ({bugs =[]}) => {
      _getUnassignedBugs(bugs);
    });
  }

  makeRequest(urlPath, callback = ()=>{}) {
    let options = {
      baseUrl: 'bugzilla.mozilla.org',
      uri: urlPath,
      method: 'GET',
      port: 443,
      json: true,
      gzip: true
    };

    request(options, (error, response, body) => {
      if (error) {
        callback(error);
        return;
      }

      callback(null, body);
    });
  }

  getBugDetails(bug) {
    let addBug = this.addBug,
        comments,
        history;

    let finished = _.after(2, () => {
      addBug(bug, comments, history);
    });

    this.makeRequest('/rest/bug/' + bug.id + '/comment', data => {
      comments = data.bugs[bug.id].comments,
      finished();
    });

    this.makeRequest('/rest/bug/' + bug.id + '/history', data => {
      history = data.bugs[0].history;
      finished();
    });
  }

  addBug(bug, comments, history) {
    bug.comments = comments;
    bug.history = history;

    this._filteredBugs.push(bug);

    if (bugs.length === this._filteredBugs.length) {
      this.processBugs(filteredBugs);
    }
  }

  processBugs(bugs) {
    this._printResult(bugs);
  }

  _generateURL({base, product, args=[], bug_status=[], include_fields=[]} = {}) {
    let url = base + '?';

    for (let arg of args) {
      url = url + arg.name + '=' + arg.value + '&';
    }

    for (let value of bug_status) {
      url = url + 'bug_status=' + value + '&';
    }

    for (let value of include_fields) {
      url = url + 'include_fields=' + value + '&';
    }

    url = url + 'product=' + product + '&';

    // remove last character which is either ? or &
    url = url.slice(0, -1);

    return url;
  }

  _printResult(bugs = []) {
    let separator = '   ';

    console.log('Hi there!');
    console.log('Ready to contribute?');
    console.log('I found ' + bugs.length + ' bugs for ya.');
    console.log();

    bugs = _(bugs).chain()
      .sortBy('last_change_time')
      .reverse()
      .value();

    bugs.forEach(function({summary, last_change_time, comments=[], history=[]}) {
      console.log([
        summary,
        last_change_time,
        'comments: ' + comments.length,
        'history: ' + history.length
      ].join(separator));
      console.log();
    });
  }

  _getUnassignedBugs({bugs = []} = {}) {
    this._bugs = bugs;

    for (let bug of bugs) {
      // if bug assigned to someone already, then we do no care
      if (bug.assigned_to_detail.id !== 1) {
        continue;
      }

      this.getBugDetails(bug);
    }
  }
};
