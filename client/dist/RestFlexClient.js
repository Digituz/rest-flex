'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _isomorphicUnfetch = require('isomorphic-unfetch');

var _isomorphicUnfetch2 = _interopRequireDefault(_isomorphicUnfetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RestFlexClient = function () {
  function RestFlexClient(baseURL, token) {
    (0, _classCallCheck3.default)(this, RestFlexClient);

    this.baseURL = baseURL;

    if (token) {
      this.headers = !token ? {} : {
        'Authorization': 'Bearer ' + token
      };
    } else {
      this.headers = {};
    }
  }

  (0, _createClass3.default)(RestFlexClient, [{
    key: 'insert',
    value: function insert(object) {
      return (0, _isomorphicUnfetch2.default)(this.baseURL, {
        method: 'POST',
        headers: this.headers,
        body: object
      });
    }
  }, {
    key: 'get',
    value: function get(id) {
      var _this = this;

      return new Promise(function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(resolve, reject) {
          var response, data;
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  _context.next = 3;
                  return (0, _isomorphicUnfetch2.default)(_this.baseURL + '/' + (id || ''), {
                    headers: _this.headers
                  });

                case 3:
                  response = _context.sent;
                  _context.next = 6;
                  return response.json();

                case 6:
                  data = _context.sent;

                  if (Array.isArray(data)) {
                    data = data.map(RestFlexClient.jsonToObject);
                  } else {
                    data = RestFlexClient.jsonToObject(data);
                  }
                  resolve(data);
                  _context.next = 14;
                  break;

                case 11:
                  _context.prev = 11;
                  _context.t0 = _context['catch'](0);

                  reject(_context.t0);

                case 14:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this, [[0, 11]]);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: 'find',
    value: function find(filter, sort) {
      var filterParam = JSON.stringify(filter);
      var sortParam = sort ? JSON.stringify(sort) : null;
      var url = this.baseURL + '/?';
      url = filter ? url + 'filter=' + filterParam + '&' : url;
      url = sort ? url + 'sort=' + sortParam + '&' : url;
      return (0, _isomorphicUnfetch2.default)(url, {
        headers: this.headers
      });
    }
  }, {
    key: 'update',
    value: function update(id, object) {
      return (0, _isomorphicUnfetch2.default)(this.baseURL + '/' + id, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(object)
      });
    }
  }, {
    key: 'remove',
    value: function remove(id) {
      return (0, _isomorphicUnfetch2.default)(this.baseURL + '/' + id, {
        method: 'DELETE',
        headers: this.headers
      });
    }
  }], [{
    key: 'jsonToObject',
    value: function jsonToObject(json) {
      var properties = Object.getOwnPropertyNames(json);
      var object = {};
      properties.forEach(function (property) {
        var value = json[property];
        if (value.length >= 24) {
          value = new Date(value);
        }
        object[property] = isNaN(value) ? json[property] : value;
      });
      return object;
    }
  }]);
  return RestFlexClient;
}();

module.exports = RestFlexClient;
//# sourceMappingURL=RestFlexClient.js.map