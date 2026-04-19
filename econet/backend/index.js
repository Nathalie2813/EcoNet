const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let data = [];

app.post("/save", (req, res) => {
  data = req.body;
  res.send({ success: true });
});

app.get("/data", (req, res) => {
  res.send(data);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});