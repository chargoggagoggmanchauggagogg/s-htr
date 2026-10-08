const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('infinityDesktop', {
  isDesktop: true,
  lock: (on, opts) => ipcRenderer.invoke('lock', !!on, opts || {})
});
