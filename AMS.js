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

    //Ledger posting...


    res.status(201).send({ message: 'User created successfully', userId: user.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error creating user' });
  }
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
