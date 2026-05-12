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

// DELETE event
app.delete("/events/:id", (req, res) => {

    fs.readFile(DATA_FILE, "utf8", (err, data) => {

        let events = data ? JSON.parse(data) : [];

        events = events.filter(
            e => e.id !== req.params.id
        );

        fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2), () => {
            res.json({ success: true });
        });
    });
});

// UPDATE event
app.put("/events/:id", (req, res) => {

    fs.readFile(DATA_FILE, "utf8", (err, data) => {

        const events = data ? JSON.parse(data) : [];

        const eventIndex = events.findIndex(
            e => e.id === req.params.id
        );

        if (eventIndex === -1) {
            return res.status(404).json({ error: "Event not found" });
        }

        const updatedEvent = {
            ...events[eventIndex],
            title: req.body.title,
            date: req.body.date,
            category: req.body.category,
            comment: req.body.comment || ""
        };

        events[eventIndex] = updatedEvent;

        fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2), () => {
            res.json(updatedEvent);
        });
    });
});

app.listen(3000, () => {
    console.log("http://localhost:3000");
});
