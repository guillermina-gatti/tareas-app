# Tareas App

![CI y publicación](https://github.com/guillermina-gatti/tareas-app/actions/workflows/deploy.yml/badge.svg)

App de tareas con login, hecha con React, Vite, Supabase (PostgreSQL), Tailwind CSS y shadcn/ui. Cada usuario ve y modifica únicamente sus propias tareas, gracias a las políticas de seguridad por fila (RLS) de la base de datos.

**Demo:** https://guillermina-gatti.github.io/tareas-app/

## Qué hace

- Registro e inicio de sesión con email y contraseña.
- Crear, completar (tildar) y borrar tareas.
- Filtrar la lista por todas, pendientes o completadas.
- Contador de tareas pendientes.
- Cada usuario accede solo a sus datos: la separación la hace la base de datos, no el código de React.
- Interfaz con animaciones (entrada, salida y reacomodo de la lista) que respeta la opción de "reducir movimiento" del sistema.

## Tecnologías

| Tecnología | Para qué se usa |
| --- | --- |
| [React](https://react.dev) | Interfaz de usuario |
| [Vite](https://vite.dev) | Servidor de desarrollo y compilación |
| [Supabase](https://supabase.com) | Base de datos PostgreSQL, autenticación y API |
| [Tailwind CSS](https://tailwindcss.com) v4 | Estilos con clases utilitarias |
| [shadcn/ui](https://ui.shadcn.com) (Radix UI) | Componentes: botón, input, tarjeta, checkbox y tabs |
| [Motion](https://motion.dev) | Animaciones |
| [Lucide](https://lucide.dev) | Íconos |
| [Oxlint](https://oxc.rs) | Revisión del código (lint) |
| GitHub Actions y GitHub Pages | Integración continua y publicación |

## Estructura del proyecto

```
tareas-app/
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI (lint y build) y publicación en GitHub Pages
├── src/
│   ├── components/
│   │   └── ui/               # Componentes de shadcn/ui (button, card, checkbox, input, tabs)
│   ├── lib/
│   │   └── utils.js          # Función cn para combinar clases de Tailwind
│   ├── App.jsx               # Fondo animado, control de sesión y barra superior
│   ├── Auth.jsx              # Formulario de registro e inicio de sesión
│   ├── Tareas.jsx            # Lista de tareas: leer, crear, completar, borrar y filtrar
│   ├── supabaseClient.js     # Conexión única a Supabase
│   ├── index.css             # Tailwind, tema (colores y redondeo) y animación del fondo
│   └── main.jsx              # Punto de entrada de React
├── .env                      # Variables de entorno (no se sube a GitHub)
├── .gitignore
├── components.json           # Configuración de shadcn/ui
├── index.html
├── jsconfig.json             # Alias @/ para las importaciones
├── package.json
└── vite.config.js            # Plugins de React y Tailwind, alias @ y base de la publicación
```

## Cómo funciona

1. `main.jsx` carga `App.jsx`, que consulta si hay una sesión iniciada.
2. Sin sesión, muestra `Auth.jsx`. Con sesión, muestra `Tareas.jsx`.
3. Todos los componentes usan el cliente de `supabaseClient.js` para hablar con Supabase.
4. Cuando se pide una operación sobre la tabla `tareas`, PostgreSQL revisa las políticas de RLS y solo deja pasar las filas cuyo `user_id` coincide con el usuario logueado.
5. La columna `user_id` se completa sola con `auth.uid()`, por lo que el código nunca la envía.

## Cómo correrlo en tu computadora

### Requisitos

- Node.js 22 o superior.
- Una cuenta y un proyecto en [Supabase](https://supabase.com).

### 1. Clonar e instalar

```bash
git clone https://github.com/guillermina-gatti/tareas-app.git
cd tareas-app
npm install
```

### 2. Crear la base de datos

En Supabase, abrí **SQL Editor → New query**, pegá y ejecutá este código. Si aparece el aviso "Potential issue detected", elegí **Run and enable RLS**.

```sql
create table tareas (
  id bigint generated always as identity primary key,
  titulo text not null,
  completada boolean not null default false,
  user_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

alter table tareas enable row level security;

create policy "ver mis tareas"
on tareas for select
to authenticated
using (auth.uid() = user_id);

create policy "crear mis tareas"
on tareas for insert
to authenticated
with check (auth.uid() = user_id);

create policy "editar mis tareas"
on tareas for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "borrar mis tareas"
on tareas for delete
to authenticated
using (auth.uid() = user_id);
```

### 3. Variables de entorno

Creá un archivo `.env` en la raíz del proyecto, con los datos que figuran en Supabase (botón **Connect** o **Project Settings → API Keys**):

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE
```

Usá solo la clave **publishable**. La clave `secret` se saltea RLS y nunca debe ir en este proyecto ni subirse a GitHub.

### 4. Iniciar la app

```bash
npm run dev
```

Abrí http://localhost:5173/. Si cambiás el `.env`, reiniciá el servidor (`Ctrl + C` y `npm run dev`).

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la app en la carpeta `dist` |
| `npm run preview` | Sirve localmente la versión compilada |
| `npm run lint` | Revisa el código con Oxlint |

## Publicación

La app se publica en GitHub Pages con GitHub Actions (`.github/workflows/deploy.yml`):

- En cada push a `main` y en cada Pull Request, el workflow instala dependencias, ejecuta el lint y compila.
- En un push a `main`, si todo salió bien, publica el resultado.
- Las variables de entorno se cargan como *secrets* del repositorio: `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
- En **Settings → Pages**, la fuente (Source) debe estar en **GitHub Actions**.
- En Supabase, **Authentication → URL Configuration** debe incluir la dirección publicada, para que los links de confirmación de email funcionen.

## Seguridad

- El archivo `.env` está en el `.gitignore` y no se sube al repositorio.
- La clave publishable queda incluida en el código que descarga el navegador. Es una clave pensada para eso, y la protección real de los datos la dan las políticas de RLS.
- Antes de abrir la app a otras personas, conviene tener activada la confirmación de email en Supabase.

---

Proyecto de Guillermina Gatti.