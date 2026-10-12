# Animators Hive Hub: Project Proposal

Author: Edem Angel Edem Hogan (P0013366)
Centre: AfriHUB
Date: 12 October 2026
Status: draft for tutor review. Items marked [ED] need your decision before this goes in.

---

## 2.1 The computing artefact

The artefact is a web platform for animators. People upload their animations, share them, and talk with other animators, people in the industry, and fans of animation. The app is built with SvelteKit and runs on Cloudflare Workers. Records live in a D1 database and video files live in R2 storage.

Most animators post their work on YouTube, Instagram or Twitter. Those sites are for everyone. Anything you post has to compete with cat videos, cooking clips and news. A site that is only for animation changes that. Viewers who want animation know where to look, and animators have a reason to post there.

**Aim.** Give animators one place to share their work, find other people's work, and meet other animators and fans.

**Objectives.** Each objective has a test in Section 2.3.

- O1. A feed of uploaded animations. People can sort it by newest or by most upvoted. It shows 20 items at a time.
- O2. Sign in with Google. A signed-in user uploads a video with a title, a description and a thumbnail. The new animation shows up in the feed and has its own page.
- O3. A signed-in user makes playlists and adds their own animations to them.
- O4. A signed-in user can comment on an animation and upvote it. One upvote per user, per animation.
- O5. A signed-in user can start a community or join one. Each community page lists its members and its animations.
- O6. The site has automated tests. Every objective has at least one test, and the tests pass before each release.

## 2.2 Aims and objectives, scope and architecture

**In scope.** Everything in O1 to O5, the accounts those features need, and the tests in O6.

**Out of scope.**

- A native phone app. The site is responsive, so it works on phones through the browser. [ED: confirm]
- Messages between users, and messages to communities. Dropped. [ED: confirmed]
- Payments or paid features.
- Admin tools for moderation, reports, or deleting accounts.
- Similarity search. An early version used Cloudflare Vectorize for this. It was removed on 7 October 2026 when storage moved to D1 and R2. It is not part of this project.

**Architecture.**

- Front end and server: SvelteKit in TypeScript, managed with pnpm.
- Hosting: Cloudflare Workers. Database: D1 `ahh`. Media: R2 `ahh`.
- Sign-in: Google. The server keeps the session in a signed cookie.
- Tests: Playwright for end-to-end tests, plus tests for the server code.
- Code checks: Prettier and ESLint.

**Development method.** [ED: confirm] I used an iterative method. Each step adds one piece, tests it, and checks it before the next step starts. I picked this because I work alone, and a finished piece still works if the rest of the project has to be cut.

## 2.3 Work breakdown and Gantt chart

The project runs from the SvelteKit conversion on 6 October 2026 to today, 12 October 2026. The dates come from the commit history in the repo. [ED: check the end date against your submission deadline.]

| ID | Task | Depends on | Start | End | Output |
|----|------|-----------|-------|-----|--------|
| T1 | Convert the React app to SvelteKit | none | 6 Oct 2026 | 6 Oct 2026 | SvelteKit app runs |
| T2 | Store accounts, animations, comments and lists in D1 | T1 | 7 Oct 2026 | 7 Oct 2026 | Data in D1 |
| T3 | Store uploads in R2 and serve them | T2 | 7 Oct 2026 | 7 Oct 2026 | Video uploads work |
| T4 | Remove Vectorize, Gemini and dead code | T2 | 7 Oct 2026 | 7 Oct 2026 | Smaller codebase |
| T5 | Build O2 to O5 (feed, pages, lists, communities, sign-in) | T3 | 7 Oct 2026 | 7 Oct 2026 | Features work |
| T6 | Security fixes: sessions, rate limits, input checks | T5 | 7 Oct 2026 | 7 Oct 2026 | Checks in place |
| T7 | Tests: API smoke script and end-to-end tests (O6) | T5, T6 | 7 Oct 2026 | 9 Oct 2026 | Tests written and run |
| T8 | Deploy to Cloudflare Workers | T7 | 9 Oct 2026 | 9 Oct 2026 | Live site |
| T9 | Visual update to the new look and search | T8 | 9 Oct 2026 | 9 Oct 2026 | New look live |
| T10 | Project report, demonstration and presentation | T9 | 12 Oct 2026 | [ED] | Report and talk |

**Milestones.**

- M1: SvelteKit app runs, 6 Oct 2026.
- M2: All features built and data moved to D1 and R2, 7 Oct 2026.
- M3: Tests pass and the site is live, 9 Oct 2026.
- M4: Report and demonstration done, [ED] date.

**Checks.** At the end of each step I run the app and try the feature by hand. The tests for that feature must pass before the next step starts. If a step runs more than a week late, I tell the tutor and send a new plan.
