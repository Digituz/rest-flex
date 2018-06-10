const GenericMongo = require('./mongo');

class DomainAPI {
  constructor(domain, mongoDbUrl) {
    this.mongo = new GenericMongo(domain, mongoDbUrl);
  }

  async getEntities(ctx) {
    const {state, query} = ctx;

    ctx.body = await this.mongo.find(
      state.id,
      JSON.parse(query.filter || '{}'),
      JSON.parse(query.sort || '{}')
    );

    ctx.body = ctx.body || [];
    ok(ctx);
  }

  async getEntity(ctx) {
    ctx.body = await this.mongo.findOne(ctx.state.id);
    ctx.body ? this._ok(ctx) : this._notFound(ctx);
  }

  async addNewEntity(ctx) {
    await this.mongo.insert(ctx.request.body);
    ok(ctx);
  }

  async updateEntity(ctx) {
    await this.mongo.update(ctx.state.id, ctx.request.body);
    ok(ctx);
  }

  async deleteEntity(ctx) {
    (await this.mongo.deleteOne(ctx.state.id)).deletedCount > 0 ? ok(ctx) : notFound(ctx);
  }

  _ok(ctx) {
    ctx.status = 200;
    ctx.body = ctx.body || {message: "Ok"};
  }

  _notFound(ctx) {
    ctx.status = 404;
    ctx.body = {
      message: "Not Found"
    }
  }
}

module.exports = DomainAPI;
