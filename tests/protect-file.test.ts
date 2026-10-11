import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const hookPath = resolve('.codex/hooks/protect-file.cjs')

function runHook(toolName: string, command: string) {
  const result = spawnSync(process.execPath, [hookPath], {
    input: JSON.stringify({
      hook_event_name: 'PreToolUse',
      tool_name: toolName,
      tool_input: { command },
    }),
    encoding: 'utf8',
    timeout: 5000,
  })
  expect(result.error).toBeUndefined()
  return result
}

describe('protect-file hook', () => {
  it.each([
    'Get-Content .codex/hook-fixtures/protected.txt',
    'Get-Content -LiteralPath "D:\\react\\task-board-starter\\.codex\\hook-fixtures\\PROTECTED.TXT" -Raw',
    "cat './folder with spaces/protected.txt'",
    'gc protected.txt',
    'type protected.txt',
    'Get-Item protected.txt',
    'Get-FileHash .codex/hook-fixtures/protected.txt',
    'Test-Path protected.txt',
    'Select-String -Path protected.txt -Pattern test',
  ])('allows reading: %s', (command) => {
    expect(runHook('Bash', command).status).toBe(0)
  })

  it.each([
    'Set-Content protected.txt changed',
    'Add-Content protected.txt changed',
    'Clear-Content protected.txt',
    'Remove-Item protected.txt',
    'Rename-Item protected.txt renamed.txt',
    'Move-Item protected.txt renamed.txt',
    'Copy-Item other.txt protected.txt',
    '"changed" | Out-File protected.txt',
    'echo changed > protected.txt',
    'Get-Content other.txt > protected.txt',
    'Get-Content protected.txt; Set-Content protected.txt changed',
    'Get-Content protected.txt\nRemove-Item protected.txt',
    'Get-Content protected.txt | Set-Content protected.txt',
    'Get-Content "$(Set-Content protected.txt changed)"',
    'Get-Content protected.txt`nRemove-Item protected.txt',
    'node -e "require(\'fs\').writeFileSync(\'protected.txt\', \'changed\')"',
  ])('blocks a write or ambiguous command: %s', (command) => {
    const result = runHook('Bash', command)
    expect(result.status).toBe(2)
    expect(result.stderr.trim()).not.toBe('')
  })

  it.each(['Add File', 'Update File', 'Delete File', 'Move to'])(
    'blocks patch operation %s',
    (operation) => {
      const patch = `*** Begin Patch\n*** ${operation}: .codex/hook-fixtures/protected.txt\n*** End Patch`
      expect(runHook('apply_patch', patch).status).toBe(2)
    },
  )

  it('allows changing other files', () => {
    expect(runHook('Bash', 'Set-Content unprotected.txt changed').status).toBe(0)
    expect(runHook('apply_patch', '*** Begin Patch\n*** Update File: other.txt\n*** End Patch').status).toBe(0)
  })

  it('does not treat patch content as a protected path', () => {
    const patch = '*** Begin Patch\n*** Update File: other.txt\n@@\n+protected.txt\n*** End Patch'
    expect(runHook('apply_patch', patch).status).toBe(0)
  })
})
