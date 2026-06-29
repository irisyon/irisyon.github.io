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
  { img: "assets/works/our.jpg", w: 1500, h: 2000,
    title: "Our", year: "n.d.",
    medium: "Acrylic on canvas", size: "36 × 48 in (91 × 122 cm)", scale: 1,
    border: { mat: "#ffffff", matW: 22, frame: "rgba(112,18,20,0.85)", frameW: 10 }, note: "",
    description: [
      "This acrylic painting explores the emotional dissonance of living through an era in which war, genocide, and human suffering unfold continuously while everyday life carries on uninterrupted. It emerged from the experience of witnessing immense violence while still being expected to work, consume, and perform normalcy. The work asks what happens to our humanity when survival depends on compartmentalizing the pain of others.",
      "My handprints are embedded throughout the painting as physical evidence of presence, accountability, and shared humanity. Pressed into the surface, they suggest that none of us stands untouched by the wounds we inflict, inherit, or choose not to see.",
      "Violence does not remain confined to the places where it occurs. It seeps into every layer of humanity, leaving traces that ripple far beyond a single moment or geography. Whether acknowledged or ignored, these traces become part of the human landscape we all inhabit, asking us to reconsider where another's suffering ends and our own humanity begins."
    ] },

  { img: "assets/works/flag.jpg", w: 1920, h: 1488,
    title: "태극기", year: "n.d.",
    medium: "Acrylic on canvas", size: "12 × 16 in (30 × 41 cm)", scale: 0.5,
    border: { frame: "#111111", frameW: 10 }, note: "",
    description: [
      "The work draws from the layered history of South Korea, shaped by war, division, and reconstruction, as well as cultural structures that emphasize discipline, cohesion, and collective perception. Returning as an adult sharpened an awareness of how these frameworks subtly contour behavior and expression, particularly in relation to creativity, which can be guided toward clarity, restraint, and legibility.",
      "Korean motifs and patterning operate as a structural foundation within the painting, then loosen, stretch, and dissolve into fields of color and fluid, nonconforming gesture. Traditional systems remain present but are reconfigured, opening into unstable conditions of form, rhythm, and spatial logic.",
      "This body of work holds a sustained tension between recognition and pressure: the immediacy of cultural familiarity alongside a quieter weight shaped by expectation and judgment. Rather than resolving this condition, the painting holds it open, where the impulse to express and the inclination to conform continually reshape one another, forming a space that refuses closure and remains in motion."
    ] },

  { img: "assets/works/outside_boxes.jpg", w: 1920, h: 1433,
    title: "Think Outside the Boxes", year: "n.d.",
    medium: "Acrylic on canvas", size: "12 × 16 in (30 × 41 cm)", scale: 0.5,
    border: { mat: "#ffffff", matW: 22, frame: "rgba(196,156,48,0.72)", frameW: 10 }, note: "",
    description: [
      "This work considers how systems of evaluation define value through comparison and containment, shaping what forms of expression are allowed to register as legible, successful, or worthy. Within this logic, human potential is translated into measurable outcomes through frameworks that privilege categorization, ranking, and standardized interpretation, where division itself becomes a method of meaning-making. The composition draws on this structure through grids, boxes, and bounded fields that mirror systems of assessment and control.",
      "Within and against these frameworks, color and gesture push past their limits, spilling across the divisions they are meant to stay within. Expression cannot be neatly contained or measured in the way these systems require, and it resists being reduced to comparable units of value.",
      "As these structures are pressed, their logic fractures, revealing the gap between lived creative impulse and systems built to measure it. Meaning emerges from what escapes classification."
    ] }
];
