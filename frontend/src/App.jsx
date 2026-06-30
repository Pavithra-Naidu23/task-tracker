import { useEffect, useMemo, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { FaPlus, FaSearch, FaFilter, FaTrash, FaEdit, FaSpinner, FaCheckCircle } from 'react-icons/fa'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://task-tracker-faer.onrender.com/api/tasks'
const initialForm = {
  title: '',
  description: '',
  status: 'Pending',
  priority: 'Medium',
  dueDate: ''
}

function App() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await axios.get(API_URL, {
        params: {
          search,
          status: statusFilter,
          priority: priorityFilter,
          sort: sortOrder
        }
      })
      setTasks(response.data.tasks || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [search, statusFilter, priorityFilter, sortOrder])

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title.trim()) {
      toast.error('Title cannot be empty')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form)
        toast.success('Task updated successfully')
      } else {
        await axios.post(API_URL, form)
        toast.success('Task created successfully')
      }
      resetForm()
      fetchTasks()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save task')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (task) => {
    setEditingId(task._id)
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      await axios.delete(`${API_URL}/${deleteTarget}`)
      toast.success('Task deleted successfully')
      setDeleteTarget(null)
      fetchTasks()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete task')
    }
  }

  const counts = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'Completed').length
    const pending = tasks.filter((task) => task.status === 'Pending').length
    const highPriority = tasks.filter((task) => task.priority === 'High').length
    return {
      total: tasks.length,
      completed,
      pending,
      highPriority
    }
  }, [tasks])

  return (
    <div className="app-shell">
      <ToastContainer position="top-right" autoClose={2500} />
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Internship-ready dashboard</p>
          <h1>Task Tracker</h1>
          <p className="hero-text">Create, update, search, and manage tasks in one polished workspace.</p>
        </div>
        <div className="hero-stats">
          <div className="hero-pill">
            <FaCheckCircle />
            <span>{counts.total} total tasks</span>
          </div>
          <div className="stats-grid compact">
            <div className="stat-card">
              <strong>{counts.pending}</strong>
              <span>Pending</span>
            </div>
            <div className="stat-card">
              <strong>{counts.completed}</strong>
              <span>Completed</span>
            </div>
            <div className="stat-card">
              <strong>{counts.highPriority}</strong>
              <span>High Priority</span>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="panel form-panel">
          <div className="panel-title">
            <h2>{editingId ? 'Edit Task' : 'Create Task'}</h2>
            <p>Capture every detail clearly and keep deadlines visible.</p>
          </div>
          <form className="task-form" onSubmit={handleSubmit}>
            <label>
              Title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Task title"
              />
            </label>
            <label>
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Task description"
              />
            </label>
            <div className="row">
              <label>
                Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
              <label>
                Priority
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
            </div>
            <label>
              Due Date
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? <FaSpinner className="spin" /> : <FaPlus />} {editingId ? 'Update Task' : 'Add Task'}
              </button>
              {editingId && (
                <button type="button" className="secondary-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel list-panel">
          <div className="panel-title">
            <h2>Task List</h2>
            <p>Browse, filter, and organize your work quickly.</p>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <FaSearch />
              <input
                placeholder="Search tasks"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filters">
              <label className="filter-pill">
                <FaFilter />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
              <label className="filter-pill">
                <FaFilter />
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label className="filter-pill">
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <FaSpinner className="spin" />
              <p>Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks yet</h3>
              <p>Add your first task to start tracking work.</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article key={task._id} className="task-card">
                  <div className="task-card-main">
                    <div className="task-meta">
                      <span className={`status-badge ${task.status.toLowerCase().replace(/\s+/g, '-')}`}>{task.status}</span>
                      <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                    </div>
                    <h3>{task.title}</h3>
                    <p>{task.description || 'No description provided.'}</p>
                    <div className="task-footer">
                      <span>{task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}</span>
                      <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="actions">
                    <button onClick={() => handleEdit(task)} title="Edit task">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(task._id)} className="danger" title="Delete task">
                      <FaTrash /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Delete task?</h3>
            <p>Are you sure you want to delete this task? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="danger-btn" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
