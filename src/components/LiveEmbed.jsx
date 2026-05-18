import { useState, useEffect } from 'react'

function LiveEmbed({ embedUrl }) {
  const [error, setError] = useState(null)

  useEffect(() => {
    setError(null)
  }, [embedUrl])

  if (!embedUrl) {
    return <div>Nenhum embed disponível</div>
  }

  // Extrair video ID do YouTube
  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url
  }

  const iframeSrc = embedUrl.includes('youtube') ? getYouTubeEmbedUrl(embedUrl) : embedUrl

  return (
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
      <iframe
        src={iframeSrc}
        title="Live Stream"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={() => setError('Erro ao carregar embed da live')}
      />
      {error && <div style={{ color: 'red', padding: '20px' }}>{error}</div>}
    </div>
  )
}

export default LiveEmbed