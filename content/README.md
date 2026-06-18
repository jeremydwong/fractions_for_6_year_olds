# Fractions for Emery — Editing Guide

This is a React app where the **interactive widgets** live in `fraction-explorer.jsx` and the **prose text** lives in plain Markdown files under `content/`. You can rewrite, expand, or reorganize any page's text without touching React.

## File layout

```
fraction-explorer.jsx     ← main React component (pizzas, bars, buttons, animations)
Markdown.jsx              ← lightweight parser that renders the .md files
shared-blocks.jsx         ← styled boxes (Prose, Callout, Definition, TakeHome)
theme.js                 ← colours and fonts
content/
  ch0-intro.md            ← Hi Emery! (what is a fraction)
  ch1-weird-ones.md       ← Weirdly-Written 1s (5 is 5/1)
  ch2-same-kinds.md       ← Same Kinds Add Up
  ch3-magic-one.md        ← The Magic 1 (multiply by 3/3, 4/4)
  ch4-now-we-can-add.md   ← Now We Can Add!
  ch5-everywhere.md       ← Fractions Are Everywhere (summary)
```

## How each page file is structured

Most pages have an `intro` section (text before the interactive widget) and an `outro` section (text after — usually closing remarks plus the take-home box):

```markdown
# intro

Plain markdown here. **Bold**, *italic*, `code`, [links](https://example.com).

# outro

Closing prose, plus the take-home box.
```

The `# intro` and `# outro` markers are how the React component splits the file into the right slots. **Don't remove them.** If a page has no `# outro`, just write everything under `# intro`.

## Custom directives

All three open with `:::name` and close with `:::end`.

### Callout (italic side-quote with a coloured bar)

```markdown
:::callout color=orange
Try pressing the buttons below!
:::end
```

Colours available: `cyan`, `magenta`, `gold`, `green`, `orange`, `purple`, `muted`.

### Take-Home (the gold ✦ box at the end of a page)

```markdown
:::takehome color=gold
:::major
- The biggest idea.
- The next biggest idea.
:::minor
- A supporting note.
:::end
```

## Inline formatting

| What you write | What you get |
| --- | --- |
| `**bold**` | bold |
| `*italic*` | italic |
| `` `code` `` | monospace, gold-ish (great for fractions like `1/2`) |
| `{{x}}` | "math span" — monospace gold |
| `[click me](https://...)` | a link |

## What you **cannot** edit from a `.md` file

The interactive widgets — the clickable pizza, the chocolate bars, the magic-1 animation, the add-it-up walkthrough — all live in `fraction-explorer.jsx`. To change a widget, edit the JSX. To change the words around it, the Markdown file is enough.

## Quick start

```
npm install
npm run dev
```

Then open the local URL it prints. Edits to `content/*.md` hot-reload instantly.
