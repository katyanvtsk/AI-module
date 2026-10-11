const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const root = fs.realpathSync(path.resolve(__dirname, '../..'))
const skip = (reason) => console.log(`[PostToolUse] SKIP: ${reason}`)
const inside = (file) => {
  const relative = path.relative(root, file)
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)
}

function main() {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'))
  if (!['Edit', 'Write'].includes(input.tool_name)) return skip('unsupported tool')
  const filePath = input.tool_input?.file_path
  if (typeof filePath !== 'string' || !filePath) return skip('missing file_path')
  const file = path.resolve(root, filePath)
  if (!inside(file)) return skip('outside project')
  if (!['.ts', '.tsx'].includes(path.extname(file))) return skip('unsupported extension')
  if (!fs.existsSync(file)) return skip('file does not exist')
  const realFile = fs.realpathSync(file)
  if (!inside(realFile)) return skip('symlink outside project')
  if (!fs.statSync(realFile).isFile()) return skip('not a file')

  console.log(`[PostToolUse] ESLint: ${path.relative(root, realFile)}`)
  const result = spawnSync(process.execPath, [
    path.join(root, 'node_modules/eslint/bin/eslint.js'), realFile,
  ], { cwd: root, encoding: 'utf8', timeout: 30000, windowsHide: true })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.error) throw result.error
  console.log(`[PostToolUse] ESLint exit: ${result.status}`)
  process.exitCode = result.status === 0 ? 0 : 1
}

try {
  main()
} catch (error) {
  console.error(`[PostToolUse] ERROR: ${error.message}`)
  process.exitCode = 1
}
