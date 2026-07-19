ZEHPYR IOS + MOBILE FIX

Upload these three files to the repository root:
- index.html
- mobile-fixes.css
- ios-audio-unlock.js

What this fixes:
1. Forces the Observatory intro into a true single-column mobile composition on touch devices.
2. Prevents horizontal overflow and oversized desktop grid behavior in iPhone Safari.
3. Starts a nearly silent looping HTML audio element during the first touch. This opens iOS's media-audio route so the Web Audio bell engine can use the phone speaker even when iOS otherwise routes/mutes Web Audio differently.

After deployment:
- Hard refresh Safari.
- Turn media volume up.
- Test once with the iPhone silent switch off, then on.
