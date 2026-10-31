# Decisions

- **Firebase (Firestore + email/password auth)** for shared state: two phones must see the same scores live.
  Offline writes queue in Firestore's persistent cache and sync later.
- **Two hand-made accounts, no sign-up.** The site itself is public (GitHub Pages on a free account can't be
  private), so the data is what's protected: rules only admit uids listed in `members/{uid}`, which only the
  console can write. Each account is linked to seat `p1`/`p2` there, so a phone never has to pick a player.
  Each player can only edit their own character and add/remove their own trips.
- **Email/password, not Google sign-in**: redirect/popup sign-in is unreliable in iPhone home-screen apps.
  Firebase keeps the session in IndexedDB; the seat is also cached in localStorage for offline launches.
- Replaced anonymous auth (first version). Leftover anonymous sessions are signed out on launch.
- **Winner rule:** most trips (pee + poo) in the local calendar day; a tie gives no crown.
  Days are keyed `YYYY-MM-DD` in the logger's local time zone.
- **History:** last 60 days are loaded and shown.
- **Shared words list** (`meta/adjectives`): either player can add or remove a word, and it changes for both.
  Removing a word never edits old logs.
- **Characters:** layered SVG (base + eyes + hat/hair) drawn in code, so they are tiny and scale cleanly.
- **Practice mode:** without Firebase config the app uses a localStorage store with the same interface,
  so it can be tried (and smoke-tested) before Firebase exists.
