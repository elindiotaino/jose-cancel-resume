# Jose Cancel Resume

This repository uses the open `JSON Resume` format as the maintainable source of truth for Jose Cancel's resume content.

## Why this stack

- Open standard with multiple renderers and themes
- Easy to version in Git
- Portable across sites, generators, and future tooling
- Good fit for keeping a structured resume in sync with `joche.dev`

## Current source files

- `resume.json`: structured resume data
- `assets/Resume - Jose Cancel - 2024.pdf`: current PDF baseline provided by Jose Cancel
- `scripts/render-resume.mjs`: converts `resume.json` into Quarto markdown for rendering
- `dist/jose-cancel-resume.pdf`: generated PDF output

## Notes

- The PDF in `assets/` is the current visual reference and downloadable artifact.
- The structured JSON currently reflects verified facts already present in `joche.dev` plus the provided PDF identity details.
- Detailed role-by-role history should be transcribed from the PDF or updated directly in `resume.json` in a follow-up pass.

## Rendering options

The repo now includes a repeatable open-source PDF workflow:

```bash
npm run render:pdf
```

That command:

- Reads `resume.json`
- Generates `build/resume.qmd`
- Uses Quarto to render `dist/jose-cancel-resume.pdf`

The source of truth remains `resume.json`, so future updates only need to touch that file.

Optional schema validation:

```bash
npx ajv validate -s https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json -d resume.json
```
