'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isomorphicUnfetch = require('isomorphic-unfetch');

var _isomorphicUnfetch2 = _interopRequireDefault(_isomorphicUnfetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RestFlexClient = function () {
  function RestFlexClient(baseURL, token) {
    _classCallCheck(this, RestFlexClient);

    this.baseURL = baseURL;
    this.token = token;

    if (token) {}
    this.headers = !token ? {} : {
      'Authorization': 'Bearer ' + token
    };
  }

  _createClass(RestFlexClient, [{
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
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
          var response, data;
          return regeneratorRuntime.wrap(function _callee$(_context) {
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

                  if (Array.isArray(response.data)) {
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

    // update(id, object) {
    //   return this.client.put(`/${id}`, object);
    // };
    //
    // remove(id) {
    //   return this.client.delete(`/${id}`);
    // };

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