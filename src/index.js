const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('koa-jwt');
const {koaJwtSecret} = require('jwks-rsa');
const cors = require('kcors');
const DomainAPI = require('./endpoints');

function GenericRouter({ domain, auth0Domain, auth0Audience, mongoDBUrl, publicRead, publicWrite }) {
  const router = new Router();

  router.use(bodyParser());
  router.use(cors());

  router.use(async function (ctx, next) {
    try {
      await next();
    } catch (err) {
      ctx.status = err.statusCode || 400;
      if (err.message && err.message.indexOf('Unexpected token') === 0 && err.message.indexOf('JSON') > 1){
        return ctx.body = { 'message': 'It looks like the filter parameter passed contains a wrong structure.' }
      }

      if (err.name !== 'UnauthorizedError') {
        console.error('### Oooops!');
        console.error(`### An error occurred on ${(new Date()).toString()}`);
        console.error(err);
      }
      ctx.body = {
        'message': err.message || 'Ooops, something went wrong.'
      }
    }
  });

  async function checkToken(ctx, next) {
    const reading = ctx.method.toLowerCase() === 'get';
    const writing = !reading;
    if ((reading && publicRead) || (writing && publicWrite)) return next();
    return jwt({
      secret: koaJwtSecret({
        jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
        cache: true
      }),
      audience: auth0Audience,
      issuer: `https://${auth0Domain}/`,
      debug: true,
      passthrough: true,
    })(ctx, next);
  }

  async function checkScopes(ctx, next) {
    const {id} = ctx.params;
    const reading = ctx.method.toLowerCase() === 'get';
    const writing = !reading;

    const user = ctx.state.user || { scope: '' };

    const scopes = user.scope.split(' ');
    const scopeNeeded = ctx.method.toLowerCase() + ':' + domain;
    const hasScopes = (reading && publicRead) || (writing && publicWrite) || scopes.find(element => {
      return element === scopeNeeded;
    });

    if (hasScopes) {
      ctx.state.id = id;
      return await next();
    }
    return ctx.status = 401;
  }

  router.use(checkToken);

  const domainAPI = new DomainAPI(domain, mongoDBUrl);

  router.get('/', checkScopes, domainAPI.getEntities);
  router.get('/:id', checkScopes, domainAPI.getEntity);
  router.post('/', checkScopes, domainAPI.addNewEntity);
  router.put('/:id', checkScopes, domainAPI.updateEntity);
  router.delete('/:id', checkScopes, domainAPI.deleteEntity);

  return router;
}

module.exports = GenericRouter;
