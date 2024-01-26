
const { MongoClient } = require('mongodb');
let db;//Variable that points to the real DB.
async function connectToDb() {
	  console.log("connect to db called");
	  const url = process.env.ATLAS_URI;
	  const client = new MongoClient(url, { useNewUrlParser: true });
	  await client.connect();
	  console.log('Connected to MongoDB');
	  db = client.db();
	  return db;
}

module.exports = {connectToDb};
