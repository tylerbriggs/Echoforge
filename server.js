const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, "input.mp4")
});
const upload = multer({ storage });

app.post("/clip", upload.single("file"), (req, res) => {
  const args = [
    req.body.url || "uploads/input.mp4",
    req.body.keywords || "bro,dude,wtf",
    req.body.length || "15",
    req.body.orientation || "Portrait",
    req.body.quality || "Medium",
    req.body.faceTrack || "false",
    req.body.captions || "false",
    req.body.uploadTikTok || "false",
    req.body.uploadYouTube || "false"
  ];

  const cmd = `python backend/clipper.py ${args.join(" ")}`;
  console.log("🚀 Running:", cmd);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("🔥 Error:", stderr);
      return res.status(500).json({ success: false, message: stderr });
    }

    return res.status(200).json({ success: true, videoPath: "/vault/clip_1.mp4" });
  });
});

app.listen(port, () => console.log(`🟢 Server running at http://localhost:${port}`));
