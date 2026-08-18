import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { bookingService } from '../services/bookingService';
import { toast } from 'react-hot-toast';
import { Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

const BookingCalendar = ({ engineerId, onSelectSlot, className = '' }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (engineerId) {
      loadAvailability();
    }
  }, [engineerId, selectedDate]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const slots = await bookingService.checkAvailability(engineerId, selectedDate.toISOString().split('T')[0]);
      setAvailability(slots.filter(slot => slot.available));
    } catch (error) {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (info) => {
    setSelectedDate(new Date(info.dateStr));
  };

  const handleSlotSelect = (info) => {
    const slot = availability.find(s => s.startAt.toISOString() === info.startStr && s.available);
    if (slot) {
      onSelectSlot(slot);
    }
  };

  return (
    <div className={cn("bg-white rounded-4xl shadow-xl border border-slate-200 p-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <CalendarIcon className="w-6 h-6 text-gold" />
        <h3 className="text-xl font-bold text-navy">Availability Calendar</h3>
        {loading && <div className="ml-auto w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />}
      </div>

      <div className="h-[400px]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          selectable={true}
          selectMirror={true}
          weekends={true}
          slotMinTime="09:00:00"
          slotMaxTime="18:00:00"
          events={availability.map(slot => ({
            title: slot.available ? 'Available' : 'Booked',
            start: slot.startAt,
            end: slot.endAt,
            backgroundColor: slot.available ? '#10b981' : '#ef4444',
            borderColor: slot.available ? '#059669' : '#dc2626',
            editable: false,
            display: 'background'
          }))}
          dateClick={handleDateClick}
          select={handleSlotSelect}
          height="100%"
          dayMaxEvents={true}
          slotEventOverlap={false}
        />
      </div>

      {!availability.length && !loading && (
        <div className="mt-4 p-6 bg-amber-50 border-2 border-amber-200 rounded-3xl text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-amber-800 font-medium">No availability for this week. Try different dates or engineers.</p>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
