const express = require("express");
const { MongoClient } = require("mongodb");
const ledgerRoutes = require("./src/routes.js");

async function main() {
  try {
    const app = express();
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
    console.log("Connected correctly to server");

    app.use(express.json());

    ledgerRoutes(app, client);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main().catch(console.error);
