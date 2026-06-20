import { useState } from 'react';
import './App.css';

const DATE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

function toDateStr(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isWithinRange(date, filter) {
  const now = new Date();
  const d = new Date(date);
  if (filter === 'today') return d.toDateString() === now.toDateString();
  if (filter === 'week') {
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 7);
    return d >= cutoff;
  }
  if (filter === 'month') {
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 30);
    return d >= cutoff;
  }
  return true;
}

const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [pickedDate, setPickedDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    setTodos([...todos, { id: Date.now(), text, completed: false, createdAt: new Date() }]);
    setInputValue('');
  };

  const handleDelete = (id) => setTodos(todos.filter((t) => t.id !== id));

  const handleToggle = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const handleEditStart = (id, text) => {
    setEditingId(id);
    setEditValue(text);
  };

  const handleEditSave = (id) => {
    const text = editValue.trim();
    if (text) setTodos(todos.map((t) => (t.id === id ? { ...t, text } : t)));
    setEditingId(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handlePresetFilter = (key) => {
    setDateFilter(key);
    setPickedDate('');
  };

  const handlePickedDate = (val) => {
    setPickedDate(val);
    if (val) setDateFilter('all');
  };

  const filteredTodos = todos
    .filter((t) =>
      pickedDate ? toDateStr(t.createdAt) === pickedDate : isWithinRange(t.createdAt, dateFilter)
    )
    .filter((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="container">
      <h1 className="title">Todo List</h1>

      <form className="input-row" onSubmit={handleAdd}>
        <input
          className="todo-input"
          type="text"
          placeholder="What needs to be done?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button className="add-btn" type="submit">
          Add
        </button>
      </form>

      <input
        className="search-input"
        type="text"
        placeholder="Search todos…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="filter-bar">
        {DATE_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={`filter-btn${!pickedDate && dateFilter === key ? ' active' : ''}`}
            onClick={() => handlePresetFilter(key)}
          >
            {label}
          </button>
        ))}

        <div className={`date-picker-pill${pickedDate ? ' has-date' : ''}`}>
          <span className="cal-icon">
            <CalendarIcon />
          </span>
          <input
            type="date"
            className="date-native"
            value={pickedDate}
            max={toDateStr(new Date())}
            onChange={(e) => handlePickedDate(e.target.value)}
            aria-label="Pick a specific date"
          />
          {pickedDate && (
            <button
              className="clear-date-btn"
              onClick={() => handlePickedDate('')}
              aria-label="Clear date filter"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {filteredTodos.length === 0 ? (
        <p className="empty-message">
          {todos.length === 0 ? 'No todos yet. Add one above!' : 'No todos match your filters.'}
        </p>
      ) : (
        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <li key={todo.id} className="todo-item">
              {editingId === todo.id ? (
                <input
                  className="edit-input"
                  value={editValue}
                  autoFocus
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave(todo.id);
                    if (e.key === 'Escape') handleEditCancel();
                  }}
                  onBlur={() => handleEditSave(todo.id)}
                />
              ) : (
                <div className="todo-body" onClick={() => handleToggle(todo.id)}>
                  <span className={`todo-text${todo.completed ? ' completed' : ''}`}>
                    {todo.text}
                  </span>
                  <span className="todo-date">
                    {todo.createdAt.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              <div className="action-btns">
                {editingId === todo.id ? (
                  <>
                    <button
                      className="save-btn"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleEditSave(todo.id)}
                    >
                      Save
                    </button>
                    <button
                      className="cancel-btn"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditStart(todo.id, todo.text)}
                      aria-label={`Edit "${todo.text}"`}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(todo.id)}
                      aria-label={`Delete "${todo.text}"`}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
