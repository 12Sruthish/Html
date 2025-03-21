const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // Serves frontend files

let players = {}; // Stores connected players
let currentQuestionIndex = 0;
let questionTimeout;

// Quiz Questions
const questions = [
    { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
    { question: "What is the capital of Japan?", options: ["Seoul", "Tokyo", "Beijing", "Bangkok"], answer: "Tokyo" },
    { question: "Who discovered gravity?", options: ["Newton", "Einstein", "Galileo", "Tesla"], answer: "Newton" }
];

// Handle new player connections
io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);
    
    socket.on("joinGame", (name) => {
        players[socket.id] = { name, score: 0 };
        console.log(`${name} joined the game.`);
        io.emit("updatePlayers", players);
    });

    socket.on("startQuiz", () => {
        currentQuestionIndex = 0;
        sendQuestion();
    });

    socket.on("submitAnswer", ({ answer }) => {
        const player = players[socket.id];
        if (player && answer === questions[currentQuestionIndex].answer) {
            player.score += 10;
        }
        io.emit("updatePlayers", players);
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("updatePlayers", players);
        console.log("A player disconnected:", socket.id);
    });
});

// Send questions to all players
function sendQuestion() {
    if (currentQuestionIndex >= questions.length) {
        io.emit("quizOver", players);
        return;
    }

    io.emit("newQuestion", {
        question: questions[currentQuestionIndex].question,
        options: questions[currentQuestionIndex].options
    });

    questionTimeout = setTimeout(() => {
        currentQuestionIndex++;
        sendQuestion();
    }, 10000);
}

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
