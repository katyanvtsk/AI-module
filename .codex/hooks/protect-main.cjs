const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const input = JSON.parse(fs.readFileSync(0, "utf8"));
const projectRoot = process.env.CODEX_PROJECT_DIR ?? process.cwd();
const command = String(input.tool_input?.command ?? "");

if (!/\bgit\s+push\b/.test(command)) {
  process.exit(0);
}

const branch = execFileSync("git", ["branch", "--show-current"], {
  cwd: projectRoot,
  encoding: "utf8",
}).trim();

if (branch === "main") {
  console.error("Прямой push из main запрещён. Создай feature-ветку.");
  process.exit(2);
}
