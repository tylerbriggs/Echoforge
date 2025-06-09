function processVideo() {
  const fileInput = document.getElementById("videoInput");
  const linkInput = document.getElementById("videoLink").value.trim();
  const keywords = document.getElementById("keywords").value;
  const length = document.getElementById("clipLength").value;
  const orientation = document.getElementById("orientation").value;
  const quality = document.getElementById("quality").value;
  const faceTrack = document.getElementById("faceTrack").checked;
  const addCaptions = document.getElementById("addCaptions").checked;

  let sourcePath = null;
  let isLink = false;

  if (linkInput.length > 0) {
    sourcePath = linkInput;
    isLink = true;
  } else if (fileInput.files.length > 0) {
    sourcePath = fileInput.files[0].path;
  } else {
    alert("Please upload a file or paste a link.");
    return;
  }

  document.getElementById("loadingBar").style.display = "block";

  window.electronAPI.sendToPython({
    sourcePath,
    keywords,
    length,
    isLink,
    orientation,
    quality,
    faceTrack,
    addCaptions
  });
}

window.electronAPI.onPythonError((message) => {
  if (message === 'DONE') {
    document.getElementById("loadingBar").style.display = "none";
    alert("✅ Done! Your clips are ready in the output folder.");
    return;
  }

  console.error("Python backend error:", message);
  document.getElementById("loadingBar").style.display = "none";
});




