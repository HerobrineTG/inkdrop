import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { getRoomTasks } from '@/lib/actions/room.actions';
import { Task, TaskCard } from './Tasks';

export default function Calendar({ roomId }: { roomId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      const backendTasks = await getRoomTasks(roomId);
      let parsedTasks: Task[] = [];

      if (Array.isArray(backendTasks)) {
        parsedTasks = backendTasks
          .map((str: string) => {
            try {
              return JSON.parse(str);
            } catch {
              return null;
            }
          })
          .filter(Boolean) as Task[];
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

  const calendarEvents = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.dueDate,
    backgroundColor: task.completed ? '#22c55e' : '#a259ec',
    borderColor: task.completed ? '#22c55e' : '#a259ec',
    extendedProps: { ...task },
  }));

  const tasksForDate = selectedDate
    ? tasks.filter(t => t.dueDate === selectedDate)
    : [];

  return (
    <div className="w-full calendar-wrapper">
      <div className="bg-gradient-to-b from-purple-800 to-transparent rounded-md shadow-lg p-4 mb-4">
        <h2 className="text-4xl font-semibold text-white text-center tracking-wide font-poppins">
          Calendar
        </h2>
      </div>
      <div className="rounded-xl overflow-hidden shadow-lg bg-zinc-900 border border-purple-800 p-2">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          dateClick={(info: DateClickArg) => setSelectedDate(info.dateStr)}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
          dayMaxEvents={2}
        />
      </div>

      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-white mb-2">
            Tasks for {selectedDate}
          </h3>
          {tasksForDate.length === 0 ? (
            <div className="text-zinc-500">No tasks/events for this date.</div>
          ) : (
            tasksForDate.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={() => {}}
                onDelete={() => {}}
              />
            ))
          )}
        </div>
      )}

      {/* Scoped FullCalendar styling */}
      <style>{`
        .calendar-wrapper .fc {
          font-family: 'Poppins', sans-serif !important;
          border: none !important;
        }

        .calendar-wrapper .fc-toolbar {
          background: linear-gradient(90deg, #6b21a8, #2e1065);
          border-radius: 0.75rem;
          margin-bottom: 0.5rem;
          padding: 0.5rem 1rem;
        }

        .calendar-wrapper .fc-button {
          background: #a259ec;
          color: #fff;
          border-radius: 0.5rem;
          border: none;
          font-weight: 600;
          margin: 0 0.15rem;
          box-shadow: 0 2px 8px rgba(162, 89, 236, 0.15);
          transition: background 0.2s;
        }

        .calendar-wrapper .fc-button:hover {
          background: #7c3aed;
        }

        .fc-theme-standard td,
        .fc-theme-standard th,
        .fc .fc-scrollgrid,
        .fc .fc-scrollgrid-section,
        .fc .fc-scrollgrid-sync-table,
        .fc .fc-col-header,
        .fc .fc-daygrid-body,
        .fc .fc-daygrid-day-frame,
        .fc .fc-daygrid-day-top,
        .fc .fc-daygrid-day,
        .fc .fc-daygrid-event {
          border: none !important;
          box-shadow: none !important;
        }

        .fc .fc-col-header-cell,
        .fc-scrollgrid-section-header {
          background: #18181b !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          z-index: 10;
        }

        .fc .fc-col-header-cell-cushion {
          color: #a259ec !important;
          font-family: 'Poppins', sans-serif !important;
          font-weight: 600 !important;
          font-size: 1em;
          background: transparent !important;
          border: none !important;
          display: inline-block !important;
          text-align: center;
          padding: 0.25rem;
        }

        /* KILL notch ghosts and shadows */
        .fc .fc-col-header-cell svg,
        .fc .fc-col-header-cell::before,
        .fc .fc-col-header-cell::after,
        .fc .fc-col-header-cell *::before,
        .fc .fc-col-header-cell *::after,
        .fc-scrollgrid-section-header svg,
        .fc-scrollgrid-section-header::before,
        .fc-scrollgrid-section-header::after,
        .fc-scrollgrid-section-header *::before,
        .fc-scrollgrid-section-header *::after {
          display: none !important;
          content: none !important;
          background: none !important;
          border: none !important;
          box-shadow: none !important;
          clip-path: none !important;
          mask: none !important;
        }

        .calendar-wrapper .fc-daygrid-day {
          background: #18181b;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }

        .calendar-wrapper .fc-daygrid-day:hover {
          background: #a259ec22;
        }

        .calendar-wrapper .fc-daygrid-day-number {
          color: #a259ec;
          font-weight: 700;
        }

        .calendar-wrapper .fc-daygrid-event {
          background: linear-gradient(90deg, #a259ec 0%, #7c3aed 100%);
          color: #fff;
          border-radius: 0.5rem;
          border: none;
          font-size: 0.9em;
          font-weight: 600;
          padding: 2px 6px;
          margin-bottom: 2px;
          box-shadow: 0 2px 6px rgba(162, 89, 236, 0.25);
        }

        .calendar-wrapper .fc-day-today {
          background: #a259ec !important;
          color: #fff !important;
          border-radius: 0.5rem;
          box-shadow: 0 0 0 2px #7c3aed;
        }

        .fc .fc-daygrid-day-top {
          position: relative;
          z-index: 1;
          overflow: hidden;
        }

        .fc .fc-daygrid-day-top::after,
        .fc .fc-day-today .fc-daygrid-day-top::after {
          display: none !important;
          content: none !important;
        }

        .fc .fc-daygrid-day-frame {
          margin: 0 !important;
          padding: 0.25rem !important;
          background: #18181b;
        }

        .fc .fc-scrollgrid-sync-table {
          border-collapse: collapse !important;
        }

        .fc .fc-more-link {
          display: none !important;
      }
        `}
      </style>
    </div>
  );
}
