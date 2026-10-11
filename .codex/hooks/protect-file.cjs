const fs = require("node:fs");

const raw = fs.readFileSync(0, "utf8");

fs.appendFileSync(
  "D:/react/task-board-starter/.codex/hook-debug.log",
  raw + "\n---\n",
);

const input = JSON.parse(raw);

const filePath = String(input.tool_input?.file_path ?? "").replaceAll(
  "\\",
  "/",
);

if (filePath.endsWith("/.codex/hook-fixtures/protected.txt")) {
  console.error("Учебный файл защищён хуком");
  process.exit(2);
}
