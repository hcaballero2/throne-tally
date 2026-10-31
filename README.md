# Throne Tally

Two-player bathroom-trip scoreboard. Log a pee or poo in two taps; most trips by midnight wins the day.
Installs on an iPhone as a PWA.

- Dev: `npm install && npm run dev`
- Build: `npm run build` (output in `dist/`, served at `/throne-tally/`)
- Test: `npm run build && npm run preview`, then `npm run smoke` (headless Chrome, practice mode)
- Deploy: push to `main`; GitHub Actions publishes to GitHub Pages.
- Choices: `DECISIONS.md`

## Firebase setup (one time)

1. Create a project at console.firebase.google.com (no Analytics needed).
2. Build → Authentication → Get started → enable **Anonymous**.
3. Build → Firestore Database → Create database (production mode, any region).
4. Firestore → Rules: paste `firestore.rules`, Publish.
5. Project settings → Your apps → Add web app. Copy the four values into `.env.production` (see `.env.example`).
6. Authentication → Settings → Authorized domains: add `<your-github-user>.github.io`.

Without `.env.production` the app runs in **practice mode**: everything stays in that phone's localStorage.
