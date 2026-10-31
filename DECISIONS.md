# Decisions

- **Firebase (Firestore + anonymous auth)** for shared state: two phones must see the same scores live.
  Offline writes queue in Firestore's persistent cache and sync later.
- **No accounts.** Each phone claims seat `p1` or `p2` (stored in localStorage). Anyone with the URL could
  sign in anonymously and write; rules only check shapes. Fine for two friends, not for anything private.
- **Winner rule:** most trips (pee + poo) in the local calendar day; a tie gives no crown.
  Days are keyed `YYYY-MM-DD` in the logger's local time zone.
- **History:** last 60 days are loaded and shown.
- **Shared words list** (`meta/adjectives`): either player can add or remove a word, and it changes for both.
  Removing a word never edits old logs.
- **Characters:** layered SVG (base + eyes + hat/hair) drawn in code, so they are tiny and scale cleanly.
- **Practice mode:** without Firebase config the app uses a localStorage store with the same interface,
  so it can be tried (and smoke-tested) before Firebase exists.
