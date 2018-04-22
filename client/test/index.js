const RestFlexClient = require('../dist/RestFlexClient');
const app = require('./fake-server');
const LocalStorage = require('node-localstorage').LocalStorage;

// no const, let, var to make it global
localStorage = new LocalStorage('./localStorage');

const server = app.listen(3000, () => (console.log('Fake server listening on port 3000')));

const url = 'http://localhost:3000';

console.log(RestFlexClient);

const client = new RestFlexClient(url);

client.insert({
  name: 'Bruno Krebs',
}).then(() => {
  client.get().then((res) => {
    console.log(res);
    localStorage._deleteLocation();
    server.close();
  });
});
