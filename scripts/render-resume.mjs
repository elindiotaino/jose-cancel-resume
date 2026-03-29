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
    `\\resumeEntryMeta{${latex(`${entry.position} | ${entry.location} | ${start} - ${end}`)}}`,
    `\\resumeBody{${latex(entry.summary)}}`,
  ];

  if (entry.highlights?.length) {
    lines.push("\\begin{itemize}");
    lines.push(`\\item ${latex(entry.highlights[0])}`);
    lines.push("\\end{itemize}");
  }

  lines.push("\\vspace{0.4em}");
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
  "      - margin=0.32in",
  "    fontsize: 9pt",
  "title-block: false",
  "header-includes:",
  "  - |",
  "    \\usepackage{enumitem}",
  "    \\usepackage{fontspec}",
  "    \\usepackage[most]{tcolorbox}",
  "    \\usepackage{xcolor}",
  "    \\setmainfont{IBM Plex Sans}",
  "    \\setsansfont{IBM Plex Sans}",
  "    \\renewcommand{\\familydefault}{\\sfdefault}",
  "    \\setlength{\\parindent}{0pt}",
  "    \\setlength{\\parskip}{0pt}",
  "    \\pagenumbering{gobble}",
  "    \\raggedbottom",
  "    \\emergencystretch=1.5em",
  "    \\hyphenpenalty=800",
  "    \\exhyphenpenalty=800",
  "    \\definecolor{brandDeep}{HTML}{0D1C26}",
  "    \\definecolor{brandSlate}{HTML}{5D7366}",
  "    \\definecolor{brandGlow}{HTML}{38BDF8}",
  "    \\definecolor{brandAmber}{HTML}{F59E0B}",
  "    \\definecolor{brandSoft}{HTML}{EAF7FD}",
  "    \\definecolor{brandText}{HTML}{11222D}",
  "    \\definecolor{brandMuted}{HTML}{4F6470}",
  "    \\setlist[itemize]{leftmargin=1.05em,itemsep=0.1em,topsep=0.08em,parsep=0pt,partopsep=0pt}",
  "    \\newcommand{\\resumeSidebarSection}[1]{\\vspace{0.08em}{\\color{brandGlow}\\fontsize{9pt}{10pt}\\selectfont\\textbf{#1}}\\par\\vspace{0.24em}}",
  "    \\newcommand{\\resumeSidebarItem}[2]{{\\raggedright\\color{white}\\fontsize{8.5pt}{9.5pt}\\selectfont #1\\par}\\vspace{0.05em}{\\raggedright\\color{white!84}\\fontsize{7.8pt}{8.8pt}\\selectfont #2\\par}\\vspace{0.26em}}",
  "    \\newcommand{\\resumeLanguageItem}[2]{{\\color{white}\\fontsize{8.5pt}{9.5pt}\\selectfont #1}\\hfill{\\color{brandAmber!88!white}\\fontsize{8.5pt}{9.5pt}\\selectfont #2}\\par\\vspace{0.22em}}",
  "    \\newcommand{\\resumeMainSection}[1]{\\vspace{0.04em}\\tcbox[colback=brandSoft,colframe=brandGlow,boxrule=0pt,arc=2pt,left=5pt,right=5pt,top=3pt,bottom=3pt]{\\color{brandDeep}\\fontsize{9pt}{10pt}\\selectfont\\textbf{#1}}\\par\\vspace{0.16em}}",
  "    \\newcommand{\\resumeEntryTitle}[1]{{\\color{brandDeep}\\fontsize{8.8pt}{9.8pt}\\selectfont\\textbf{#1}}\\par\\vspace{0.04em}}",
  "    \\newcommand{\\resumeEntryMeta}[1]{{\\color{brandMuted}\\fontsize{7.9pt}{8.9pt}\\selectfont #1}\\par\\vspace{0.03em}}",
  "    \\newcommand{\\resumeBody}[1]{{\\raggedright\\color{brandText}\\fontsize{8.0pt}{8.8pt}\\selectfont #1\\par}\\vspace{0.02em}}",
  "---",
  "",
  "\\begin{tcolorbox}[enhanced,colback=brandDeep,colframe=brandDeep,arc=5pt,boxrule=0pt,left=11pt,right=11pt,top=9pt,bottom=9pt]",
  "{\\color{brandAmber}\\rule{4.5cm}{1.1pt}}\\\\[-0.15em]",
  `{\\color{white}\\fontsize{14.6pt}{16.5pt}\\selectfont ${latex(basics.name)}}\\\\`,
  "\\vspace{0.08em}",
  `{\\color{white!92}\\fontsize{8.7pt}{9.8pt}\\selectfont ${latex(basics.label)}}\\\\`,
  "\\vspace{0.28em}",
  `{\\color{brandGlow}\\fontsize{7.7pt}{8.8pt}\\selectfont ${contactBits}}`,
  "\\end{tcolorbox}",
  "",
  "\\vspace{0.22em}",
  "\\noindent",
  "\\begin{minipage}[t]{0.305\\textwidth}",
  "\\begin{tcolorbox}[enhanced,colback=brandDeep,colframe=brandDeep,arc=5pt,boxrule=0pt,left=9pt,right=9pt,top=8pt,bottom=8pt]",
  sidebarSection("Skills", (resume.skills ?? []).map(skillBlock)),
  sidebarSection("Languages", (resume.languages ?? []).map(languageBlock)),
  "\\end{tcolorbox}",
  "\\end{minipage}",
  "\\hfill",
  "\\begin{minipage}[t]{0.68\\textwidth}",
  "\\begin{tcolorbox}[enhanced,colback=white,colframe=brandSlate!22,arc=5pt,boxrule=0.55pt,left=10pt,right=10pt,top=8pt,bottom=8pt]",
  "\\resumeMainSection{Summary}",
  `\\resumeBody{${latex(basics.summary)}}`,
  "\\vspace{0.14em}",
  "\\resumeMainSection{Experience}",
  ...(resume.work ?? []).map(workBlock),
  "\\end{tcolorbox}",
  "\\end{minipage}",
  "",
];

await fs.mkdir(buildDir, { recursive: true });
await fs.writeFile(outputPath, lines.join("\n"), "utf8");

console.log(`Wrote ${path.relative(root, outputPath)}`);
