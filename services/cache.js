const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/ci");

const exec = mongoose.Query.prototype.exec;

const redisURL = keys.redisUrl;
const client = redis.createClient(redisURL);
client.get = util.promisify(client.get);

mongoose.Query.prototype.Cache = function() {
  this.useCache = true;
  return this;
};

mongoose.Query.prototype.exec = async function() {
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  // See if we have a value for key in redis
  const cacheValue = await client.get(key);

  // If we do, return that
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }
  const result = await exec.apply(this, arguments);
  client.set(key, JSON.stringify(result));
  return result;
};
