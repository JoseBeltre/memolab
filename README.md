# MemoLab

Plataforma web de estudio con repetición espaciada (algoritmo SM-2), enfoque Pomodoro y notas.
Proyecto final de Programación III · ITLA.

Aplicación publicada: https://memolab.vercel.app

## Stack

- **Frontend:** Nuxt 4 (Vue 3) con TypeScript
- **Estado global:** Pinia
- **Estilos:** Tailwind CSS y Nuxt UI
- **Backend:** Supabase (PostgreSQL, Auth y API REST) con Row Level Security
- **Pruebas:** Jest (unitarias) y Selenium (extremo a extremo)
- **CI/CD:** GitHub Actions y Vercel

## Puesta en marcha

```bash
pnpm install
```

Copia `.env.example` a `.env` y completa las variables de Supabase (Settings > API).
El esquema de la base de datos está en `docs/base-de-datos/esquema.sql`: se ejecuta una sola vez
en el SQL Editor del proyecto de Supabase y crea las tablas con sus políticas de seguridad.

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo en http://localhost:3000 |
| `pnpm build` | Build de producción |
| `pnpm preview` | Previsualizar el build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Verificación de tipos de la aplicación |
| `pnpm typecheck:tests` | Verificación de tipos de las pruebas |
| `pnpm test` | Pruebas unitarias (Jest) |
| `pnpm test:coverage` | Pruebas unitarias con reporte de cobertura |
| `pnpm test:integracion` | Pruebas de integración de las políticas de seguridad |
| `pnpm test:e2e` | Construye la aplicación y corre la suite de Selenium |

Las pruebas de extremo a extremo levantan el build en el puerto 3100 y controlan Chrome con
Selenium. Cada prueba crea su propio usuario con un correo generado al momento.

## Release 1

| Épica | Historias | Estado |
| --- | --- | --- |
| E1 Cuentas y acceso | HU-01 registro, HU-02 inicio y cierre de sesión | Terminada |
| E2 Gestión de mazos | HU-03 creación, HU-04 administración | Terminada |
| E3 Gestión de tarjetas | HU-05 creación, HU-06 administración | Terminada |
| E4 Motor de repaso | HU-07 sesión diaria, HU-08 calificación con SM-2 | Terminada |
| E5 Enfoque Pomodoro | HU-09 temporizador, HU-10 indicador global, HU-11 duraciones | Terminada |
| E6 Notas de estudio | HU-12 gestión de notas | Terminada |

## Estructura

```
app/
  components/   componentes propios
  layouts/      plantillas de la aplicación y de las pantallas de acceso
  middleware/   protección de las rutas internas
  pages/        pantallas (enrutamiento por archivos)
  stores/       estado global con Pinia
  types/        tipos de las tablas de Supabase
  utils/        validaciones, fechas y el algoritmo SM-2
docs/
  base-de-datos/  esquema SQL con las políticas de seguridad
  evidencias/     bitácora de los 17 casos de prueba, capturas y auditoría de Lighthouse
tests/
  unit/         pruebas unitarias con Jest
  integracion/  pruebas de las políticas de seguridad contra Supabase
  e2e/          pruebas de extremo a extremo con Selenium (Page Object Model)
```
