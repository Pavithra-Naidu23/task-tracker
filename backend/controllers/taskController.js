const Task = require('../models/Task');

const getTasks = async (req, res, next) => {
  try {
    const { search = '', status = '', priority = '', sort = 'newest' } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const tasks = await Task.find(filter).sort(sortOrder);

    res.status(200).json({ tasks, count: tasks.length });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description = '', status = 'Pending', priority = 'Medium', dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || null
    });

    res.status(201).json({ task, message: 'Task created successfully.' });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description = '', status, priority, dueDate } = req.body;

    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();

    res.status(200).json({ task, message: 'Task updated successfully.' });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
