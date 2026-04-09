let kamus = {};
let words = [];
let answer = "";
let attempts = 0;
const maxAttempts = 6;

fetch("kamus.json")
  .then((response) => response.json())
  .then((data) => {
    kamus = data;
    words = Object.keys(kamus);
  })
  .catch((error) => console.error("Gagal memuat kamus.json:", error));

document.addEventListener("DOMContentLoaded", () => {
  const gameBoard = document.getElementById("gameBoard");
  const message = document.getElementById("message");
  const lengthSelector = document.getElementById("wordLength");
  const startBtn = document.getElementById("startBtn");
  const keyboard = document.getElementById("keyboard");
  const submitBtn = document.getElementById("submitBtn");

  let currentAttempt = "";
  let selectedLength = 5;

  startBtn.addEventListener("click", () => {
    selectedLength = parseInt(lengthSelector.value);
    let filteredWords = words.filter((word) => word.length === selectedLength);

    if (filteredWords.length === 0) {
      message.textContent = "Tidak ada kata dengan panjang yang dipilih!";
      return;
    }

    answer = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    attempts = 0;
    gameBoard.innerHTML = "";
    keyboard.innerHTML = "";
    message.textContent = "Game dimulai! Tebak kata.";

    for (let i = 0; i < maxAttempts; i++) {
      let row = document.createElement("div");
      row.classList.add("grid");
      row.dataset.index = i;
      for (let j = 0; j < selectedLength; j++) {
        let box = document.createElement("div");
        box.classList.add("box");
        row.appendChild(box);
      }
      gameBoard.appendChild(row);
    }

    createKeyboard();
    currentAttempt = "";
  });

  function createKeyboard() {
    const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    rows.forEach((row) => {
      let rowDiv = document.createElement("div");
      rowDiv.classList.add("key-row");
      row.split("").forEach((letter) => {
        let key = document.createElement("button");
        key.textContent = letter;
        key.classList.add("key");
        key.dataset.letter = letter;
        key.addEventListener("click", () => handleInput(letter));
        rowDiv.appendChild(key);
      });
      keyboard.appendChild(rowDiv);
    });

    let submitKey = document.createElement("button");
    submitKey.textContent = "Tebak";
    submitKey.classList.add("key", "submit-key");
    submitKey.addEventListener("click", submitAttempt);
    keyboard.appendChild(submitKey);
  }

  function handleInput(letter) {
    if (currentAttempt.length < selectedLength) {
      currentAttempt += letter;
      updateBoard();
    }
  }

  function updateBoard() {
    let row = document.querySelector(`.grid[data-index='${attempts}']`);
    let boxes = row.querySelectorAll(".box");
    for (let i = 0; i < selectedLength; i++) {
      boxes[i].textContent = currentAttempt[i] || "";
    }
  }

  document.addEventListener("keydown", (e) => {
    if (/^[a-zA-Z]$/.test(e.key)) handleInput(e.key.toLowerCase());
    if (e.key === "Backspace") handleBackspace();
    if (e.key === "Enter") submitAttempt();
  });

  function handleBackspace() {
    currentAttempt = currentAttempt.slice(0, -1);
    updateBoard();
  }

  function submitAttempt() {
    if (currentAttempt.length !== selectedLength) return;
    if (!words.includes(currentAttempt)) {
      message.textContent = "Kata tidak ditemukan dalam kamus!";
      return;
    }

    let row = document.querySelector(`.grid[data-index='${attempts}']`);
    let boxes = row.querySelectorAll(".box");
    let answerArray = answer.split("");
    let guessArray = currentAttempt.split("");
    let marked = Array(selectedLength).fill(false);

    for (let i = 0; i < selectedLength; i++) {
      if (guessArray[i] === answerArray[i]) {
        boxes[i].classList.add("green");
        markKey(guessArray[i], "green");
        marked[i] = true;
      }
    }

    for (let i = 0; i < selectedLength; i++) {
      if (boxes[i].classList.contains("green")) continue;
      let index = answerArray.findIndex((char, idx) => char === guessArray[i] && !marked[idx]);
      if (index !== -1) {
        boxes[i].classList.add("yellow");
        markKey(guessArray[i], "yellow");
        marked[index] = true;
      } else {
        boxes[i].classList.add("gray");
        markKey(guessArray[i], "gray");
      }
    }

    if (currentAttempt === answer) {
      message.textContent = `Selamat! Kata yang benar adalah "${answer}". Artinya: ${kamus[answer]}`;
    } else if (attempts >= maxAttempts - 1) {
      message.textContent = `Game over! Kata yang benar adalah "${answer}". Artinya: ${kamus[answer]}`;
    }

    attempts++;
    currentAttempt = "";
  }

  function markKey(letter, color) {
    let key = document.querySelector(`.key[data-letter='${letter}']`);
    if (key && !key.classList.contains("green")) {
      key.classList.add(color);
    }
  }
});
