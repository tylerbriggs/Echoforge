const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  runClipper: (data) => ipcRenderer.invoke("run-clipper", data),
  onLog: (cb) => ipcRenderer.on("python-log", cb),
  onError: (cb) => ipcRenderer.on("python-error", cb),
  onFinished: (cb) => ipcRenderer.on("python-finished", cb),
});

