const bcrypt = require("bcryptjs");
const uuidv4 = require("uuid").v4;

module.exports = function (app, client) {
  app.post("/api/v1/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .send({ message: "email and password are required" });
      }

      const user = await client
        .db("AccountManagementDB")
        .collection("Accounts")
        .findOne({ email });

      if (!user) {
        return res
          .status(400)
          .send({ message: "No user found with this email" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).send({ message: "Invalid password" });
      }

      const SessionID = uuidv4();

      const SessionToken = await client
        .db("AccountManagementDB")
        .collection("Token")
        .insertOne({
          SessionID: SessionID,
          userid: user.userid,
          email: email,
          created_at: new Date().getTime(),
          expires_at: new Date().getTime() + 15 * 60 * 60 * 1000, // 15 mintues from now
        });

      await client
        .db("AccountManagementDB")
        .collection("Authentication_log")
        .insertOne({
          userid: user.userid,
          action: "Login",
          action_by: "Internal",
          action_at: new Date().getTime(),
        });

      res
        .status(201)
        .send({ message: "Login Successful", SessionID: SessionID });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error logging in" });
    }
  });
};
