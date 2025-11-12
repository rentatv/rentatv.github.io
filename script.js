const video = document.getElementById("myVideo");
const clock = document.getElementById("clock");
const startBtn = document.getElementById("startBtn");
const volumeSlider = document.getElementById("volumeSlider");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const exitFullscreenBtn = document.getElementById("exitFullscreenBtn");

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
  console.log(
    "Sekundy teraz:",
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  );
  setTimeout(updateClock, 1000);
}

// Odtwarzanie wg harmonogramu
function playSchedule() {
  const now = new Date();
  const secondsNow =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  let current = schedule.find(
    (item) =>
      secondsNow >= item.start && secondsNow < item.start + item.duration
  );

  if (!current) {
    if (!video.paused) {
      video.pause();
      video.src = "";
      currentFile = "";
      console.log("Czarny ekran – brak elementu w harmonogramie");
    }
    setTimeout(playSchedule, 1000);
    return;
  }

  if (current.file !== currentFile) {
    currentFile = current.file;
    video.src = "videos/" + currentFile;
    let offset = secondsNow - current.start;
    video.currentTime = offset > 0 ? offset : 0;
    video.play().catch((err) => console.error("Błąd odtwarzania:", err));
    console.log(
      `Odtwarzanie pliku: ${currentFile} | start: ${current.start} | duration: ${current.duration} | offset: ${offset}`
    );
  }

  const msToNext = (current.start + current.duration - secondsNow) * 1000;
  setTimeout(playSchedule, msToNext > 0 ? msToNext : 1000);
}

// Start TV
startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  await loadSchedule();
  updateClock();
  playSchedule();
});

// Głośność
volumeSlider.addEventListener(
  "input",
  () => (video.volume = volumeSlider.value)
);

// Fullscreen
fullscreenBtn.addEventListener("click", () => {
  if (video.parentElement.requestFullscreen)
    video.parentElement.requestFullscreen();
  else if (video.parentElement.webkitRequestFullscreen)
    video.parentElement.webkitRequestFullscreen();
});

// Exit Fullscreen – pokazuje się tylko w fullscreen
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    exitFullscreenBtn.style.display = "inline-block";
  } else {
    exitFullscreenBtn.style.display = "none";
  }
});

exitFullscreenBtn.addEventListener("click", () => {
  if (document.exitFullscreen) document.exitFullscreen();
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
});
