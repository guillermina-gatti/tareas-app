import { useState } from 'react'
import { motion } from 'motion/react'
import { supabase } from '@/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [cargando, setCargando] = useState(false)

    async function iniciarSesion(e) {
        e.preventDefault()
        setCargando(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setMensaje(error.message)
        setCargando(false)
    }

    async function registrarse() {
        setCargando(true)
        const { error } = await supabase.auth.signUp({ email, password })
        setMensaje(error ? error.message : 'Cuenta creada')
        setCargando(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <Card className="rounded-3xl border-white/60 bg-white/70 shadow-xl shadow-violet-200/50 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <CardTitle className="bg-linear-to-r from-violet-600 to-sky-500 bg-clip-text text-3xl font-bold text-transparent">
                        Mis tareas
                    </CardTitle>
                    <CardDescription>Ingresá para ver tu lista</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={iniciarSesion} className="space-y-3">
                        <Input
                            type="email"
                            placeholder="Email"
                            className="h-11 rounded-full px-5"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="Contraseña (mínimo 6 caracteres)"
                            className="h-11 rounded-full px-5"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            disabled={cargando}
                            className="h-11 w-full rounded-full bg-linear-to-r from-violet-500 to-sky-400 transition-transform hover:scale-[1.02] active:scale-95"
                        >
                            Iniciar sesión
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={cargando}
                            className="h-11 w-full rounded-full"
                            onClick={registrarse}
                        >
                            Crear cuenta
                        </Button>
                        {mensaje && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-sm text-slate-600"
                            >
                                {mensaje}
                            </motion.p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    )
}