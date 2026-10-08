// Apps that are never closed in strict mode (system pieces, Task Manager as an emergency exit, and Infinity itself)
const KEEP = new Set([
  'infinity', 'electron', 'explorer', 'applicationframehost', 'shellexperiencehost', 'searchhost',
  'searchapp', 'startmenuexperiencehost', 'textinputhost', 'lockapp', 'logonui', 'dwm', 'winlogon',
  'csrss', 'taskmgr', 'systemsettings', 'sihost', 'ctfmon', 'fontdrvhost', 'runtimebroker',
  'securityhealthsystray', 'widgets', 'msedgewebview2', 'consent', 'credentialuibroker'
]);

// Takes PowerShell output lines like "1234|chrome" and returns the process ids to close.
function pickVictims(output, selfPid, only) {
  const out = [];
  String(output).split(/\r?\n/).forEach(line => {
    const parts = line.trim().split('|');
    if (parts.length < 2) return;
    const pid = parseInt(parts[0], 10);
    const name = parts.slice(1).join('|').toLowerCase();
    if (!pid || pid === selfPid || KEEP.has(name)) return;
    if (only && only.length && !only.includes(name)) return;
    out.push(pid);
  });
  return out;
}
module.exports = { pickVictims, KEEP };
