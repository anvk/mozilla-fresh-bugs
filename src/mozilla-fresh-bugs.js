'use strict';

import _ from 'lodash';
import request from 'request';

export default class MozillaFreshBugs {
  constructor() {
    this.serveFresh = this.serveFresh.bind(this);

    this._makeRequest = this._makeRequest.bind(this);
    this._processMozillaBugData = this._processMozillaBugData.bind(this);
    this._getBugDetails = this._getBugDetails.bind(this);
  }

  serveFresh(options = {}) {
    this._makeRequest(this._generateURL(options), this._processMozillaBugData);
  }

  _processMozillaBugData(error, {bugs = []} = {}) {
    if (error) {
      return console.error(error);
    }

    let _getBugDetails = this._getBugDetails,
        _printResult = this._printResult,
        result = [];

    for (let bug of bugs) {
      // if bug assigned to someone already, then we do no care
      if (bug.assigned_to_detail.id !== 1) {
        continue;
      }

      _getBugDetails(bug, (comments = [], history = []) => {
        bug.comments = comments;
        bug.history = history;

        result.push(bug);

        if (result.length === bugs.length) {
          //_printResult(result);
        }
      });
    }
  }

  _makeRequest(urlPath, callback = ()=>{}) {
    let options = {
      baseUrl: 'https://bugzilla.mozilla.org',
      uri: urlPath,
      method: 'GET',
      port: 443,
      json: true,
      gzip: true
    };

    request(options, (error, response, body = {}) => {
      if (error) {
        return callback(error);
      }

      if (body.error) {
        return callback(body.message);
      }

      callback(null, body);
    });
  }

  _getBugDetails(bug = {}, callback = ()=>{}) {
    let comments, history;

    let finished = _.after(2, () => {
      callback(comments, history);
    });

    this._makeRequest('/rest/bug/' + bug.id + '/comment', (error, data) => {
      if (!error) {
        console.error(error);
        return finished();
      }

      if (!data) {
        return finished();
      }

      comments = data.bugs[bug.id].comments,
      finished();
    });

    this._makeRequest('/rest/bug/' + bug.id + '/history', (error, data = {}) => {
      console.log('-------------->');
      console.log('/rest/bug/' + bug.id + '/history');
      console.log(data);

      if (!error) {
        console.error(error);
        return finished();
      }

      let { bugs:[{ history:history }] = [] } = data;

      console.log('=====');
      console.log(history);
      finished();
    });
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
};
