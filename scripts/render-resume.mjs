import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "resume.json");
const buildDir = path.join(root, "build");
const outputPath = path.join(buildDir, "resume.qmd");

const resume = JSON.parse(await fs.readFile(inputPath, "utf8"));

function escapeMarkdown(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/([*_`[\]<>])/g, "\\$1")
    .replace(/&/g, "\\&");
}

function escapeLatex(value = "") {
  return String(value)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([#$%&_{}])/g, "\\$1")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

function makeProjectList(projects = []) {
  return projects
    .map((project) => {
      const name = escapeLatex(project.name);
      const description = escapeLatex(project.description);
      return `\\textbf{${name}}\\\\\n${description}\n\n\\vspace{0.45em}`;
    })
    .join("\n\n");
}

function makeSkills(skills = []) {
  return skills
    .map((skill) => {
      const title = escapeLatex(skill.name);
      const keywords = Array.isArray(skill.keywords)
        ? skill.keywords.map((item) => escapeLatex(item)).join(", ")
        : "";
      return `\\item \\textbf{${title}:} ${keywords}`;
    })
    .join("\n");
}

const basics = resume.basics ?? {};
const contactLine = [basics.email, basics.url?.replace(/^https?:\/\//, "")]
  .filter(Boolean)
  .map((item) => escapeLatex(item))
  .join(" \\textbar{} ");

const lines = [
  "---",
  'title: ""',
  "format:",
  "  pdf:",
  "    toc: false",
  "    colorlinks: false",
  "    geometry:",
  "      - margin=0.55in",
  "    fontsize: 10pt",
  "title-block: false",
  "header-includes:",
  "  - |",
  "    \\usepackage{enumitem}",
  "    \\setlist[itemize]{leftmargin=1.2em,itemsep=0.2em,topsep=0.2em,parsep=0pt,partopsep=0pt}",
  "---",
  "",
  "\\begin{center}",
  `{\\LARGE \\textbf{${escapeLatex(basics.name)}}}\\\\`,
  "\\vspace{0.2em}",
  escapeLatex(basics.label),
  "\\\\",
  contactLine,
  "\\end{center}",
  "",
  "\\vspace{0.15em}",
  "\\hrule",
  "\\vspace{0.6em}",
  "",
  "\\section*{Profile}",
  "",
  escapeLatex(basics.summary),
  "",
  "\\section*{Core Skills}",
  "",
  "\\begin{itemize}",
  makeSkills(resume.skills),
  "\\end{itemize}",
  "",
  "\\section*{Selected Work}",
  "",
  makeProjectList(resume.projects),
  "",
];

await fs.mkdir(buildDir, { recursive: true });
await fs.writeFile(outputPath, lines.join("\n"), "utf8");

console.log(`Wrote ${path.relative(root, outputPath)}`);
