ZEPHYR MOBILE CONTAINMENT + LOWER PLAY BUTTON

Upload these files to the repository root:
- index.html
- mobile-fixes.css
- mobile-actions.js
- ios-audio-unlock.js

Fixes:
- Prevents the page from horizontally drifting/panning off the iPhone viewport.
- Contains long birthday/interval text and wide analysis tables within their panels.
- Adds a hold-to-play button directly beneath Save and Copy Summary.
- Preserves the iPhone speaker audio-route bridge.

After Vercel deploys, close the Safari tab and reopen zephyr.guru so iOS does not reuse the old CSS.
