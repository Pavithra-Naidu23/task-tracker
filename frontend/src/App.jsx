import { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { FaPlus, FaSearch, FaFilter, FaTrash, FaEdit, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/tasks';

const emptyForm = {
  title: '',
  description: '',
  status: 'Pending',
  priority: 'Medium',
  dueDate: ''
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        params: {
          search,
          status: statusFilter,
          priority: priorityFilter,
          sort: sortOrder
        }
      });
      setTasks(res.data.tasks || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter, sortOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        toast.success('Task updated successfully.');
      } else {
        await axios.post(API_URL, form);
        toast.success('Task created successfully.');
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API_URL}/${deleteTarget}`);
      toast.success('Task deleted successfully.');
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete task.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'Completed').length;
    const pending = tasks.filter((task) => task.status === 'Pending').length;
    return { total, completed, pending };
  }, [tasks]);

  return (
    <div className="app-shell">
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="hero">
        <div>
          <p className="eyebrow">MERN Stack Productivity Suite</p>
          <h1>Task Tracker</h1>
          <p className="hero-text">Plan better, stay organized, and deliver work on time.</p>
        </div>
        <div className="hero-pill">
          <FaCheckCircle />
          <span>{stats.total} active tasks</span>
        </div>
      </header>

      <main className="dashboard">
        <section className="panel form-panel">
          <div className="panel-title">
            <h2>{editingId ? 'Edit Task' : 'Create Task'}</h2>
            <p>Capture every task with details and deadlines.</p>
          </div>

          <form onSubmit={handleSubmit} className="task-form">
            <label>
              Title
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter task title"
              />
            </label>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="3"
                placeholder="Add notes or description"
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

            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? <FaSpinner className="spin" /> : <FaPlus />} {editingId ? 'Update Task' : 'Add Task'}
            </button>
          </form>
        </section>

        <section className="panel list-panel">
          <div className="panel-title">
            <h2>Your Tasks</h2>
            <p>Browse, organize, and track progress effortlessly.</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <strong>{stats.total}</strong>
              <span>Total</span>
            </div>
            <div className="stat-card">
              <strong>{stats.pending}</strong>
              <span>Pending</span>
            </div>
            <div className="stat-card">
              <strong>{stats.completed}</strong>
              <span>Completed</span>
            </div>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
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
              <h3>No tasks found</h3>
              <p>Create your first task to start organizing your work.</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article key={task._id} className="task-card">
                  <div className="task-main">
                    <div className="task-meta">
                      <span className={`status-badge ${task.status.toLowerCase().replace(/\s+/g, '-')}`}>{task.status}</span>
                      <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                    </div>
                    <h3>{task.title}</h3>
                    <p>{task.description || 'No description provided.'}</p>
                    <div className="task-footer">
                      <span>{task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}</span>
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="actions">
                    <button onClick={() => handleEdit(task)}><FaEdit /></button>
                    <button onClick={() => setDeleteTarget(task._id)} className="danger"><FaTrash /></button>
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
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="danger-btn" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
