module.exports = function (app, client) {
  app.delete("/api/v1/logout", async (req, res) => {
    try {
      const { SessionID } = req.body;

      if (!SessionID) {
        return res.status(400).send({ message: "SessionID is required" });
      }

      const FindToken = await client
        .db("AccountManagementDB")
        .collection("Token")
        .findOne({ SessionID });

      if (!FindToken) {
        return res
          .status(400)
          .send({ message: "No session found with this SessionID" });
      }

      await client
        .db("AccountManagementDB")
        .collection("Token")
        .deleteOne({ SessionID });

      await client
        .db("AccountManagementDB")
        .collection("Token")
        .updateOne(
          { SessionID },
          { $set: { logout_at: new Date().getTime() } }
        );

      await client
        .db("AccountManagementDB")
        .collection("Authentication_log")
        .insertOne({
          userid: FindToken.userid,
          action: "Logout",
          action_by: "Internal",
          action_at: new Date().getTime(),
        });

      res.status(201).send({ message: "Session Logged out Successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error logging out" });
    }
  });
};
