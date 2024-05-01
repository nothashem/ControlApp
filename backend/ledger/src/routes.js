const { v4: uuidv4 } = require("uuid");

module.exports = function (app, client) {
  app.post("/api/v1/CreateLedger", async (req, res) => {
    try {
      const Internal_authentication_key =
        req.headers["internal_authentication_key"];
      const { FirstName, LastName, DOB, email, userid } = req.body;

      // Validate user details
      if (!FirstName || !LastName || !DOB || !email || !userid) {
        return res.status(400).send({
          message: "FirstName, LastName, DOB, email and userid are required",
        });
      }

      if (DOB.length !== 10) {
        return res
          .status(400)
          .send({ message: "DOB must be in the format DD/MM/YYYY" });
      }
      if (email.length < 4) {
        return res
          .status(400)
          .send({ message: "Email must be at least 4 characters" });
      }

      const authentication_key = await client
        .db("Ledger")
        .collection("Authentication_keys")
        .findOne({
          Internal_authentication_key: Internal_authentication_key,
        });
      if (!authentication_key) {
        return res.status(400).send({ message: "Invalid authentication key" });
      }

      const Ledgerid = uuidv4();

      const user = await client.db("Ledger").collection("Accounts").insertOne({
        FirstName: FirstName,
        LastName: LastName,
        DOB: DOB,
        email: email,
        userid: userid,
        Ledgerid: Ledgerid,
        balance: 0,
      });

      const authenticationlog = await client
        .db("Ledger")
        .collection("Authentication_log")
        .insertOne({
          Ledgerid: Ledgerid,
          action: "Create",
          action_by: Internal_authentication_key,
          action_at: new Date(),
        });

      res
        .status(201)
        .send({ message: "Ledger created successfully", Ledgerid: Ledgerid });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error creating Ledger" });
    }
  });
  app.post("/api/v1/LogLedger", async (req, res) => {
    // This endpoint to log any entry into the database
    try {
      const Internal_authentication_key =
        req.headers["internal_authentication_key"];
      const { userid, amount, credit, debit, transaction_id, cardUsed } =
        req.body;
      const authentication_key = await client
        .db("Ledger")
        .collection("Authentication_keys")
        .findOne({
          Internal_authentication_key: Internal_authentication_key,
        });
      if (!authentication_key) {
        return res.status(400).send({ message: "Invalid authentication key" });
      }
      // Validate user details
      if (!userid || !amount || credit == null || debit == null) {
        return res.status(400).send({
          message: "userid, amount, credit, and debit are required",
        });
      }
      if (credit && debit) {
        return res.status(400).send({
          message: "credit and debit cannot be true at the same time",
        });
      }
      if (!credit && !debit) {
        return res.status(400).send({
          message: "credit and debit cannot be false at the same time",
        });
      }

      const user = await client
        .db("Ledger")
        .collection("Accounts")
        .findOne({ userid: userid });
      if (!user) {
        return res.status(400).send({ message: "Invalid userid" });
      }

      if (debit == true) {
        if (user.balance < amount) {
          return res.status(403).send({ message: "Insufficient funds" });
        }
      }
      if (credit) {
        await client
          .db("Ledger")
          .collection("Accounts")
          .updateOne({ userid: userid }, { $inc: { balance: amount } });
      } else if (debit) {
        await client
          .db("Ledger")
          .collection("Accounts")
          .updateOne({ userid: userid }, { $inc: { balance: -amount } });
      }

      Ledgerid = uuidv4();
      const LedgerLog = await client
        .db("Ledger")
        .collection("Ledger_log")
        .insertOne({
          Ledgerid: Ledgerid,
          userid: userid,
          amount: amount,
          credit: credit,
          debit: debit,
          transaction_id: transaction_id,
          card: cardUsed || null,
          action_at: new Date().getTime(),
        });

      //Posting Back to The Card Controller

      return res.status(201).send({
        message: "Transaction logged successfully",
        Ledgerid: Ledgerid,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error logging transaction" });
    }
  });
  app.post("/api/v1/LogCard", async (req, res) => {
    // This endpoint to log any entry into the database
    try {
      const Internal_authentication_key =
        req.headers["internal_authentication_key"];
      const { userid, amount, credit, debit, transaction_id, card_id, Merchantid, currency, description } =
        req.body;
      const authentication_key = await client
        .db("Ledger")
        .collection("Cards")
        .findOne({
          Internal_authentication_key: Internal_authentication_key,
        });
      if (!authentication_key) {
        return res.status(400).send({ message: "Invalid authentication key" });
      }
      // Validate user details
      if (!userid || !amount || !currency || card_id || credit == null || debit == null) {
        return res.status(400).send({
          message: "userid, amount, credit, and debit are required",
        });
      }
      if (credit && debit) {
        return res.status(400).send({
          message: "credit and debit cannot be true at the same time",
        });
      }
      if (!credit && !debit) {
        return res.status(400).send({
          message: "credit and debit cannot be false at the same time",
        });
      }

    
// Card Transaction before going to the ledger


const user = await client
.db("Ledger")
.collection("Accounts")
.findOne({ userid: userid });
if (!user) {
return res.status(400).send({ message: "Invalid userid" });
}

if (debit == true) {
if (user.balance < amount) {
  return res.status(403).send({ message: "Insufficient funds" });
}
}
if (credit) {
await client
  .db("Ledger")
  .collection("Accounts")
  .updateOne({ userid: userid }, { $inc: { balance: amount } });
} else if (debit) {
await client
  .db("Ledger")
  .collection("Accounts")
  .updateOne({ userid: userid }, { $inc: { balance: -amount } });
}
      // Main Ledger Transaction
      Ledgerid = uuidv4();
      const LedgerLog = await client
        .db("Ledger")
        .collection("Ledger_log")
        .insertOne({
          Ledgerid: Ledgerid,
          userid: userid,
          amount: amount,
          credit: credit,
          debit: debit,
          currency: currency,
          description: description,
          transaction_id: transaction_id,
          card: card_id || null,
          action_at: new Date().getTime(),
        });



      return res.status(201).send({
        message: "Transaction logged successfully",
        Ledgerid: Ledgerid,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error logging transaction" });
    }
  });

  app.put("/api/v1/AddService", async (req, res) => {
    // This endpoint to log any entry into the database
    try {
      const Internal_authentication_key =
        req.headers["internal_authentication_key"];
      const { ServiceName, ServiceID } = req.body;
      const authentication_key = await client
        .db("Ledger")
        .collection("Authentication_keys")
        .findOne({
          Internal_authentication_key: Internal_authentication_key,
        });
      if (!authentication_key) {
        return res.status(400).send({ message: "Invalid authentication key" });
      }

      new_key = uuidv4();
      const Key = await client
        .db("Ledger")
        .collection("Authentication_keys")
        .insertOne({
          ServiceName: ServiceName,
          ServiceID: ServiceID,
          Internal_authentication_key: new_key,
        });
      Ledgerid = uuidv4();
      const authenticationlog = await client
        .db("Ledger")
        .collection("Authentication_log")
        .insertOne({
          Ledgerid: Ledgerid,
          action: "Add Service",
          action_by: Internal_authentication_key,
          action_at: new Date(),
        });

      //Posting Back to The Card Controller
      const response = {
        ServiceName: ServiceName,
        ServiceID: ServiceID,
        Internal_authentication_key: new_key,
      };

      return res.status(201).send({ response });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error adding service" });
    }
  });
  app.put("/api/v1/UpdateService", async (req, res) => {
    // This endpoint to log any entry into the database
    try {
      const Internal_authentication_key =
        req.headers["internal_authentication_key"];
      const { ServiceName, ServiceID } = req.body;
      const authentication_key = await client
        .db("Ledger")
        .collection("Authentication_keys")
        .findOne({
          Internal_authentication_key: Internal_authentication_key,
        });
      if (!authentication_key) {
        return res.status(400).send({ message: "Invalid authentication key" });
      }

      new_key = uuidv4();
      const Key = await client
        .db("Ledger")
        .collection("Authentication_keys")
        .updateOne(
          { Internal_authentication_key: Internal_authentication_key },
          { $set: { Internal_authentication_key: new_key } }
        );
      Ledgerid = uuidv4();
      const authenticationlog = await client
        .db("Ledger")
        .collection("Authentication_log")
        .insertOne({
          Ledgerid: Ledgerid,
          action: "Update Service",
          action_by: Internal_authentication_key,
          soon_to_be: new_key,
          action_at: new Date(),
        });

      return res.status(201).send({ Internal_authentication_key: new_key });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error updating service" });
    }
  });
};
