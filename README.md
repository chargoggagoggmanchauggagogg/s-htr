# Infinity for Windows

1. Make a new GitHub repository (Public) and upload every file in this folder except `build-exe.yml`.
2. In the repository choose Add file > Create new file, name it `.github/workflows/build-exe.yml`, paste the text from `build-exe.yml`, and commit.
3. Open the Actions tab, wait for the green tick, open the run and download `Infinity-exe`. Unzip it to get `Infinity.exe`.
4. Put `Infinity.exe` anywhere on your PC and double-click it. If Windows SmartScreen warns you, click More info, then Run anyway (the app is not code-signed).
5. Set up accounts and sync with ACCOUNT-SETUP.md (optional).

## Focus mode on PC
Press Focus, tick the tasks and/or subtasks you must finish, then Start focus.
- Infinity goes full screen on every monitor and stays on top. Alt+Tab, the Win key and clicking other windows only flash other apps; Infinity pulls itself back to the front.
- "Also close other apps" closes other apps that have a window, every few seconds, with no clicks from you. Type app names (for example `discord, steam`) to close only those; leave it empty to close everything. Unsaved work in closed apps can be lost. File Explorer, Task Manager and Windows system pieces are left alone.
- It unlocks when every picked item is done, or if you type "I give up" under Give up.
- It reopens by itself after a restart while locked. A lock older than 12 hours is released automatically.
- If you are signed in, focus mode started on your phone locks this PC too, and the reverse.
- Ctrl+Alt+Del and Task Manager cannot be blocked by any app, so you can always get out in an emergency.
