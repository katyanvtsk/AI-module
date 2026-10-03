import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Task } from '../features/tasks/model/task'
import { LegacyBoardStats } from './LegacyBoardStats'

describe('LegacyBoardStats', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts only unfinished tasks due before the current local day', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 2, 0, 30))
    const dates = ['2026-10-01', '2026-10-02', '2026-10-03', undefined]
    const statuses = ['todo', 'in-progress', 'done'] as const
    const tasks: Task[] = statuses.flatMap((status) => dates.map((dueDate, index) => ({
      id: `${status}-${index}`,
      title: 'Задача',
      description: '',
      status,
      priority: 'medium',
      dueDate,
      createdAt: '2026-09-01T12:00:00.000Z',
      updatedAt: '2026-09-01T12:00:00.000Z',
    })))

    const { rerender } = render(<LegacyBoardStats tasks={tasks} />)

    expect(screen.getByText('Просрочено: 2')).toBeInTheDocument()
    expect(screen.getByText('Всего задач: 12')).toBeInTheDocument()
    expect(screen.getByText('В работе: 4')).toBeInTheDocument()
    expect(screen.getByText('Готово: 4')).toBeInTheDocument()

    rerender(<LegacyBoardStats tasks={[]} />)
    expect(screen.getByText('Просрочено: 0')).toBeInTheDocument()
  })
})
