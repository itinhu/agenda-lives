import { useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/pt-br'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import EventCard from './EventCard'

moment.locale('pt-br')
const localizer = momentLocalizer(moment)

function Calendar({ events, channels, refreshData }) {
  const [selectedEvent, setSelectedEvent] = useState(null)

  const eventsWithColors = events.map(event => {
    const channel = channels.find(c => c.id === event.channel_id)
    const eventType = event.event_types || {}
    
    return {
      ...event,
      title: `${channel?.emoji || '📺'} ${event.title}`,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      backgroundColor: eventType.color || '#667eea',
      channel: channel,
      eventType: eventType
    }
  })

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.backgroundColor,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600'
      }
    }
  }

  const components = {
    event: (props) => (
      <div 
        {...props}
        onClick={() => setSelectedEvent(props.event)}
        style={{
          ...props.style,
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '8px'
        }}
      >
        {props.children}
      </div>
    )
  }

  const messages = {
    next: 'Próximo',
    previous: 'Anterior',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda'
  }

  return (
    <>
      <BigCalendar
        localizer={localizer}
        events={eventsWithColors}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        eventStyleGetter={eventStyleGetter}
        components={components}
        messages={messages}
        selectable
        onSelectEvent={setSelectedEvent}
        culture='pt-BR'
      />

      {selectedEvent && (
        <EventCard 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          refreshData={refreshData}
        />
      )}
    </>
  )
}

export default Calendar