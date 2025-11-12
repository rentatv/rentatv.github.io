const player = document.getElementById("myVideo");
const breakImage = document.getElementById("breakImage");
const clock = document.getElementById("clock");
const startBtn = document.getElementById("startBtn");
const playerContainer = document.getElementById("playerContainer");

const fullscreenBtn = document.getElementById("fullscreenBtn");
const exitFullscreenBtn = document.getElementById("exitFullscreenBtn");
const volumeSlider = document.getElementById("volumeSlider");

let schedule = [];
let currentFile = "";

// Wczytaj harmonogram
async function loadSchedule() {
  try {
    const res = await fetch("schedule.json");
    schedule = await res.json();
    schedule.sort((a, b) => a.start - b.start);
    console.log("Harmonogram wczytany:", schedule);
  } catch (e) {
    console.error("Błąd wczytywania schedule.json:", e);
  }
}

// Aktualizacja zegara co sekundę
function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString("pl-PL", { hour12: false });
  setTimeout(updateClock, 1000);
}

// Sprawdzenie, czy jest przerwa
function isBreakHour(now) {
  const hour = now.getHours();
  return hour >= 22 || hour < 6; // przerwa 22:00 - 06:00
}

// Odtwarzanie pseudo-live wg harmonogramu
function playCurrent() {
  const now = new Date();
  const secondsNow =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  if (isBreakHour(now)) {
    player.style.display = "none";
    breakImage.style.display = "block";
    player.pause();
  } else {
    breakImage.style.display = "none";
    player.style.display = "block";

    const currentItem = schedule.find(
      (item) =>
        secondsNow >= item.start && secondsNow < item.start + item.duration
    );

    if (currentItem && currentFile !== currentItem.file) {
      currentFile = currentItem.file;
      player.src = "videos/" + currentFile;
      player.currentTime = secondsNow - currentItem.start; // ustawienie od właściwej sekundy
      player.play().catch((err) => console.error(err));
      console.log(
        "Odtwarzanie pliku od właściwej sekundy:",
        currentFile,
        "Sekunda:",
        player.currentTime
      );
    }
  }

  setTimeout(playCurrent, 500); // sprawdzaj co 0.5s
}

// Start transmisji po kliknięciu
startBtn.addEventListener("click", async () => {
  console.log("Start watching live");
  startBtn.style.display = "none";
  await loadSchedule();
  updateClock();

  // Ustawienie aktualnego pliku wg czasu
  const now = new Date();
  const secondsNow =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  if (!isBreakHour(now)) {
    const currentItem = schedule.find(
      (item) =>
        secondsNow >= item.start && secondsNow < item.start + item.duration
    );

    if (currentItem) {
      currentFile = currentItem.file;
      player.src = "videos/" + currentFile;
      player.currentTime = secondsNow - currentItem.start;
      player.play().catch((err) => console.error(err));
      console.log(
        "Odtwarzanie pliku od właściwej sekundy:",
        currentFile,
        "Sekunda:",
        player.currentTime
      );
    }
  } else {
    player.style.display = "none";
    breakImage.style.display = "block";
  }

  playCurrent(); // kontynuacja sprawdzania harmonogramu
});

// Sterowanie fullscreen całego kontenera
fullscreenBtn.addEventListener("click", () => {
  if (playerContainer.requestFullscreen) {
    playerContainer.requestFullscreen();
    exitFullscreenBtn.style.display = "block"; // pokaż przycisk w fullscreenie
  }
});

exitFullscreenBtn.addEventListener("click", () => {
  if (document.exitFullscreen) document.exitFullscreen();
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    exitFullscreenBtn.style.display = "none"; // schowaj przycisk po wyjściu
  }
});

// Sterowanie głośnością
volumeSlider.addEventListener("input", () => {
  player.volume = volumeSlider.value;
});

// Debug: logowanie sekundy co sekundę
setInterval(() => {
  const now = new Date();
  console.log(
    "Sekunda od północy:",
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  );
}, 1000);
