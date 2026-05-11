const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const DATA_FILE = "./data/events.json";

// GET all events
app.get("/events", (req, res) => {
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        res.json(data ? JSON.parse(data) : []);
    });
});

// CREATE event
app.post("/events", (req, res) => {

    fs.readFile(DATA_FILE, "utf8", (err, data) => {

        let events = data ? JSON.parse(data) : [];

        const newEvent = {
            id: Date.now().toString(),
            title: req.body.title,
            date: req.body.date,
            category: req.body.category,
            comment: req.body.comment || ""
        };

        events.push(newEvent);

        fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2), () => {
            res.json(newEvent);
        });
    });
});

app.listen(3000, () => {
    console.log("http://localhost:3000");
});