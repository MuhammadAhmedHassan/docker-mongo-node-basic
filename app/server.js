const express = require("express");
const path = require("path");
const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;

const app = express();

app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/profile-picture", function (req, res) {
  const img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
  res.writeHead(200, { "Content-Type": "image/jpg" });
  res.end(img, "binary");
});

// use when starting application locally
const mongoUrlLocal = "mongodb://admin:root@localhost:27017";

// use when starting application as docker container
const mongoUrlDocker = "mongodb://admin:root@mongodb";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
const mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// "user-account" in demo with docker. "my-db" in demo with docker-compose
const databaseName = "my-db";

app.post("/update-profile", async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(mongoUrlLocal);
    const userObj = req.body;
    const db = client.db(databaseName);
    userObj["userid"] = 1;
    const myquery = { userid: 1 };
    const newvalues = { $set: userObj };
    await db
      .collection("users")
      .updateOne(myquery, newvalues, { upsert: true });

    // Send response
    res.send(userObj);
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
});

app.get("/get-profile", async (req, res) => {
  let client;
  try {
    // Connect to the db
    client = await MongoClient.connect(mongoUrlLocal);
    const db = client.db(databaseName);
    const myquery = { userid: 1 };
    const result = await db.collection("users").findOne(myquery);
    // Send response
    res.send(result ? result : {});
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
});

async function start() {
  try {
    // client = await MongoClient.connect("mongodb://admin:root@localhost:27017");
    app.listen(3000, () => console.log("server started on port 3000"));
  } catch (error) {
    console.log(error);
    throw error;
  }
}

start();
