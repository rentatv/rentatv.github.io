const player = document.getElementById("myVideo");
const breakImage = document.getElementById("breakImage");
const clock = document.getElementById("clock");
const startBtn = document.getElementById("startBtn");

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

// Odtwarzanie pseudo-live wg harmonogramu
function playCurrent() {
  const now = new Date();
  const secondsNow =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // przerwa 20:00 - 06:00
  if (now.getHours() >= 20 || now.getHours() < 6) {
    player.style.display = "none";
    breakImage.style.display = "block";
  } else {
    breakImage.style.display = "none";
    player.style.display = "block";

    // wybierz plik, który aktualnie powinien grać
    const currentItem = schedule.find(
      (item) =>
        secondsNow >= item.start && secondsNow < item.start + item.duration
    );

    if (currentItem && currentFile !== currentItem.file) {
      currentFile = currentItem.file;
      player.src = "videos/" + currentFile;
      player.play().catch((err) => console.error(err));
      console.log(
        "Odtwarzanie pliku:",
        currentFile,
        "Sekundy od północy:",
        secondsNow
      );
    }
  }

  setTimeout(playCurrent, 500); // sprawdzaj co 0.5s
}

// Start systemu po kliknięciu przycisku
startBtn.addEventListener("click", async () => {
  console.log("Start watching live");
  startBtn.style.display = "none";
  await loadSchedule();
  updateClock();
  playCurrent();
});

// Sterowanie fullscreen
const fullscreenBtn = document.getElementById("fullscreenBtn");
const exitFullscreenBtn = document.getElementById("exitFullscreenBtn");

fullscreenBtn.addEventListener("click", () => {
  if (player.requestFullscreen) player.requestFullscreen();
});

exitFullscreenBtn.addEventListener("click", () => {
  if (document.exitFullscreen) document.exitFullscreen();
});

// Sterowanie głośnością
const volumeSlider = document.getElementById("volumeSlider");
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
