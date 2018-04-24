'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');
var Auth0 = require('@digituz/auth0-web');

var timeout = 5000;

var RestFlexClient = function () {
  function RestFlexClient(baseURL, audience, domain, auth0Config) {
    _classCallCheck(this, RestFlexClient);

    Auth0.configure(auth0Config);

    this.audience = audience;
    this.baseURL = baseURL;
    this.domain = domain;
    this.updateClient(Auth0.isAuthenticated(), baseURL);
  }

  _createClass(RestFlexClient, [{
    key: 'connectClient',
    value: function connectClient() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (Auth0.isAuthenticated()) {
          var entityToken = Auth0.getExtraToken(_this.baseURL);
          if (!entityToken) {
            Auth0.silentAuth(_this.baseURL, _this.audience, 'get:' + _this.domain + ' put:' + _this.domain + ' delete:' + _this.domain + ' post:' + _this.domain).then(function () {
              _this.updateClient(true, _this.baseURL);
              resolve();
            });
          } else {
            resolve();
          }
        } else {
          reject('No session');
        }
      });
    }
  }, {
    key: 'updateClient',
    value: function updateClient(authenticated, baseURL) {
      var axiosConfig = {
        baseURL: baseURL,
        timeout: timeout
      };

      if (authenticated) {
        axiosConfig.headers = {
          'Authorization': 'Bearer ' + Auth0.getExtraToken(baseURL)
        };
      }

      this.client = axios.create(axiosConfig);
    }
  }, {
    key: 'insert',
    value: function insert(object) {
      return this.client.post('/', object);
    }
  }, {
    key: 'get',
    value: function get(id) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.connectClient().then(function () {
          _this2.client.get('/' + (id || '')).then(function (response) {
            var data = response.data;
            if (Array.isArray(response.data)) {
              data = data.map(RestFlexClient.jsonToObject);
            } else {
              data = RestFlexClient.jsonToObject(data);
            }
            resolve(data);
          }).catch(reject);
        }).catch(reject);
      });
    }
  }, {
    key: 'update',
    value: function update(id, object) {
      return this.client.put('/' + id, object);
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
//# sourceMappingURL=RestFlexClient.js.map