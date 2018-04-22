'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');
var Auth0 = require('auth0-web');

var timeout = 5000;

var RestFlexClient = function () {
  function RestFlexClient(baseURL) {
    var _this = this;

    _classCallCheck(this, RestFlexClient);

    Auth0.subscribe(function (authenticated) {
      if (authenticated) {
        _this.client = axios.create({
          baseURL: baseURL,
          timeout: timeout,
          headers: {
            'Authorization': 'Bearer ' + Auth0.getAccessToken()
          }
        });
      } else {
        _this.client = axios.create({
          baseURL: baseURL,
          timeout: timeout
        });
      }
    });
  }

  _createClass(RestFlexClient, [{
    key: 'insert',
    value: function insert(transaction) {
      return this.client.post('/', transaction);
    }
  }, {
    key: 'get',
    value: function get(id) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.client.get('/' + (id || '')).then(function (response) {
          var data = response.data;
          if (Array.isArray(response.data)) {
            data = data.map(RestFlexClient.jsonToObject);
          } else {
            data = RestFlexClient.jsonToObject(data);
          }
          resolve(data);
        }).catch(reject);
      });
    }
  }, {
    key: 'update',
    value: function update(id, transaction) {
      return this.client.put('/' + id, transaction);
    }
  }, {
    key: 'remove',
    value: function remove(id) {
      return this.client.delete('/' + id);
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