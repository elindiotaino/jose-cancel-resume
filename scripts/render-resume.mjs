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
    .replace(/([*_`[\]<>])/g, "\\$1");
}

function makeBulletList(items = []) {
  return items.map((item) => `- ${escapeMarkdown(item)}`).join("\n");
}

function makeProjectList(projects = []) {
  return projects
    .map((project) => {
      const name = escapeMarkdown(project.name);
      const description = escapeMarkdown(project.description);
      const url = project.url ? `  \n${escapeMarkdown(project.url)}` : "";
      return `### ${name}\n\n${description}${url}`;
    })
    .join("\n\n");
}

function makeSkills(skills = []) {
  return skills
    .map((skill) => {
      const title = escapeMarkdown(skill.name);
      const keywords = Array.isArray(skill.keywords)
        ? skill.keywords.map((item) => escapeMarkdown(item)).join(", ")
        : "";
      return `- **${title}:** ${keywords}`;
    })
    .join("\n");
}

const basics = resume.basics ?? {};
const lines = [
  "---",
  `title: "${String(basics.name ?? "Resume").replace(/"/g, '\\"')}"`,
  "format:",
  "  pdf:",
  "    toc: false",
  "    colorlinks: true",
  "    geometry:",
  "      - margin=0.6in",
  "    fontsize: 10pt",
  "---",
  "",
  `# ${escapeMarkdown(basics.name)}`,
  "",
  `**${escapeMarkdown(basics.label)}**  `,
  `${escapeMarkdown(basics.email)} | ${escapeMarkdown(basics.url)}`,
  "",
  "## Profile",
  "",
  escapeMarkdown(basics.summary),
  "",
  "## Skills",
  "",
  makeSkills(resume.skills),
  "",
  "## Selected Work",
  "",
  makeProjectList(resume.projects),
  "",
];

await fs.mkdir(buildDir, { recursive: true });
await fs.writeFile(outputPath, lines.join("\n"), "utf8");

console.log(`Wrote ${path.relative(root, outputPath)}`);
