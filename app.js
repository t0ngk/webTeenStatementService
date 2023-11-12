const express = require("express");
const cors = require("cors");
const Eureka = require("eureka-js-client").Eureka;
const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://admin:tong2504@cluster0.o5fzaup.mongodb.net/webteen?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

const statementSchema = new mongoose.Schema({
  userId: String,
  price: Number,
  status: String,
  type: String,
  amount: Number,
});

const Statement = mongoose.model("Statement", statementSchema);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post("/statement", async (req, res) => {
  const userId = req.headers.userid;

  const payload = {
    userId,
    ...req.body,
  };
  try {
    const statement = new Statement(payload);
    await statement.save();
  } catch (error) {
    console.log(error);
    res.send("Error" + error.message);
  }
  res.send("Statement created!");
});

app.get("/statement", async (req, res) => {
  const userId = req.headers.userid;
  const statements = await Statement.find({ userId });
  res.send(statements);
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Eureka configuration
const client = new Eureka({
  instance: {
    app: "statement-service",
    hostName: "localhost",
    ipAddr: "127.0.0.1",
    statusPageUrl: `http://localhost:${port}/info`,
    healthCheckUrl: `http://localhost:${port}/health`,
    port: {
      $: port,
      "@enabled": "true",
    },
    vipAddress: "statement-service",
    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
  },
  eureka: {
    host: "localhost",
    port: 8761,
    servicePath: "/eureka/apps/",
  },
});

client.start();
