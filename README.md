# TASARU Supplier Hub landing page

A responsive, dependency-free landing page built from the supplied TASARU brief.

## Preview

Run a local static server from this directory:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Files

- `index.html` - semantic page structure and exact supplied content
- `styles.css` - responsive brand styling and motion
- `feedback.css` - selected concept sections and client feedback refinements
- `typography.css` - shared Forma DJR Arabic type sizes, weights and line spacing
- `script.js` - navigation, search, component carousel, map highlights, orbital motion, counters, and reveal behavior
- `client-feedback.md` - PDF comment mapping, verification, and outstanding link destinations
- `assets/` - supplied TASARU logo and original project imagery

The contact email is `info@tasarusupplierhub.sa`. All 17 inner pages are included. `page-suite.css` and `page-suite.js` provide additional layouts, supplier capability switching and media filters. Generated imagery is illustrative; prompts are in `assets/inner/generation-prompts.txt`. The enquiry form is not connected and does not send or save details. Social URLs and legal content remain pending.


## Internal-page photography update - 8 October 2026

All 17 internal pages use 57 distinct illustrative photographs generated with the built-in image-generation tool, guided by the supplied brand identity PDF photography references. No photo is repeated between internal-page placements. Supplier navigation and related-story links use compact logo/text cards.

Assets: `assets/inner-polished/`. Each photograph has a half-size 1x WebP and a native-detail @2x WebP (approximately 1680 x 936 pixels). The generator returned this native size despite larger requested dimensions; full-width heroes use the largest available raster. `manifest.json`, `page-map.json`, and `prompts.md` record sources, dimensions, placements, and generation prompts. `inner-imagery.css` provides scoped overlays and clean crops.

Verification: all 17 pages passed at 1440px and 390px, with zero missing images, browser errors, or horizontal overflow; foundation and supplier image switching passed. Homepage imagery is unchanged.
