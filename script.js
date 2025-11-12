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

// Pobierz następny element harmonogramu w kolejności
function getNextItem() {
  if (!currentFile) return schedule[0];
  const idx = schedule.findIndex((s) => s.file === currentFile);
  return schedule[(idx + 1) % schedule.length];
}

// Odtwarzanie pseudo-live wg harmonogramu z przerwą
function playCurrent() {
  const now = new Date();
  const hours = now.getHours();

  // przerwa 20:00 - 06:00
  if (hours >= 20 || hours < 6) {
    player.style.display = "none";
    breakImage.style.display = "block";
    setTimeout(playCurrent, 1000); // sprawdzaj co sekundę, kiedy wznowić
    return;
  }

  breakImage.style.display = "none";
  player.style.display = "block";

  const next = getNextItem();
  if (!next) return;

  currentFile = next.file;
  player.src = "videos/" + currentFile;
  player.play().catch((err) => console.error("Błąd odtwarzania wideo:", err));
  console.log(
    "Odtwarzanie pliku:",
    currentFile,
    "Sekundy od północy:",
    next.start
  );

  let duration = (next.duration || 10) * 1000;
  setTimeout(playCurrent, duration);
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
