/* ============================================================
   ARTWORKS — your exhibition. Edit this list and nothing else.
   ------------------------------------------------------------
   Order here = the order visitors move through the works.

   Fields:
     img     path in assets/works/  (a ~1200px display copy)
     w, h    the image's pixel size (prevents layout jump)
     title   shown on the wall label
     year    "2024"  ·  or "n.d." if undated
     medium  e.g. "Acrylic on canvas"
     size    dimensions, e.g. "30 × 40 in (76 × 102 cm)"
     scale   on-screen size, 0–1 (1 = biggest).
     border  framing: { mat, matW, frame, frameW }
               mat / matW    = inner border colour + thickness (px)
               frame / frameW = outer border colour + thickness (px)
             omit `mat` for a single coloured border.
     note    OPTIONAL one short line. Leave "" for a clean label.
   ============================================================ */

window.ARTWORKS = [
  { img: "assets/works/our.jpg", w: 1437, h: 1920,
    title: "Our", year: "n.d.",
    medium: "Acrylic on canvas", size: "30 × 40 in (76 × 102 cm)", scale: 1,
    border: { mat: "#ffffff", matW: 22, frame: "rgba(112,18,20,0.85)", frameW: 10 }, note: "" },

  { img: "assets/works/flag.jpg", w: 1920, h: 1508,
    title: "태극기", year: "n.d.",
    medium: "Acrylic on canvas", size: "24 × 30 in (61 × 76 cm)", scale: 0.72,
    border: { frame: "#111111", frameW: 10, frameTopW: 6 }, note: "" },

  { img: "assets/works/outside_boxes.jpg", w: 1920, h: 1433,
    title: "Think Outside the Boxes", year: "n.d.",
    medium: "Acrylic on canvas", size: "18 × 24 in (46 × 61 cm)", scale: 0.72,
    border: { mat: "#ffffff", matW: 22, frame: "rgba(138,106,14,0.5)", frameW: 10 }, note: "" }
];
