# irisyon.github.io

Portfolio of **Iris Yon** — painter & creative technologist, San Francisco.

A minimal single-page gallery of paintings, with an artist statement, CV, and a
working contact form. Static site — vanilla HTML / CSS / JS, no build step — served
free on GitHub Pages.

**Live → https://irisyon.github.io**

```
index.html        the gallery (home) — scroll through the works
statement.html    artist statement
cv.html           curriculum vitae
contact.html      contact form (delivers via Web3Forms)
css/museum.css    the design system
js/site.js        gallery, lightbox, contact form, custom cursor
js/artworks.js    ← the editable list of works
optimize.sh       rebuilds web-sized images from your originals
assets/works/     images — display copies · tiny/ blur-ups · full/ originals
```

## Editing the gallery

The gallery is built entirely from the array in **`js/artworks.js`** — order in the
list is the order visitors scroll through. To add a piece:

1. Drop the full-size image in `assets/works/full/`.
2. Run `./optimize.sh` to build the display copy and blur-up placeholder.
3. Add an entry:

```js
{
  img: "assets/works/your-image.jpg",
  w: 1920, h: 1500,                         // pixel size (prevents layout jump)
  title: "Your Title", year: "n.d.",
  medium: "Acrylic on canvas",
  size: "18 × 24 in (46 × 61 cm)",
  scale: 0.72,                              // on-screen size, 0–1 (1 = biggest)
  border: { mat: "#ffffff", matW: 22, frame: "rgba(20,20,20,0.85)", frameW: 10 }
}
```

After editing CSS/JS, bump the `?v=N` query on the `<link>`/`<script>` tags in the
`.html` files so returning visitors skip the cache.

## Preview locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

The empty `.nojekyll` file tells GitHub Pages to serve every file as-is.
