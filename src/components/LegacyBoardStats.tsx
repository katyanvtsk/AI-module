import type { Task } from '../features/tasks/model/task'
import { TaskCounter } from '../features/tasks/components/TaskCounter'
import styles from './LegacyBoardStats.module.css'

interface LegacyBoardStatsProps {
  tasks: Task[]
}

export function LegacyBoardStats({ tasks }: LegacyBoardStatsProps) {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const inProgress = tasks.filter((task) => task.status === 'in-progress').length
  const done = tasks.filter((task) => task.status === 'done').length
  const overdue = tasks.filter((task) => task.dueDate && task.dueDate < today && task.status !== 'done').length

  return (
    <section className={styles.stats} aria-label="Статистика доски">
      <TaskCounter tasks={tasks} />
      <div className={styles.stat}>В работе: {inProgress}</div>
      <div className={styles.stat}>Готово: {done}</div>
      <div className={styles.stat}>Просрочено: {overdue}</div>
    </section>
  )
}
