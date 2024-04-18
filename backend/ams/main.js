const express = require("express");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const uuidv4 = require("uuid").v4;
const {
  registerRoute,
  loginRoute,
  logoutRoute,
  tokenRoute,
  extendTokenRoute,
} = require("./src/routes");

async function main() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("MONGO_URI not set");
      process.exit(1);
    }

    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log("🔌 Connected correctly to mongodb server");

    const app = express();
    app.use(express.json());

    registerRoute(app, client, bcrypt, uuidv4);
    loginRoute(app, client, bcrypt, uuidv4);
    logoutRoute(app, client);
    tokenRoute(app, client);
    extendTokenRoute(app, client);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main().catch(console.error);
