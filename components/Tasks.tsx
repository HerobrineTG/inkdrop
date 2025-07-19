import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoomTasks, updateRoomTasks } from '@/lib/actions/room.actions';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';

export type TaskPriority = 'low' | 'medium' | 'high';
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assignee: string;
  completed: boolean;
}

const priorities: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'low', color: 'bg-green-600' },
  medium: { label: 'medium', color: 'bg-yellow-500' },
  high: { label: 'high', color: 'bg-red-600' },
};

export function TaskCard({ task, onComplete, onDelete }: {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={cn(
      'rounded-xl border-2 p-5 mb-6 flex flex-col gap-3 relative shadow-lg',
      task.completed ? 'border-green-500 bg-gradient-to-r from-green-900/40 to-green-800/20' : 'border-purple-500 bg-gradient-to-r from-purple-900/40 to-purple-800/20'
    )}>
      <div className="flex items-center gap-3">
        <Button
          variant={task.completed ? 'default' : 'outline'}
          className={cn('rounded-full w-7 h-7 flex items-center justify-center p-0 shadow', task.completed ? 'bg-green-500' : 'bg-zinc-900')}
          onClick={() => onComplete(task.id)}
        >
          {task.completed ? <span className="text-white text-xl">✓</span> : <span className="text-zinc-400 text-lg">○</span>}
        </Button>
        <span className={cn('font-bold text-lg text-white', task.completed && 'line-through text-green-400')}>{task.title}</span>
        <span className={cn('ml-2 px-2 py-1 rounded-full bg-purple-700/80 text-yellow-200 text-xs font-semibold shadow')}>{priorities[task.priority].label}</span>
        <Button variant="ghost" className="ml-auto text-zinc-400 hover:text-red-400 p-0 text-xl" onClick={() => onDelete(task.id)}>×</Button>
      </div>
      <div className={cn('text-zinc-300 text-base', task.completed && 'line-through text-green-300')}>{task.description}</div>
      <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2">
        <span className="flex items-center gap-1"><span className="text-purple-400">📅</span> {task.dueDate}</span>
        <span className="flex items-center gap-1"><span className="text-purple-400">👤</span> {task.assignee}</span>
      </div>
    </div>
  );
}

function AddTaskModal({ onAdd, onClose, isOpen }: {
  onAdd: (task: Omit<Task, 'id' | 'completed'>) => void;
  onClose: () => void;
  isOpen: boolean;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');

  return (
    <AnimatePresence>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="p-[0.2px] rounded-xl bg-gradient-to-r from-[#a259ec] to-[#f24e1e] backdrop-blur-md
                  ring-0 focus:outline-none focus:ring-0 border-none shadow "
          style={{ maxWidth: '400px', margin: '0 auto', boxShadow: '0 3px 12px rgba(162, 89, 236, 0.3)', }}
        >
          <div className="bg-slate-950 rounded-lg p-4">
            <DialogTitle className="flex justify-between items-center mb-4 text-semibold">
              Add new Task
            </DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <input className="rounded bg-zinc-800 p-2 text-white" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} />
              <textarea className="rounded bg-zinc-800 p-2 text-white resize-none" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
              <div className="flex gap-2">
                <select className="rounded bg-zinc-800 p-2 text-white" value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input className="rounded bg-zinc-800 p-2 text-white" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <input className="rounded bg-zinc-800 p-2 text-white" placeholder="Assigned To" value={assignee} onChange={e => setAssignee(e.target.value)} />
            </DialogDescription>
            <div className="flex gap-2 mt-4">
              <Button className="gradient-blue flex-1 h-full gap-1 px-5" variant="purpleBorder" onClick={() => {
                if (title) {
                  onAdd({ title, description, priority, dueDate, assignee });
                  onClose();
                }
              }}>Add Task</Button>
              <Button className="gradient-blue flex-1 h-full gap-1 px-5" variant="purpleBorder" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}

export default function Tasks({ roomId }: { roomId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      const backendTasks = await getRoomTasks(roomId);
      let parsedTasks: Task[] = [];
      if (Array.isArray(backendTasks)) {
        parsedTasks = backendTasks.map((str: string) => {
          try {
            return JSON.parse(str);
          } catch {
            return null;
          }
        }).filter(Boolean);
      } else if (typeof backendTasks === 'string') {
        try {
          parsedTasks = [JSON.parse(backendTasks)];
        } catch {
          parsedTasks = [];
        }
      }
      setTasks(parsedTasks);
      setLoading(false);
    }
    fetchTasks();
  }, [roomId]);

  const syncTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    await updateRoomTasks(roomId, newTasks.map(task => JSON.stringify(task)));
  };

  const handleAddTask = async (task: Omit<Task, 'id' | 'completed'>) => {
    const newTasks = [
      ...tasks,
      { ...task, id: Math.random().toString(36).slice(2), completed: false }
    ];
    await syncTasks(newTasks);
  };

  const handleComplete = async (id: string) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    await syncTasks(newTasks);
  };

  const handleDelete = async (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    await syncTasks(newTasks);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="bg-gradient-to-r from-purple-800 via-purple-950/50 to-transparent rounded-xl shadow-lg p-4 mb-4 w-60 mx-auto">
            <h2 className="text-4xl font-semibold text-white text-center tracking-wide font-poppins">
              Tasks
            </h2>
          </div>
          <p className="text-zinc-400 text-base mt-1">{tasks.filter(t => !t.completed).length} pending tasks</p>
        </div>
        <Button className="gradient-blue flex h-full gap-1 px-6 py-2 rounded-xl shadow" variant="purpleBorder" onClick={() => setShowModal(true)}>＋ Add</Button>
      </div>
      {loading ? (
        <div className="text-zinc-500 text-center mt-10 text-lg">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-zinc-500 text-center mt-10 text-lg">No tasks</div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onComplete={handleComplete} onDelete={handleDelete} />
          ))}
        </div>
      )}
      {showModal && <AddTaskModal onAdd={handleAddTask} onClose={() => setShowModal(false)} isOpen={showModal} />}
    </div>
  );
}