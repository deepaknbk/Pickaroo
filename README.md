# Pickaroo

Simple static web page that lets you add names to a pool and randomly pick one (like a bingo spinner).

Features
- Add names (supports 5–10 names or more)
- Allow duplicates (configurable)
- Persist names in localStorage (configurable)
- Optional remove-after-pick
- Visual animation when picking

Files
- `index.html` — main page for Pickaroo
- `styles.css` — minimal styling
- `script.js` — logic for managing the pool and picking

How to run
1. Open `index.html` in your browser (double-click or right-click -> Open with).

Optional (PowerShell) — open in default browser from the folder containing the files:

```powershell
# from PowerShell in this folder:
start .\index.html
```

Usage notes
- Type a name then press Add or Enter.
- Press "Pick a name" to run the animation and reveal a winner.
- Use Options to persist the list, allow duplicates, or remove the picked name from the pool.

Group add
- You can add 3–10 names at once using the group box on the page. Paste or type names separated by commas or newlines and click "Add group (3–10)". If duplicates are disallowed, the group will be validated and you'll be alerted if fewer than 3 new names remain after removing duplicates.

Next steps / enhancements
- Add sounds and confetti on winner
- Add themes or a fullscreen 'wheel' animation
- Export/import CSV of names

If you want, I can add one of these enhancements next.
