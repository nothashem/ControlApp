const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const helmet = require('helmet');
const app = express();
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid').v4;
let client;

// MongoDB connection setup
async function main() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); // Added useUnifiedTopology

  try {
    await client.connect();
    console.log("Connected correctly to server");







app.use(express.json());

app.post('/api/v1/register', async (req, res) => {
  try {
    // Extract user details from request body
    const { FirstName, LastName, DOB, email, password } = req.body;

    // Validate user details (basic example)
    if (!FirstName || !LastName || !DOB || !email || !password) {
      return res.status(400).send({ message: 'FirstName, LastName, DOB, email and password are required' });
    }

if (DOB.length !== 10) {
  return res.status(400).send({ message: 'DOB must be in the format DD/MM/YYYY' });
}
if (email.length < 4) {
  return res.status(400).send({ message: 'Email must be at least 4 characters' });
}
if (password.length < 8) {
  return res.status(400).send({ message: 'Password must be at least 8 characters' });
}
    const userExists = await client.db("AccountManagementDB").collection("Accounts").findOne({ email });
    if (userExists) {
      return res.status(400).send({ message: 'User already exists with this email' });
    }
const uniqueId = uuidv4();
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in the database
    const user = await client.db("AccountManagementDB").collection("Accounts").insertOne({
      FirstName: FirstName,
      LastName: LastName,
      DOB: DOB,
      email: email,
      password: hashedPassword,
      userid: uniqueId
    });
    const authenticationlog = await client.db("AccountManagementDB").collection("Authentication_log").insertOne({
      userid: uniqueId,
      action: 'Create',
      action_by: "Internal",
      action_at: new Date().getTime(),
    });

/// We need to post to the Ledger Service to create an ledger account for the user

    res.status(201).send({ message: 'User created successfully', userId: user.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error creating user' });
  }
});

    app.post('/api/v1/login', async (req, res) => {
      try {
        // Extract user details from request body
        const { email, password } = req.body;
    
        // Validate user details (basic example)
        if (!email || !password) {
          return res.status(400).send({ message: 'email and password are required' });
        }
    

   
   
    const find = await client.db("AccountManagementDB").collection("Accounts").findOne({ email });
  if (!find) {
    return res.status(400).send({ message: 'No user found with this email' });
  }

// Compare provided password with hashed password in the database
  const isMatch = await bcrypt.compare(password, find.password);
  if (!isMatch) {
    return res.status(400).send({ message: 'Invalid password' });
  }
    const SessionID = uuidv4();

        // Create Token in the database
        const SessionToken = await client.db("AccountManagementDB").collection("Token").insertOne({
          SessionID: SessionID,
          userid: find.userid,
          email: email,
          created_at: new Date().getTime(),
          expires_at: new Date().getTime() + 15 * 60 * 60 * 1000 // 15 mintues from now
        });
    
        const authenticationlog = await client.db("AccountManagementDB").collection("Authentication_log").insertOne({
          userid: find.userid,
          action: 'Login',
          action_by: "Internal",
          action_at: new Date().getTime(),
        });    
    
        res.status(201).send({ message: 'Login Successful', SessionID: SessionID });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error logging in' });
      }
    });

    app.delete('/api/v1/logout', async (req, res) => {
      try {
        const { SessionID } = req.body;
    
        // Validate user details (basic example)
        if (!SessionID) {
          return res.status(400).send({ message: 'SessionID is required' });
        }
    
   
        const FindToken = await client.db("AccountManagementDB").collection("Token").findOne({ SessionID });
        if (!FindToken) {
          return res.status(400).send({ message: 'No session found with this SessionID' });
        }
        const DeleteToken = await client.db("AccountManagementDB").collection("Token").deleteOne({ SessionID });
        const SetExipriedField = await client.db("AccountManagementDB").collection("Token").updateOne({ SessionID }, { $set: { logout_at: new Date().getTime() } });
        const authenticationlog = await client.db("AccountManagementDB").collection("Authentication_log").insertOne({
          userid: FindToken.userid,
          action: 'Logout',
          action_by: "Internal",
          action_at: new Date().getTime(),
        });  
    
        res.status(201).send({ message: 'Seassion Logged out Successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error logging out' });
      }
    });

app.get('/api/v1/token/:token', async (req, res) => {
const { token } = req.body;
const FindToken = await client.db("AccountManagementDB").collection("Token").findOne({ SessionID: token });
if (!FindToken) {
  return res.status(400).send({ message: 'No session found with this SessionID' });
}
const Logoutinquery = await client.db("AccountManagementDB").collection("Token").findOne({ SessionID });
if (Logoutinquery.logout_at) {
  return res.status(400).send({ message: 'Session has expired' });
}
const Expried = FindToken.expires_at;
const Now = new Date().getTime();
if (Expried < Now) {
  return res.status(400).send({ message: 'Session has expired' });
}
const User = await client.db("AccountManagementDB").collection("Accounts").findOne({ userid: FindToken.userid });
res.status(201).send({ message: 'Session is valid', Seassion: FindToken });
const authenticationlog = await client.db("AccountManagementDB").collection("Authentication_log").insertOne({
  userid: FindToken.userid,
  action: 'Token_validation',
  action_by: "Internal",
  action_at: new Date().getTime(),
});  

});

app.post('/api/v1/token/extend', async (req, res) => {
const { SessionID } = req.body;
const FindToken = await client.db("AccountManagementDB").collection("Token").findOne({ SessionID });
if (!FindToken) {
  return res.status(400).send({ message: 'No session found with this SessionID' });
}
const Logoutinquery = await client.db("AccountManagementDB").collection("Token").findOne({ SessionID });
if (Logoutinquery.logout_at) {
  return res.status(400).send({ message: 'Session has expired' });
}

const Expried = FindToken.expires_at;
const Now = new Date().getTime();
const NewExpiry = Now + 10 * 60 * 60 * 1000; // 10 mintues from now
const UpdateToken = await client.db("AccountManagementDB").collection("Token").updateOne({ SessionID }, { $set: { expires_at: NewExpiry } });
const authenticationlog = await client.db("AccountManagementDB").collection("Authentication_log").insertOne({
  userid: FindToken.userid,
  action: 'Token_Extend',
  action_by: "Internal",
  action_at: new Date().getTime(),
});  
res.status(201).send({ message: 'Token Extended Successfully', Seassion: FindToken });

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

} catch (err) {
console.error(err);
process.exit(1);
} finally {
// Consider when and how you close the client connection
// await client.close();
}
}

main().catch(console.error);
