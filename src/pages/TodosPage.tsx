import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { TodoCard } from '../components/TodoCard';
import { Fab } from '../components/Fab';
import { AddTodoSheet } from '../components/AddTodoSheet';
import { daysUntil } from '../lib/dates';

export function TodosPage() {
  const { todos } = useData();
  const [addOpen, setAddOpen] = useState(false);

  const { active, done } = useMemo(() => {
    const active = todos.todos
      .filter((t) => !t.completed)
      .sort((a, b) => {
        const da = a.due_date ? daysUntil(a.due_date) : Infinity;
        const db = b.due_date ? daysUntil(b.due_date) : Infinity;
        return da - db;
      });
    const done = todos.todos.filter((t) => t.completed);
    return { active, done };
  }, [todos.todos]);

  return (
    <>
      {todos.todos.length === 0 ? (
        <div className="empty">
          <p>no to-dos yet — add whatever's on your mind</p>
        </div>
      ) : (
        <div className="cards">
          {active.map((t) => (
            <TodoCard key={t.id} todo={t} onToggle={() => todos.toggleTodo(t.id, true)} onRemove={() => todos.removeTodo(t.id)} />
          ))}
          {active.length === 0 && (
            <div className="empty">
              <p>all caught up</p>
            </div>
          )}
          {done.map((t) => (
            <TodoCard key={t.id} todo={t} onToggle={() => todos.toggleTodo(t.id, false)} onRemove={() => todos.removeTodo(t.id)} />
          ))}
        </div>
      )}

      <Fab label="add to-do" onClick={() => setAddOpen(true)} />
      <AddTodoSheet open={addOpen} onClose={() => setAddOpen(false)} onAdd={todos.addTodo} />
    </>
  );
}
