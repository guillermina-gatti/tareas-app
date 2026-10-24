import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Tareas() {
    const [tareas, setTareas] = useState([])
    const [titulo, setTitulo] = useState('')
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(true)
    const [filtro, setFiltro] = useState('todas')

    async function cargar() {
        const { data, error } = await supabase
            .from('tareas')
            .select('*')
            .order('created_at', { ascending: false })
        if (error) setError(error.message)
        else setTareas(data)
        setCargando(false)
    }

    useEffect(() => {
        cargar()
    }, [])

    async function agregar(e) {
        e.preventDefault()
        if (!titulo.trim()) return
        const { error } = await supabase.from('tareas').insert({ titulo })
        if (error) return setError(error.message)
        setTitulo('')
        cargar()
    }

    async function alternar(tarea) {
        const { error } = await supabase
            .from('tareas')
            .update({ completada: !tarea.completada })
            .eq('id', tarea.id)
        if (error) return setError(error.message)
        cargar()
    }

    async function borrar(id) {
        const { error } = await supabase.from('tareas').delete().eq('id', id)
        if (error) return setError(error.message)
        cargar()
    }

    const visibles = tareas.filter((t) => {
        if (filtro === 'pendientes') return !t.completada
        if (filtro === 'completadas') return t.completada
        return true
    })
    const pendientes = tareas.filter((t) => !t.completada).length

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <Card className="rounded-3xl border-white/60 bg-white/70 shadow-xl shadow-violet-200/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="bg-linear-to-r from-violet-600 to-sky-500 bg-clip-text text-3xl font-bold text-transparent">
                        Mis tareas
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                        {pendientes} pendientes de {tareas.length}
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    <form onSubmit={agregar} className="flex gap-2">
                        <Input
                            placeholder="¿Qué tenés que hacer?"
                            className="h-11 rounded-full px-5"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                        />
                        <Button
                            type="submit"
                            className="h-11 rounded-full bg-linear-to-r from-violet-500 to-sky-400 px-5 transition-transform hover:scale-105 active:scale-95"
                        >
                            <Plus /> Agregar
                        </Button>
                    </form>

                    <Tabs value={filtro} onValueChange={setFiltro}>
                        <TabsList className="w-full rounded-full">
                            <TabsTrigger value="todas" className="rounded-full">Todas</TabsTrigger>
                            <TabsTrigger value="pendientes" className="rounded-full">Pendientes</TabsTrigger>
                            <TabsTrigger value="completadas" className="rounded-full">Completadas</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {error && <p className="text-sm text-red-600">Error: {error}</p>}
                    {cargando && <p className="animate-pulse text-sm text-slate-500">Cargando...</p>}
                    {!cargando && visibles.length === 0 && (
                        <p className="py-6 text-center text-sm text-slate-500">
                            No hay tareas para mostrar.
                        </p>
                    )}

                    <ul className="space-y-2">
                        <AnimatePresence initial={false}>
                            {visibles.map((t) => (
                                <motion.li
                                    key={t.id}
                                    layout
                                    initial={{ opacity: 0, y: -12, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 40, scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white/80 px-4 py-3 shadow-sm"
                                >
                                    <Checkbox
                                        checked={t.completada}
                                        onCheckedChange={() => alternar(t)}
                                    />
                                    <span
                                        className={`flex-1 transition-colors ${t.completada ? 'text-slate-400 line-through' : 'text-slate-800'
                                            }`}
                                    >
                                        {t.titulo}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full text-slate-400 hover:text-red-500"
                                        aria-label="Borrar tarea"
                                        onClick={() => borrar(t.id)}
                                    >
                                        <Trash2 />
                                    </Button>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                </CardContent>
            </Card>
        </motion.div>
    )
}