'use client'

import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import { supabase } from '@/lib/supabase'

type Live = {
  id: number
  nome: string
  local: string
  data: string
  link: string
  canal: string
}

export default function Home() {
  const [lives, setLives] = useState<Live[]>([])

  useEffect(() => {
    buscarLives()
  }, [])

  async function buscarLives() {
    const { data } = await supabase
      .from('lives')
      .select('*')

    setLives(data || [])
  }

  function emojiCanal(canal: string) {
    if (canal === 'TV Mandacaru') return '🌵'
    return '🦜'
  }

  return (
    <main className="min-h-screen p-8 bg-zinc-950 text-white">
      <h1 className="text-4xl font-bold mb-8">
        Agenda de Lives
      </h1>

      <div className="bg-white text-black rounded-2xl p-4 w-fit">
        <Calendar />
      </div>

      <div className="mt-10 space-y-4">
        {lives.map((live) => (
          <div
            key={live.id}
            className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"
          >
            <h2 className="text-2xl font-bold">
              {emojiCanal(live.canal)} {live.nome}
            </h2>

            <p>{live.local}</p>

            <p>
              {new Date(live.data).toLocaleString('pt-BR')}
            </p>

            <a
              href={live.link}
              target="_blank"
              className="text-green-400"
            >
              Assistir Live
            </a>
          </div>
        ))}
      </div>
    </main>
  )
}