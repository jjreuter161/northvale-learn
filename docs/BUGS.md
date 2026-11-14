# Bugs: what happened, the cause, the fix, the test

Every bug gets four lines here, and a test that fails if it ever comes back. Newest first.

## How to report a bug (send this to anyone testing)

> For each bug, can you tell me: 1) what you were doing, 2) what you expected, 3) what happened instead, and 4) whether you were on a phone or computer, and which browser? Screenshots help a lot.

## From a tester on a computer

**Waiting for the list.** The message that asked for these fixes had `[BUG LIST]` left blank, so there is nothing from your friend to reproduce yet. Send the list (the four answers for each bug) and each one goes below with its cause, fix and test. The three things your friend said in general (it feels childish, setup still looks like a phone on a computer, the app looks empty) are done in the same pass; see CHANGELOG.md.

## From my own hunt on a computer (laptop 1366px and large desktop 1920px, Chrome)

How: a test that clicks through every screen a new learner and a learner three weeks in can reach, at both sizes, and fails on any error in the console, failed request, anything off the side or cut off, a raw text key, `undefined`, `NaN` or an unfilled `{placeholder}` (`test/screens.test.mjs`, 54 screens). It passed. These are what looking at the screens by eye turned up, all fixed:

| What happened | Cause | Fix | Test |
|---|---|---|---|
| **In the released computer layout:** the panel beside Today could be cut off at the bottom on a short laptop screen (its lower cards unreachable). | It stays in place while you scroll, but was taller than the window. | It now has a maximum height and scrolls on its own. | `test/layout.test.mjs`: on a 560px-tall window the whole panel fits and scrolls |

Caught while building this pass (never released):

| What happened | Cause | Fix | Test |
|---|---|---|---|
| Resizing the window during setup started setup over (the picked answer was lost). | Setup was wrapped in a different parent on a computer than on a phone, so React threw the screen away when the size changed. | The same elements at every size; only the brand half comes and goes (`src/core/Split.jsx`). | `test/layout.test.mjs`: resizing laptop → phone → laptop keeps the picked answer in setup, the section picked in Settings, and an open lesson |
| The picture on Today lost the top of the mast once pictures were made smaller. | A phone-shaped picture, cropped to a shorter card. | Pictures are drawn at the card's real shape on a tablet or computer (`Scene` in `src/core/ui.jsx`). | No automated test (it's a picture): checked by eye in `docs/design/professional/after/`. |

## Not tested yet

- **Safari and Firefox.** Only Chrome could be driven here: no Firefox or WebKit is installed, and installing them is a download that needs your OK. Everything above was checked in Chrome. Please open the app once in Safari and once in Firefox on a computer and tell me what looks wrong (the same four answers per bug).
