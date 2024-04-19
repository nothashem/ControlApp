module.exports = function (app, client) {
  app.post("/api/v1/token/extend", async (req, res) => {
    try {
      const { SessionID } = req.body;

      const FindToken = await client
        .db("AccountManagementDB")
        .collection("Token")
        .findOne({ SessionID });

      if (!FindToken) {
        return res
          .status(400)
          .send({ message: "No session found with this SessionID" });
      }

      const Logoutinquery = await client
        .db("AccountManagementDB")
        .collection("Token")
        .findOne({ SessionID });

      if (Logoutinquery.logout_at) {
        return res.status(400).send({ message: "Session has expired" });
      }

      const Expried = FindToken.expires_at;
      const Now = new Date().getTime();
      const NewExpiry = Now + 10 * 60 * 60 * 1000; // 10 minutes from now

      const UpdateToken = await client
        .db("AccountManagementDB")
        .collection("Token")
        .updateOne({ SessionID }, { $set: { expires_at: NewExpiry } });

      await client
        .db("AccountManagementDB")
        .collection("Authentication_log")
        .insertOne({
          userid: FindToken.userid,
          action: "Token_Extend",
          action_by: "Internal",
          action_at: new Date().getTime(),
        });

      res
        .status(201)
        .send({ message: "Token Extended Successfully", Seassion: FindToken });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error extending token" });
    }
  });
};
