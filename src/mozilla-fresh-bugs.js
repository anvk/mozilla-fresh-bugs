'use strict';

import _ from 'lodash';
import request from 'request';

/**
 * Class to retreive fresh bugs from Bugzilla for new contributors
 */
export default class MozillaFreshBugs {
  constructor() {
    this.serveFresh = this.serveFresh.bind(this);
    this.log = this.log.bind(this);

    this._makeRequest = this._makeRequest.bind(this);
    this._getBugDetails = this._getBugDetails.bind(this);
    this._processMozillaBugData = this._processMozillaBugData.bind(this);

    this._urlBase = '/rest/bug';
    this._bugs = [];
  }

  /**
   * Function to pull bugs from BugZilla based on options. Process and print out
   * result back to client.
   * @param  {Object} options required for URL generation
   * @param  {Function} callback Function to be executed when all bugs
   * are processed
   */
  serveFresh(options = {}, callback = ()=>{}) {
    this._bugs = [];
    let _processMozillaBugData = this._processMozillaBugData;

    this._makeRequest(this._generateURL(options), (error, data = {}) => {
      if (error) {
        return callback(error);
      }

      _processMozillaBugData(data.bugs, callback);
    });
  }

  /**
   * Function to print out bugs
   */
  log() {
    const separator = '   ';
    let bugs = this._bugs || [];

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

  /**
   * @return {Array} Array of bugs
   */
  get bugs() {
    return this._bugs;
  }

  /**
   * Function to add comments and history to every bug and print out result
   * @param  {Array}  bugs Array of bugs
   * @param  {Function} callback Function to be executed when all bugs
   * are processed
   */
  _processMozillaBugData(bugs = [], callback = ()=>{}) {
    let _getBugDetails = this._getBugDetails,
        iterations = bugs.length,
        result = [];

    for (let bug of bugs) {
      // if bug assigned to someone already, then we do no care
      if (bug.assigned_to_detail.id !== 1) {
        iterations = iterations - 1;
        continue;
      }

      _getBugDetails(bug, (comments = [], history = []) => {
        bug.comments = comments;
        bug.history = history;

        result.push(bug);

        console.log('Processed %d out of %d', result.length, iterations);

        if (result.length === iterations) {
          this._bugs = result;
          callback(null, result);
        }
      });
    }
  }

  /**
   * Function to make a request to get Mozilla bugs from Bugzilla
   * @param  {string}   urlPath  URL path to query Bugzilla
   * @param  {Function} callback Function callback executed to parse data
   */
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

  /**
   * Function to retreive extra data for a separate bug (comments, history,...)
   * @param  {Object}   bug      Object containing bug data
   * @param  {Function} callback Function executed once history
   * and comments are returned
   */
  _getBugDetails(bug = {}, callback = ()=>{}) {
    let comments, history;

    let finished = _.after(2, () => {
      callback(comments, history);
    });

    this._makeRequest('/rest/bug/' + bug.id + '/comment', (error, data = {}) => {
      if (error) {
        console.error(error);
        comments = [];
        return finished();
      }

      if (!data) {
        comments = [];
        return finished();
      }

      comments = data.bugs[bug.id].comments;

      finished();
    });

    this._makeRequest('/rest/bug/' + bug.id + '/history', (error, data = {}) => {
      if (error) {
        console.error(error);
        history = [];
        return finished();
      }

      if (!data) {
        history = [];
        return finished();
      }

      history = data.bugs[0].history;

      finished();
    });
  }

  /**
   * Function to create URL based on options
   * @param  {string} options.product        Product name
   * @param  {Array}  options.args           Extra query arguments
   * @param  {Array}  options.bug_status     Array of bug statuses
   * @param  {Array}  options.include_fields Arrays of bug properties to return
   * @return {string}                        URL to retreive bugs
   */
  _generateURL({base, product, args=[], bug_status=[], include_fields=[]} = {}) {
    let url = this._urlBase + '?';

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
};
