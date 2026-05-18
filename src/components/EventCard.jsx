import { useEffect, useState } from 'react'
import moment from 'moment'
import 'moment/locale/pt-br'
import LiveEmbed from './LiveEmbed'

moment.locale('pt-br')

function EventCard({ event, onClose, refreshData }) {
  const [isLive, setIsLive] = useState(event.is_live)

  useEffect(() => {
    setIsLive(event.is_live)
  }, [event.is_live])

  const formatTime = (dateStr) => {
    return moment(dateStr).format('DD/MM/YYYY [às] HH:mm')
  }

  const handleLiveClick = () => {
    if (event.live_url) {
      window.open(event.live_url, '_blank')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="event-detail">
          <h2>{event.title.replace(/[🌴🦜⚽🎤📊🎬📺]\s*/, '')}</h2>
          
          <div className="event-meta">
            <div className="meta-item">
              <span style={{ fontSize: '1.3rem' }}>{event.channel?.emoji}</span>
              <span>{event.channel?.name}</span>
            </div>
            
            <div className="meta-item">
              <span>📅</span>
              <span>{formatTime(event.start_time)}</span>
            </div>
            
            {event.event_types && event.event_types.icon && (
              <div className="meta-item">
                <span>{event.event_types.icon}</span>
                <span>{event.event_types.name}</span>
              </div>
            )}
            
            {isLive && (
              <div className="live-indicator">
                <span>🔴</span>
                <span AO VIVO</span>
              </div>
            )}
          </div>

          {event.description && (
            <div className="event-description">
              <h3>Descrição:</h3>
              <p>{event.description}</p>
            </div>
          )}

          {event.live_url && (
            <div>
              <a 
                href={event.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="live-button"
                onClick={(e) => {
                  e.preventDefault()
                  handleLiveClick()
                }}
              >
                <span>▶️</span>
                <span>{isLive ? 'ASSISTIR AO VIVO' : 'VER LIVE (quando disponível)'}</span>
              </a>
            </div>
          )}

          {event.embed_url && isLive && (
            <div className="embed-container">
              <LiveEmbed embedUrl={event.embed_url} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventCard