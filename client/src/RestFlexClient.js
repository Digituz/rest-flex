import fetch from 'isomorphic-unfetch';

class RestFlexClient {
  constructor(baseURL, token) {
    this.baseURL = baseURL;

    if (token) {
      this.headers = !token ? {} : {
        'Authorization': `Bearer ${token}`,
      };
    } else {
      this.headers = {};
    }
  }

  insert(object) {
    return fetch(this.baseURL, {
      method: 'POST',
      headers: this.headers,
      body: object,
    });
  };

  get(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${this.baseURL}/${id || ''}`, {
          headers: this.headers,
        });
        let data = await response.json();
        if (Array.isArray(data)) {
          data = data.map(RestFlexClient.jsonToObject);
        } else {
          data = RestFlexClient.jsonToObject(data);
        }
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
  };

  find(filter, sort) {
    const filterParam = JSON.stringify(filter);
    const sortParam = sort ? JSON.stringify(sort) : null;
    let url = `${this.baseURL}/?`;
    url = filter ? `${url}filter=${filterParam}&` : url;
    url = sort ? `${url}sort=${sortParam}&` : url;
    return fetch(url, {
      headers: this.headers,
    });
  }

  update(id, object) {
    return fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(object)
    });
  }

  remove(id) {
    return fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
  }

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
