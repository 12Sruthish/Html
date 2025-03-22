const socket = io();
let playerName = prompt("Enter your name:");
socket.emit("joinGame", playerName);

document.getElementById("start-btn").addEventListener("click", () => {
    socket.emit("startQuiz");
});

// Update player list
socket.on("updatePlayers", (players) => {
    document.getElementById("player-list").textContent = `Players: ${Object.keys(players).length}`;
});

// Display questions
socket.on("newQuestion", (data) => {
    document.getElementById("question").textContent = data.question;
    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";

    data.options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option;
        button.classList.add("option");
        button.onclick = () => {
            socket.emit("submitAnswer", { answer: option });
        };
        optionsContainer.appendChild(button);
    });

    startTimer();
});

// Quiz Over
socket.on("quizOver", (players) => {
    document.getElementById("question").textContent = "Quiz Over!";
    document.getElementById("options-container").innerHTML = "";
    let scores = Object.entries(players)
        .map(([id, player]) => `${player.name}: ${player.score} pts`)
        .join("<br>");
    document.getElementById("player-list").innerHTML = scores;
});

// Timer function
function startTimer() {
    let timeLeft = 10;
    document.getElementById("time").textContent = timeLeft;
    document.getElementById("timer-bar").style.width = "100%";

    let timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("time").textContent = timeLeft;
        document.getElementById("timer-bar").style.width = `${(timeLeft / 10) * 100}%`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
}
