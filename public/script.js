// ✅ EchoForge - FULL script.js with Electron preload integration + debug logs + dynamic clipper

const HOT_KEYWORDS = [
  "bro", "dude", "no way", "that’s crazy", "what", "wait", "yo", "ay", "nah",
  "hell no", "wtf", "wt*", "holy", "damn", "bruh", "sheesh", "oh my god",
  "omg", "crazy", "insane", "insanity", "unreal", "wild", "nuts", "exploded",
  "screamed", "yelled", "jumped", "killed", "destroyed", "clutched",
  "that moment", "big play", "what just happened", "wtf just happened"
];

const MARKER_CONTAINER = document.getElementById("timeline-markers");
const VIDEO = document.getElementById("clip");
const LEGEND = document.getElementById("marker-legend");
const CLIP_OUTPUT = document.getElementById("clip-output");
const AUTO_BUTTON = document.getElementById("auto-clip");
const EXPORT_BUTTON = document.getElementById("export-json");
const WAVEFORM = document.getElementById("waveform");

let CLIP_MOMENTS = [];

LEGEND.innerHTML = `
  <div style="display: flex; gap: 1rem; font-size: 0.9rem; margin-top: 0.5rem;">
    <div><span style="display:inline-block;width:12px;height:12px;background:#ff4500;border-radius:2px;margin-right:4px;"></span>Keyword</div>
    <div><span style="display:inline-block;width:12px;height:12px;background:#00ffcc;border-radius:2px;margin-right:4px;"></span>Volume</div>
    <div><span style="display:inline-block;width:12px;height:12px;background:#ff00ff;border-radius:2px;margin-right:4px;"></span>🔥 Both</div>
  </div>
`;

VIDEO.addEventListener("loadedmetadata", () => {
  fetch("/transcript")
    .then(res => res.json())
    .then(transcript => {
      const duration = VIDEO.duration;
      const keywordTimestamps = new Set();

      transcript.forEach(({ word, start }) => {
        if (HOT_KEYWORDS.some(hot => word.toLowerCase().includes(hot))) {
          const rounded = Math.floor(start);
          keywordTimestamps.add(rounded);

          const marker = createMarker(start, duration, "#ff4500", `Keyword: ${word}`);
          MARKER_CONTAINER.appendChild(marker);
        }
      });

      volumeDetection(keywordTimestamps);
    });
});

function volumeDetection(keywordTimestamps) {
  const ctx = new AudioContext();
  const src = ctx.createMediaElementSource(VIDEO);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  src.connect(analyser);
  analyser.connect(ctx.destination);

  const duration = VIDEO.duration;
  const interval = 200;
  const seenTimestamps = new Set();
  const canvas = WAVEFORM;
  const ctx2d = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = 60;

  const loop = setInterval(() => {
    if (VIDEO.paused || VIDEO.ended) return clearInterval(loop);

    analyser.getByteFrequencyData(dataArray);
    const avgVolume = dataArray.reduce((a, b) => a + b) / bufferLength;
    const currentTime = VIDEO.currentTime;
    const rounded = Math.floor(currentTime);

    drawWaveform(dataArray);

    if (avgVolume > 160 && !seenTimestamps.has(rounded)) {
      seenTimestamps.add(rounded);

      let color = "#00ffcc";
      let reason = "Volume Spike";
      if (keywordTimestamps.has(rounded)) {
        color = "#ff00ff";
        reason = "🔥 Keyword + Volume";
      }

      const marker = createMarker(currentTime, duration, color, reason);
      MARKER_CONTAINER.appendChild(marker);

      CLIP_MOMENTS.push({
        start: Math.max(0, rounded - 7),
        end: Math.min(duration, rounded + 7),
        reason,
        score: avgVolume
      });
    }
  }, interval);

  function drawWaveform(data) {
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    ctx2d.fillStyle = "#ff4500";
    const barWidth = canvas.width / data.length;
    data.forEach((v, i) => {
      const barHeight = v / 255 * canvas.height;
      ctx2d.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
    });
  }
}

function createMarker(time, duration, color, label) {
  const marker = document.createElement("div");
  marker.className = "marker";
  marker.style.left = `${(time / duration) * 100}%`;
  marker.style.background = color;
  marker.title = label;
  marker.style.animation = "pulse 1.5s infinite alternate";

  marker.addEventListener("click", () => VIDEO.currentTime = time);
  marker.addEventListener("mouseenter", () => showPreview(time));
  marker.addEventListener("mouseleave", hidePreview);
  return marker;
}

if (AUTO_BUTTON) {
  AUTO_BUTTON.addEventListener("click", () => {
    const sorted = [...CLIP_MOMENTS].sort((a, b) => b.score - a.score);
    CLIP_OUTPUT.innerHTML = "<h3>Top Auto-Clips</h3>";
    sorted.forEach(({ start, end, reason, score }, i) => {
      CLIP_OUTPUT.innerHTML += `
        <div style='margin-bottom:1rem;'>
          <strong>Clip #${i + 1}</strong> - ${reason} [Score: ${Math.floor(score)}]<br>
          <code>${start.toFixed(1)}s → ${end.toFixed(1)}s</code><br>
          <code>clip_${i + 1}_${reason.replace(/\W+/g, '_').toLowerCase()}.mp4</code>
        </div>
      `;
    });
  });
}


EXPORT_BUTTON.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(CLIP_MOMENTS, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "clip_moments.json";
  a.click();
  URL.revokeObjectURL(url);
});

const previewBox = document.createElement("div");
previewBox.style.position = "absolute";
previewBox.style.top = "-120px";
previewBox.style.width = "160px";
previewBox.style.height = "90px";
previewBox.style.background = "black";
previewBox.style.border = "2px solid white";
previewBox.style.display = "none";
previewBox.style.justifyContent = "center";
previewBox.style.alignItems = "center";
previewBox.style.color = "white";
previewBox.style.fontSize = "0.9rem";
previewBox.style.zIndex = "999";
previewBox.innerText = "Preview";
MARKER_CONTAINER.appendChild(previewBox);

function showPreview(time) {
  previewBox.style.left = `${(time / VIDEO.duration) * 100}%`;
  previewBox.style.display = "flex";
  previewBox.innerText = `Preview: ${Math.floor(time)}s`;
}

function hidePreview() {
  previewBox.style.display = "none";
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes pulse {
  from { transform: scale(1); opacity: 0.7; }
  to { transform: scale(1.3); opacity: 1; }
}`;
document.head.appendChild(style);

// ✅ Upload / Link Logic via Preload (Electron-safe)
document.querySelector(".clip-button").addEventListener("click", async () => {
  console.log("✅ CLIP IT button clicked");
  console.log("window.api is:", window.api);

  const fileInput = document.querySelector('input[type="file"]');
  const linkInput = document.querySelector('input[type="text"]');
  const videoURL = linkInput.value.trim();
  const file = fileInput.files[0];

  const data = {
    sourcePath: videoURL || (file ? file.path : null),
    keywords: "bro,dude,crazy,wtf",
    length: 15,
    orientation: "vertical",
    quality: "1080p",
    faceTrack: true,
    addCaptions: true,
    isLink: !!videoURL,
    upload_to_tiktok: document.getElementById("uploadTikTok")?.checked || false,
    upload_to_youtube: document.getElementById("uploadYouTube")?.checked || false
  };

  if (!data.sourcePath) {
    return alert("Upload a file or paste a link.");
  }

  console.log("🎬 Sending to backend:", data);
  window.api.runClipper(data);
});


window.api.onLog((_, msg) => console.log("[PYTHON]", msg));
window.api.onError((_, err) => console.error("[PYTHON ERROR]", err));
window.api.onFinished((_, data) => console.log("[PROCESS DONE]", data));








