'use client';
import { Calendar as RBCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

type Event = { title: string; start: Date | string; end: Date | string };

const locales = { 'en-US': enUS } as any;
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarView({ events }: { events: Event[] }) {
  const normalized = events.map((e) => ({
    ...e,
    start: typeof e.start === 'string' ? new Date(e.start) : e.start,
    end: typeof e.end === 'string' ? new Date(e.end) : e.end,
  }));

  return (
    <div style={{ height: 600 }}>
      <RBCalendar
        localizer={localizer}
        events={normalized}
        startAccessor="start"
        endAccessor="end"
      />
    </div>
  );
}


