const mongoose = require('mongoose');

const uri = "mongodb+srv://doadmin:67Pe193CTF28d4hB@mongo-v7-2a0c8182.mongo.ondigitalocean.com/kalp-erp?tls=true&authSource=admin&replicaSet=mongo-v7";

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const collection = db.collection('driveitems');
  const item = await collection.findOne({ _id: new mongoose.Types.ObjectId("69bea05b55ae0252d3851b6b") });
  console.log(item);
  process.exit(0);
}

main().catch(console.error);
