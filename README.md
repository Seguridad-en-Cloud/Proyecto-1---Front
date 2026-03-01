# LiveMenu — Frontend

Frontend del sistema **LiveMenu**: gestor de menús digitales para restaurantes. Aplicación SPA construida con React, TypeScript, Vite y shadcn/ui.

## Stack tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 18.3 | UI Library |
| TypeScript | 5.8 | Tipado estático |
| Vite | 5.4 | Build tool / dev server |
| Tailwind CSS | 3.4 | Estilos utility-first |
| shadcn/ui | — | Componentes UI (Radix + Tailwind) |
| React Router | 6.30 | Enrutamiento SPA |
| TanStack React Query | 5 | Manejo de estado asíncrono |
| Axios | 1.13 | Cliente HTTP |
| Recharts | 2.15 | Gráficos de analytics |
| qrcode.react | 4.2 | Generación de QR en el navegador |
| Sonner | 1.7 | Notificaciones toast |
| Zod | 3.25 | Validación de esquemas |

## Estructura del proyecto

```
src/
├── api/              # Clientes HTTP (axios) por recurso
│   ├── auth.ts       # Login, registro, refresh, logout
│   ├── categories.ts # CRUD categorías
│   ├── items.ts      # CRUD platos (dishes)
│   ├── restaurants.ts# CRUD restaurante
│   ├── analytics.ts  # Dashboard y export CSV
│   ├── upload.ts     # Subida/eliminación de imágenes
│   ├── client.ts     # Instancia axios + interceptores JWT
│   └── types.ts      # Tipos compartidos de API
├── components/
│   ├── auth/         # ProtectedRoute, guards
│   ├── layout/       # AdminLayout, PublicLayout, Sidebar
│   ├── ui/           # Componentes shadcn/ui
│   ├── ImageUploader.tsx
│   └── NavLink.tsx
├── contexts/
│   └── AuthContext.tsx  # Contexto global de autenticación
├── hooks/
│   ├── use-mobile.tsx   # Detección responsive
│   └── use-toast.ts     # Hook para toasts
├── lib/
│   ├── constants.ts  # API_BASE_URL, TOKEN_KEYS
│   └── utils.ts      # Utilidades (cn, etc.)
├── pages/
│   ├── Login.tsx        # Inicio de sesión
│   ├── Register.tsx     # Registro de cuenta
│   ├── Dashboard.tsx    # Panel principal (restaurante)
│   ├── MenuEditor.tsx   # Editor de categorías y platos
│   ├── MenuPublic.tsx   # Menú público (sin auth)
│   ├── QRPage.tsx       # Generación y descarga de QR
│   ├── Analytics.tsx    # Dashboard de analytics
│   ├── Settings.tsx     # Configuración del restaurante
│   ├── Index.tsx        # Landing page
│   └── NotFound.tsx     # 404
├── test/             # Tests unitarios (vitest)
├── App.tsx           # Rutas y providers
└── main.tsx          # Entry point
```

## Requisitos previos

- **Node.js** ≥ 20
- **npm** ≥ 9

## Variables de entorno

Crear un archivo `.env` (o `.env.local`) en la raíz del frontend:

```env
VITE_API_BASE_URL=https://localhost/api/v1
```

> Si no se define, el valor por defecto es `https://localhost/api/v1`.

## Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (puerto 8080)
npm run dev

# Compilar para producción
npm run build

# Preview del build de producción
npm run preview
```

## Tests

```bash
# Ejecutar tests una vez
npm test

# Ejecutar tests en modo watch
npm run test:watch
```

## Lint

```bash
npm run lint
```

## Docker

El frontend se empaqueta como una imagen multi-stage con Node 20 (build) + Nginx Alpine (servir):

```bash
docker build -t livemenu-frontend .
docker run -p 80:80 livemenu-frontend
```

En producción se ejecuta junto al backend mediante `docker-compose.yml` del repositorio backend.

## Rutas principales

| Ruta | Componente | Auth | Descripción |
|---|---|---|---|
| `/` | Index | No | Landing page |
| `/login` | Login | No | Inicio de sesión |
| `/register` | Register | No | Registro |
| `/menu/:slug` | MenuPublic | No | Menú público del restaurante |
| `/dashboard` | Dashboard | Sí | Panel principal |
| `/menu` | MenuEditor | Sí | Editor de categorías y platos |
| `/qr` | QRPage | Sí | Generador de código QR |
| `/analytics` | Analytics | Sí | Dashboard de métricas |
| `/settings` | Settings | Sí | Configuración del restaurante |

## Autenticación

- JWT almacenado en `localStorage` (`livemenu_access_token` / `livemenu_refresh_token`).
- Interceptor Axios que adjunta el token `Authorization: Bearer <token>` en cada request.
- Refresh automático del token cuando expira (401) — excepto en rutas de auth.
- `ProtectedRoute` redirige a `/login` si no hay sesión activa.

## Menú público

Accesible sin autenticación en `/menu/:slug`. Optimizado para móvil con:

- Header con logo y nombre del restaurante.
- Navegación por categorías (pills que filtran).
- Lista de platos con imagen, precio, etiquetas y disponibilidad.
- Botón "Todas" para mostrar todas las categorías.

## Código QR

- Preview en tiempo real con personalización de color de primer plano y fondo.
- Tamaños: S (200px), M (400px), L (800px), XL (1200px).
- Descarga en formato **PNG** y **SVG**.

## Analytics

- Total de escaneos y gráfico de tendencia temporal.
- Distribución por hora del día.
- Top navegadores / user agents.
- Filtro por rango de fechas y granularidad (día/semana/mes).
- Export a CSV.
