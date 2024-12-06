const express = require("express");
const mqtt = require("mqtt");

// Konfigurasi MQTT
const brokerUrl = "ws://broker.hivemq.com:8000/mqtt";
const topics = ["mettler_me204t", "topic2", "topic3"]; // Tambahkan topik di sini

// Penyimpanan sementara untuk data MQTT
let latestMessages = {};

// Inisialisasi MQTT Client
const mqttClient = mqtt.connect(brokerUrl);

mqttClient.on("connect", () => {
    console.log(`Connected to MQTT broker at ${brokerUrl}`);
    mqttClient.subscribe(topics, (err) => {
        if (err) {
            console.error("Failed to subscribe to topics", err);
        } else {
            console.log(`Subscribed to topics: ${topics.join(", ")}`);
        }
    });
});

mqttClient.on("message", (topic, message) => {
    console.log(`Message received on topic ${topic}: ${message.toString()}`);
    latestMessages[topic] = message.toString(); // Simpan pesan berdasarkan topik
});

// Inisialisasi Express App
const app = express();

// Endpoint API untuk mendapatkan data dari topik tertentu
app.get("/api/mqtt-data", (req, res) => {
    const topic = req.query.topic;

    if (topic && latestMessages[topic]) {
        res.json({
            topic: topic,
            message: latestMessages[topic],
        });
    } else {
        res.status(404).json({
            error: "No data available for the requested topic",
        });
    }
});

// Endpoint API untuk mendapatkan semua data
app.get("/api/all-mqtt-data", (req, res) => {
    res.json(latestMessages);
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API server is running on https://kira1612.github.io/api_instrument/:${PORT}`);
});
