const mongodb = require('mongodb');
const {promisify} = require('util');

class GenericMongo {
  constructor(domain, mongoDbUrl) {
    this.domain = domain;
    this.mongoDbUrl = mongoDbUrl;
  }

  async getCollection() {
    if (!this.collection) {
      const asyncConnect = promisify(mongodb.MongoClient.connect);
      const connection = await asyncConnect('mongodb://' + this.mongoDbUrl);
      this.collection = connection.collection(this.domain);
    }
    return this.collection;
  }

  async insert(data) {
    delete data._id;
    const collection = await this.getCollection();
    if (!Array.isArray(data)) {
      await collection.insertOne(data);
    } else {
      await collection.insertMany(data);
    }
  }

  async update(id, data) {
    const collection = await this.getCollection();
    if (!Array.isArray(data)) {
      delete data._id;
      await collection.updateOne({_id: id }, { $set: { ...data } });
    }
  }

  async find(id, filter, sort) {
    const collection = await this.getCollection();
    const result = await collection.find(filter).sort(sort);
    return await result.toArray();
  }

  async findOne(id) {
    const collection = await this.getCollection();
    return await collection.findOne({"_id": mongodb.ObjectId(id)});
  }

  async deleteOne(id) {
    const collection = await this.getCollection();
    return await collection.deleteOne({"_id": mongodb.ObjectId(id)});
  }

}

module.exports = GenericMongo;
