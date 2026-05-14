import useStore from '../store/useStore'
import Task from './Task'
import TeacherTask from './TeacherTask'

function TaskWrapper() {
  const user = useStore((state) => state.user)
  
  if (!user) return null
  
  return user.role === 'teacher' ? <TeacherTask /> : <Task />
}

export default TaskWrapper
