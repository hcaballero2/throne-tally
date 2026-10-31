# Throne Tally

Two-player bathroom-trip scoreboard. Log a pee or poo in two taps; most trips by midnight wins the day.
Installs on an iPhone as a PWA.

- Dev: `npm install && npm run dev`
- Build: `npm run build` (output in `dist/`, served at `/throne-tally/`)
- Test: `npx vite build --mode practice && npm run preview`, then `npm run smoke` (headless Chrome, practice mode)
- Deploy: push to `main`; GitHub Actions publishes to GitHub Pages.
- Choices: `DECISIONS.md`

## Firebase setup (one time)

1. Create a project at console.firebase.google.com (no Analytics needed).
2. Authentication → Sign-in method → enable **Email/Password**.
3. Authentication → Users → **Add user** once per player (email + password). Copy each **User UID**.
4. Firestore Database → Create database (production mode, any region).
5. Firestore → Data → start collection **`members`**. One document per player:
   Document ID = that player's User UID, one field `slot` (string) = `p1` or `p2`.
6. Firestore → Rules: paste `firestore.rules`, Publish.
7. Project settings → Your apps → Add web app. Copy the four values into `.env.production` (see `.env.example`).

Only accounts listed in `members` can read or write anything. There is no sign-up screen.

Without `.env.production` (or with `vite build --mode practice`) the app runs in **practice mode**:
no login, everything stays in that phone's localStorage.
