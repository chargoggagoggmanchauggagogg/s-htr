const { app, BrowserWindow, ipcMain, screen, globalShortcut } = require('electron');
const { execFile } = require('child_process');
const path = require('path');
const { pickVictims } = require('./lib.js');

app.setAppUserModelId('com.infinity.focus');
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

let win = null, covers = [], locked = false, strict = false, onlyApps = [], keepTimer = null, killTimer = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1180, height: 800, minWidth: 760, minHeight: 560,
    backgroundColor: '#464646', title: 'Infinity',
    icon: path.join(__dirname, 'icon.ico'), autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.removeMenu();
  win.loadFile('index.html');
  win.on('close', e => { if (locked) e.preventDefault(); });
  win.webContents.on('before-input-event', (e, input) => {
    if (!locked) return;
    const k = input.key || '';
    if ((input.alt && k === 'F4') || k === 'F11' || k === 'F12' ||
        (input.control && ['w', 'q', 'r'].includes(k.toLowerCase())) ||
        (input.control && input.shift && k.toLowerCase() === 'i')) e.preventDefault();
  });
}

function destroyCovers() { covers.forEach(c => { try { if (!c.isDestroyed()) c.destroy(); } catch (_) {} }); covers = []; }
function makeCovers() {
  destroyCovers();
  const primary = screen.getPrimaryDisplay();
  screen.getAllDisplays().forEach(d => {
    if (d.id === primary.id) return;
    const c = new BrowserWindow({
      x: d.bounds.x, y: d.bounds.y, width: d.bounds.width, height: d.bounds.height,
      frame: false, fullscreen: true, alwaysOnTop: true, skipTaskbar: true, focusable: false,
      backgroundColor: '#464646', show: false
    });
    c.setAlwaysOnTop(true, 'screen-saver');
    c.loadFile('cover.html');
    c.once('ready-to-show', () => c.show());
    covers.push(c);
  });
}
function refreshCovers() { if (locked) makeCovers(); }

function keepOnTop() {
  if (!locked || !win || win.isDestroyed()) return;
  if (!win.isVisible()) win.show();
  if (win.isMinimized()) win.restore();
  win.setAlwaysOnTop(true, 'screen-saver');
  win.moveTop();
  if (!win.isFocused()) win.focus();
  covers.forEach(c => { if (!c.isDestroyed()) { c.setAlwaysOnTop(true, 'screen-saver'); c.moveTop(); } });
}

function closeOthers() {
  const ps = "Get-Process | Where-Object { $_.MainWindowHandle -ne 0 } | ForEach-Object { $_.Id.ToString() + '|' + $_.ProcessName }";
  execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], { windowsHide: true, timeout: 8000 }, (err, out) => {
    if (err || !locked) return;
    pickVictims(out, process.pid, onlyApps).forEach(pid => execFile('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { windowsHide: true }, () => {}));
  });
}

function setLock(on, opts) {
  if (!win || win.isDestroyed()) return;
  clearInterval(keepTimer); clearInterval(killTimer);
  globalShortcut.unregisterAll();
  locked = !!on; strict = !!(opts && opts.strict);
  onlyApps = String((opts && opts.apps) || '').split(',').map(x => x.trim().toLowerCase().replace(/\.exe$/, '')).filter(Boolean);
  if (locked) {
    win.setClosable(false); win.setMinimizable(false);
    if (win.isMaximized()) win.unmaximize();
    win.setBounds(screen.getPrimaryDisplay().bounds);
    win.setKiosk(true);
    win.setAlwaysOnTop(true, 'screen-saver');
    win.show(); win.focus();
    makeCovers();
    ['Alt+F4', 'CommandOrControl+W', 'CommandOrControl+Q', 'F11'].forEach(k => { try { globalShortcut.register(k, () => {}); } catch (_) {} });
    keepTimer = setInterval(keepOnTop, 400);
    if (strict) { closeOthers(); killTimer = setInterval(closeOthers, 2500); }
    app.setLoginItemSettings({ openAtLogin: true, path: process.env.PORTABLE_EXECUTABLE_FILE || process.execPath });
  } else {
    destroyCovers();
    win.setKiosk(false); win.setAlwaysOnTop(false);
    win.setClosable(true); win.setMinimizable(true);
    app.setLoginItemSettings({ openAtLogin: false, path: process.env.PORTABLE_EXECUTABLE_FILE || process.execPath });
  }
}

if (gotLock) {
  app.whenReady().then(() => {
    createWindow();
    ipcMain.handle('lock', (_e, on, opts) => { setLock(on, opts); return true; });
    ['display-added', 'display-removed', 'display-metrics-changed'].forEach(ev => screen.on(ev, refreshCovers));
  });
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });
  app.on('window-all-closed', () => app.quit());
  app.on('will-quit', () => globalShortcut.unregisterAll());
}
