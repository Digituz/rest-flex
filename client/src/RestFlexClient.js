const axios = require('axios');
const Auth0 = require('@digituz/auth0-web');

const timeout = 5000;

class RestFlexClient {
  constructor(baseURL, audience, domain, auth0Config) {
    Auth0.configure(auth0Config);

    this.audience = audience;
    this.baseURL = baseURL;
    this.domain = domain;
    this.updateClient(Auth0.isAuthenticated(), baseURL);
  }

  connectClient() {
    return new Promise((resolve, reject) => {
      if (Auth0.isAuthenticated()) {
        const entityToken = Auth0.getExtraToken(this.baseURL);
        if (!entityToken) {
          Auth0.silentAuth(this.baseURL, this.audience, `get:${this.domain} put:${this.domain} delete:${this.domain} post:${this.domain}`)
            .then(() => {
              this.updateClient(true, this.baseURL);
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

  updateClient(authenticated, baseURL) {
    const axiosConfig = {
      baseURL,
      timeout,
    };

    if (authenticated) {
      axiosConfig.headers = {
        'Authorization': `Bearer ${Auth0.getExtraToken(baseURL)}`
      };
    }

    this.client = axios.create(axiosConfig);
  }

  insert(object) {
    return this.client.post('/', object);
  };

  get(id) {
    return new Promise((resolve, reject) => {
      this.connectClient().then(() => {
        this.client.get(`/${id || ''}`).then((response) => {
          let data = response.data;
          if (Array.isArray(response.data)) {
            data = data.map(RestFlexClient.jsonToObject);
          } else {
            data = RestFlexClient.jsonToObject(data);
          }
          resolve(data);
        }).catch(reject);
      }).catch(reject);
    });
  };

  update(id, object) {
    return this.client.put(`/${id}`, object);
  };

  remove(id) {
    return this.client.delete(`/${id}`);
  };

  static jsonToObject(json) {
    const properties = Object.getOwnPropertyNames(json);
    const object = {};
    properties.forEach((property) => {
      let value = json[property];
      if (value.length >= 24) {
        value = new Date(value);
      }
      object[property] = isNaN(value) ? json[property] : value;
    });
    return object;
  };
}

module.exports = RestFlexClient;
