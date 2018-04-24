const axios = require('axios');
const Auth0 = require('@digituz/auth0-web');

const timeout = 5000;

class RestFlexClient {
  constructor(baseURL, audience, domain, auth0Config) {
    Auth0.configure(auth0Config);
    Auth0.subscribe((authenticated) => {
      if (authenticated) {
        const entityToken = Auth0.getExtraToken(baseURL);
        if (!entityToken) {
          Auth0.silentAuth(baseURL, audience, `get:${domain} put:${domain} delete:${domain} post:${domain}`)
            .then(() => {
              this.updateClient(authenticated, baseURL);
            });
        }
      }

      this.updateClient(authenticated, baseURL);
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
      this.client.get(`/${id || ''}`).then((response) => {
        let data = response.data;
        if (Array.isArray(response.data)) {
          data = data.map(RestFlexClient.jsonToObject);
        } else {
          data = RestFlexClient.jsonToObject(data);
        }
        resolve(data);
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
