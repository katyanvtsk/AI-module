import type { Task } from '../model/task'
import styles from './TaskCounter.module.css'

interface TaskCounterProps {
  tasks: Task[]
}

export function TaskCounter({ tasks }: TaskCounterProps) {
  return <div className={styles.counter}>Всего задач: {tasks.length}</div>
}
