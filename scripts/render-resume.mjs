import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "resume.json");
const buildDir = path.join(root, "build");
const outputPath = path.join(buildDir, "resume.qmd");

const resume = JSON.parse(await fs.readFile(inputPath, "utf8"));

function latex(value = "") {
  return String(value)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([#$%&_{}])/g, "\\$1")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

function formatDate(value) {
  if (!value) return "";
  const [year, month] = value.split("-");
  if (!month) return year;
  const months = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December",
  };
  return `${months[month] ?? month} ${year}`;
}

function sidebarSection(title, items) {
  return [
    `\\resumeSidebarSection{${latex(title)}}`,
    ...items,
    "\\vspace{0.9em}",
  ].join("\n");
}

function skillBlock(skill) {
  const keywords = (skill.keywords ?? []).map((item) => latex(item)).join(", ");
  return `\\resumeSidebarItem{${latex(skill.name)}}{${keywords}}`;
}

function interestBlock(interest) {
  const keywords = (interest.keywords ?? []).map((item) => latex(item)).join(", ");
  return `\\resumeSidebarItem{${latex(interest.name)}}{${keywords}}`;
}

function languageBlock(entry) {
  return `\\resumeLanguageItem{${latex(entry.language)}}{${latex(entry.fluency)}}`;
}

function workBlock(entry) {
  const start = formatDate(entry.startDate);
  const end = entry.endDate ? formatDate(entry.endDate) : "Present";
  const lines = [
    `\\resumeEntryTitle{${latex(entry.name)}}`,
    `\\resumeEntryMeta{${latex(entry.position)}}`,
    `\\resumeEntryMeta{${latex(entry.location)}}`,
    `\\resumeEntryMeta{${latex(`${start} - ${end}`)}}`,
    `\\resumeBody{${latex(entry.summary)}}`,
  ];

  if (entry.highlights?.length) {
    lines.push("\\resumeBody{Key Responsibilities:}");
    lines.push("\\begin{itemize}");
    for (const item of entry.highlights) {
      lines.push(`\\item ${latex(item)}`);
    }
    lines.push("\\end{itemize}");
  }

  lines.push("\\vspace{0.85em}");
  return lines.join("\n");
}

const basics = resume.basics ?? {};
const locationLine = [basics.location?.city, basics.location?.region].filter(Boolean).join(", ");
const contactBits = [locationLine, basics.phone, basics.email, basics.url]
  .filter(Boolean)
  .map((item) => latex(String(item).replace(/^https?:\/\//, "https://")))
  .join(" \\textbar{} ");

const lines = [
  "---",
  'title: ""',
  "format:",
  "  pdf:",
  "    toc: false",
  "    colorlinks: false",
  "    geometry:",
  "      - margin=0.45in",
  "    fontsize: 10pt",
  "title-block: false",
  "header-includes:",
  "  - |",
  "    \\usepackage{enumitem}",
  "    \\usepackage{fontspec}",
  "    \\setmainfont{IBM Plex Sans}",
  "    \\setsansfont{IBM Plex Sans}",
  "    \\renewcommand{\\familydefault}{\\sfdefault}",
  "    \\setlength{\\parindent}{0pt}",
  "    \\setlength{\\parskip}{0pt}",
  "    \\pagenumbering{gobble}",
  "    \\setlist[itemize]{leftmargin=1.25em,itemsep=0.22em,topsep=0.2em,parsep=0pt,partopsep=0pt}",
  "    \\newcommand{\\resumeSidebarSection}[1]{\\vspace{0.1em}{\\fontsize{10.5pt}{12pt}\\selectfont #1}\\par\\vspace{0.45em}}",
  "    \\newcommand{\\resumeSidebarItem}[2]{{\\fontsize{10.5pt}{12pt}\\selectfont #1}\\par\\vspace{0.12em}{\\fontsize{9.19pt}{11pt}\\selectfont #2}\\par\\vspace{0.7em}}",
  "    \\newcommand{\\resumeLanguageItem}[2]{{\\fontsize{10.5pt}{12pt}\\selectfont #1}\\par{\\fontsize{10.5pt}{12pt}\\selectfont #2}\\par\\vspace{0.7em}}",
  "    \\newcommand{\\resumeMainSection}[1]{\\vspace{0.1em}{\\fontsize{10.5pt}{12pt}\\selectfont #1}\\par\\vspace{0.45em}}",
  "    \\newcommand{\\resumeEntryTitle}[1]{{\\fontsize{10.5pt}{12pt}\\selectfont #1}\\par\\vspace{0.08em}}",
  "    \\newcommand{\\resumeEntryMeta}[1]{{\\fontsize{10.5pt}{12pt}\\selectfont #1}\\par\\vspace{0.08em}}",
  "    \\newcommand{\\resumeBody}[1]{{\\fontsize{10.5pt}{12pt}\\selectfont #1}\\par\\vspace{0.08em}}",
  "---",
  "",
  "\\begin{center}",
  `{\\fontsize{15.75pt}{18pt}\\selectfont ${latex(basics.name)} }\\\\`,
  "\\vspace{0.18em}",
  `{\\fontsize{10.5pt}{12.5pt}\\selectfont ${latex(basics.label)}}\\\\`,
  "\\vspace{0.55em}",
  `{\\fontsize{9.19pt}{11pt}\\selectfont ${contactBits}}`,
  "\\end{center}",
  "",
  "\\vspace{0.55em}",
  "\\noindent",
  "\\begin{minipage}[t]{0.31\\textwidth}",
  "\\centering",
  sidebarSection("Skills", (resume.skills ?? []).map(skillBlock)),
  sidebarSection("Interests", (resume.interests ?? []).map(interestBlock)),
  sidebarSection("Languages", (resume.languages ?? []).map(languageBlock)),
  "\\end{minipage}",
  "\\hfill",
  "\\begin{minipage}[t]{0.64\\textwidth}",
  "\\resumeMainSection{Summary}",
  `\\resumeBody{${latex(basics.summary)}}`,
  "\\vspace{0.8em}",
  "\\resumeMainSection{Experience}",
  ...(resume.work ?? []).map(workBlock),
  "\\resumeMainSection{References}",
  `\\resumeBody{${latex(resume.references?.[0]?.reference ?? "Available upon request.")}}`,
  "\\end{minipage}",
  "",
];

await fs.mkdir(buildDir, { recursive: true });
await fs.writeFile(outputPath, lines.join("\n"), "utf8");

console.log(`Wrote ${path.relative(root, outputPath)}`);
