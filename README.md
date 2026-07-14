# fractions_for_6_year_olds

A little interactive playground to help a 6-year-old (hi Emery!) get comfy with
fractions early — by cutting pizzas, colouring chocolate bars, and pressing
lots of buttons.

Inspired by, and built in the same style as,
[matrices_for_11_year_olds](https://jeremydwong.github.io/matrices_for_11_year_olds/).

## The pages

0. **Hi Emery!** — what a fraction is (fair, equal pieces of a whole)
1. **Weirdly-Written 1s** — every number is secretly a fraction over 1 (`5` is `5/1`)
2. **Same Kinds Add Up** — you can only add the same kind, just like ones and tens
3. **The Magic 1** — multiply by a weirdly-written 1 (`3/3`, `4/4`) to re-cut without changing the amount
4. **Now We Can Add!** — put it together to add fractions with different bottoms
5. **Fractions Are Everywhere** — a recap, and where to spot fractions in real life

## Style

The visual design derives from the reference stylesheets in
[`styles/reference/`](styles/reference/) — `normalize.css`, Skeleton
(`skeleton.css`), and `custom.css` (dark `#242424` default, Raleway,
`#33C3F0` accent, the blue navbar, the light/dark toggle switch — tap the
switch in the header to flip Emery to light mode). `theme.js` documents
which token comes from which rule. [`styles/site.css`](styles/site.css)
explains why `custom.css` isn't imported wholesale (its bare `label`/`input`
rules would hide interactive widgets) and scopes the pieces used.

## Requirements

node.js

## Build & run

```
npm install
npm run dev
```

Then open the local URL it prints (usually http://localhost:5173).

To make a production build: `npm run build` (output lands in `dist/`).

## Editing the words

The text of each page lives in `content/*.md` and can be edited without touching
any React. See [`content/README.md`](content/README.md) for the full guide.

## Deploying

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes
to GitHub Pages on every push to `main`. The site is served under
`/<repo-name>/` automatically (via the `BASE_PATH` env var in the workflow).
