'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/* global require */

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var debug = true,
    stubDataFilePath = './stubData.json';

var MozillaFreshBugs = (function () {
  function MozillaFreshBugs() {
    _classCallCheck(this, MozillaFreshBugs);

    this._bugs = [];
    this._filteredBugs = [];
  }

  _createClass(MozillaFreshBugs, [{
    key: 'serveFresh',
    value: function serveFresh() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _getUnassignedBugs = this._getUnassignedBugs;

      this.makeRequest(this._generateURL(options), function (_ref) {
        var _ref$bugs = _ref.bugs;
        var bugs = _ref$bugs === undefined ? [] : _ref$bugs;

        _getUnassignedBugs(bugs);
      });
    }
  }, {
    key: 'makeRequest',
    value: function makeRequest(urlPath) {
      var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

      var options = {
        baseUrl: 'bugzilla.mozilla.org',
        uri: urlPath,
        method: 'GET',
        port: 443,
        json: true,
        gzip: true
      };

      (0, _request2['default'])(options, function (error, response, body) {
        if (error) {
          callback(error);
          return;
        }

        callback(null, body);
      });
    }
  }, {
    key: 'getBugDetails',
    value: function getBugDetails(bug) {
      var addBug = this.addBug,
          comments = undefined,
          history = undefined;

      var finished = _lodash2['default'].after(2, function () {
        addBug(bug, comments, history);
      });

      this.makeRequest('/rest/bug/' + bug.id + '/comment', function (data) {
        comments = data.bugs[bug.id].comments, finished();
      });

      this.makeRequest('/rest/bug/' + bug.id + '/history', function (data) {
        history = data.bugs[0].history;
        finished();
      });
    }
  }, {
    key: 'addBug',
    value: function addBug(bug, comments, history) {
      bug.comments = comments;
      bug.history = history;

      this._filteredBugs.push(bug);

      if (bugs.length === this._filteredBugs.length) {
        this.processBugs(filteredBugs);
      }
    }
  }, {
    key: 'processBugs',
    value: function processBugs(bugs) {
      this._printResult(bugs);
    }
  }, {
    key: '_generateURL',
    value: function _generateURL() {
      var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var base = _ref2.base;
      var product = _ref2.product;
      var _ref2$args = _ref2.args;
      var args = _ref2$args === undefined ? [] : _ref2$args;
      var _ref2$bug_status = _ref2.bug_status;
      var bug_status = _ref2$bug_status === undefined ? [] : _ref2$bug_status;
      var _ref2$include_fields = _ref2.include_fields;
      var include_fields = _ref2$include_fields === undefined ? [] : _ref2$include_fields;

      var url = base + '?';

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var arg = _step.value;

          url = url + arg.name + '=' + arg.value + '&';
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = bug_status[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var value = _step2.value;

          url = url + 'bug_status=' + value + '&';
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = include_fields[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var value = _step3.value;

          url = url + 'include_fields=' + value + '&';
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3['return']) {
            _iterator3['return']();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      url = url + 'product=' + product + '&';

      // remove last character which is either ? or &
      url = url.slice(0, -1);

      return url;
    }
  }, {
    key: '_printResult',
    value: function _printResult() {
      var bugs = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      var separator = '   ';

      console.log('Hi there!');
      console.log('Ready to contribute?');
      console.log('I found ' + bugs.length + ' bugs for ya.');
      console.log();

      bugs = (0, _lodash2['default'])(bugs).chain().sortBy('last_change_time').reverse().value();

      bugs.forEach(function (_ref3) {
        var summary = _ref3.summary;
        var last_change_time = _ref3.last_change_time;
        var _ref3$comments = _ref3.comments;
        var comments = _ref3$comments === undefined ? [] : _ref3$comments;
        var _ref3$history = _ref3.history;
        var history = _ref3$history === undefined ? [] : _ref3$history;

        console.log([summary, last_change_time, 'comments: ' + comments.length, 'history: ' + history.length].join(separator));
        console.log();
      });
    }
  }, {
    key: '_getUnassignedBugs',
    value: function _getUnassignedBugs() {
      var _ref4 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref4$bugs = _ref4.bugs;
      var bugs = _ref4$bugs === undefined ? [] : _ref4$bugs;

      this._bugs = bugs;

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = bugs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var bug = _step4.value;

          // if bug assigned to someone already, then we do no care
          if (bug.assigned_to_detail.id !== 1) {
            continue;
          }

          this.getBugDetails(bug);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4['return']) {
            _iterator4['return']();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }]);

  return MozillaFreshBugs;
})();

exports['default'] = MozillaFreshBugs;
;
module.exports = exports['default'];