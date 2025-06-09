const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.loadFile(path.join(__dirname, 'public', 'index.html'));
}

// Electron lifecycle
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 🧠 Helper: Generate Python args array
function buildPythonArgs(data) {
  const baseArgs = [
    data.sourcePath,
    data.keywords,
    data.length,
    data.orientation,
    data.quality,
    data.faceTrack.toString(),
    data.addCaptions.toString(),
    data.upload_to_tiktok.toString(),       // ✅ add this
    data.upload_to_youtube.toString()       // ✅ and this
  ];

  return data.isLink ? ['--link', ...baseArgs] : baseArgs;
}


// 🎯 Handle video processing requests from frontend
ipcMain.handle('run-clipper', async (event, data) => {
  console.log("📥 Received from frontend:", data);
  const args = buildPythonArgs(data);
  const pythonScript = path.join(__dirname, 'backend', 'clipper.py');

  return new Promise((resolve, reject) => {
    const py = spawn('py', ['-3.11', pythonScript, ...args]);
    let log = '';
    let error = '';

    py.stdout.on('data', (output) => {
      const msg = output.toString();
      log += msg;
      event.sender.send('python-log', msg);
    });

    py.stderr.on('data', (err) => {
      const msg = err.toString();
      error += msg;
      event.sender.send('python-error', msg);
    });

    py.on('close', (code) => {
      event.sender.send('python-finished', { code });
      if (code === 0) resolve(log);
      else reject(new Error(error || `Exited with code ${code}`));
    });
  });
});






