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

## Notes

- The PDF in `assets/` is the current visual reference and downloadable artifact.
- The structured JSON currently reflects verified facts already present in `joche.dev` plus the provided PDF identity details.
- Detailed role-by-role history should be transcribed from the PDF or updated directly in `resume.json` in a follow-up pass.

## Rendering options

Typical local workflow with the JSON Resume ecosystem:

```bash
npx resume-cli export resume.html --theme stackoverflow
```

Or validate the schema:

```bash
npx ajv validate -s https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json -d resume.json
```
