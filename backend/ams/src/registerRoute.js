const bcrypt = require("bcryptjs");
const uuidv4 = require("uuid").v4;

module.exports = function (app, client) {
  app.post("/api/v1/register", async (req, res) => {
    try {
      const { FirstName, LastName, DOB, email, password } = req.body;

      if (!FirstName || !LastName || !DOB || !email || !password) {
        return res.status(400).send({
          message: "FirstName, LastName, DOB, email and password are required",
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

      if (password.length < 8) {
        return res
          .status(400)
          .send({ message: "Password must be at least 8 characters" });
      }

      const userExists = await client
        .db("AccountManagementDB")
        .collection("Accounts")
        .findOne({ email });

      if (userExists) {
        return res
          .status(400)
          .send({ message: "User already exists with this email" });
      }

      const uniqueId = uuidv4();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await client
        .db("AccountManagementDB")
        .collection("Accounts")
        .insertOne({
          FirstName: FirstName,
          LastName: LastName,
          DOB: DOB,
          email: email,
          password: hashedPassword,
          userid: uniqueId,
        });

      await client
        .db("AccountManagementDB")
        .collection("Authentication_log")
        .insertOne({
          userid: uniqueId,
          action: "Create",
          action_by: "Internal",
          action_at: new Date().getTime(),
        });

      res.status(201).send({
        message: "User created successfully",
        userId: user.insertedId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error creating user" });
    }
  });
};
