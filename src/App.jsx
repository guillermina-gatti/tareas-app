import { useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { LogOut } from 'lucide-react'
import { supabase } from '@/supabaseClient'
import { Button } from '@/components/ui/button'
import Auth from './Auth'
import Tareas from './Tareas'

function Fondo({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-violet-100 via-white to-sky-100">
        <div className="blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-violet-400/40 blur-3xl" />
        <div className="blob pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-sky-300/50 blur-3xl [animation-delay:-7s]" />
        <main className="relative mx-auto max-w-xl px-4 py-12">{children}</main>
      </div>
    </MotionConfig>
  )
}

function App() {
  const [sesion, setSesion] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))

    const { data } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  if (!sesion) {
    return (
      <Fondo>
        <Auth />
      </Fondo>
    )
  }

  return (
    <Fondo>
      <div className="mb-6 flex items-center justify-between rounded-full border border-white/60 bg-white/60 py-2 pl-5 pr-2 shadow-sm backdrop-blur-xl">
        <p className="truncate text-sm text-slate-600">{sesion.user.email}</p>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={() => supabase.auth.signOut()}
        >
          <LogOut /> Salir
        </Button>
      </div>
      <Tareas />
    </Fondo>
  )
}

export default App