# Imperial Properties website

Working files for [www.imperial-properties.com](https://www.imperial-properties.com), which runs on the RealtyWare agency website engine. The live website is the source of truth. These files are copies of its articles, plus the scripts and checks used to change them.

## Expose pages: photo layout (November 2026)

Property (expose) pages show the photos directly under the main photo instead of below the description:

| Area | Wide screens (576 px and up) | Portrait phones |
|---|---|---|
| Main photo | Full width, engine height (45% of the width, 400 px to 90% of the screen) | Full width, 3:2 |
| Browsing | Arrows on the photo, counter "3 / 34" | Swipe the photo, counter top right |
| Action icons (Photos, Location, Enquire, Share, PDF, QR Code, Selection) | See-through panel floating on the left of the photo; icons only on photos under about 600 px tall | Slim row under the photo |
| Photo strip | All photos in one swipeable row with arrows; the photo shown above is highlighted | Same, no arrows |
| Full-screen viewer | Every photo fills the screen | Same |
| Ask Aimée bar | Fades out while over the photos or while the viewer is open; never while a chat is open | Same |

It lives in two articles:

| Article | Type | Id | File |
|---|---|---|---|
| CSS (the website style sheet) | 23 StyleSheet | `8a7fc6482b0c63d616e03a22d8a81af5` | `articles/styleSheet.css`; the photo layout is the block at the end that starts `/* Expose pages: photo strip`, also kept alone in `articles/styleSheet-exposePhotoStrip-block.css` |
| Expose photo strip | 8 BodyFragment | `02ecbf04645da427f38d3a251ef523f3` | `articles/exposePhotoStrip.html` |

To switch the whole layout off, unpublish the "Expose photo strip" fragment: the CSS only applies to the elements the script adds or marks, so pages go back to the engine's layout.

The fade-out of Ask Aimée depends on the widget's `#aimee-launcher`, `#aimee-nudge` and the `aimee-open` class on `<html>`. If the widget renames them, the fade stops and Aimée simply stays visible.

## Publishing

```
RW_SESSION=<session id> python3 publish.py pull styleSheet
RW_SESSION=<session id> python3 publish.py update exposePhotoStrip
```

`articles.json` holds the origin and website ids and each article's id, file and fields. The session id is private: pass it in `RW_SESSION`, never commit it. The API token comes from the cloud environment's network secret for `nova.realtyware.net`. An update stops if the live article changed since the last pull or publish, so nobody's edit is overwritten unseen.

## Checks

The scripts in `tests/` open the live site in Chromium and check the layout at five screen sizes, swiping and arrows, the full-screen viewer, the action icons and the Aimée fade. Each prints one line per screen size and saves screenshots in `tests/screenshots/`.

```
cd tests && npm install
node check-layout.js live
```

They expect Chromium at `/opt/pw-browsers/chromium`, as in Claude Code cloud sessions. Without `live`, `check-layout.js`, `check-aimee-fade.js` and `check-swipe-and-arrows.js` test the local files by putting them in place of the live versions in the browser only.

## Backups

`backups/` holds the style sheet and fragment as they were before each change, named after the change that followed. `styleSheet-original-before-any-change.json` is the style sheet before the photo layout work began.
