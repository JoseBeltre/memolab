# MemoLab

Plataforma web de estudio con repetición espaciada (algoritmo SM-2), enfoque Pomodoro y notas.
Proyecto final de Programación III · ITLA.

## Stack

- **Frontend:** Nuxt 4 (Vue 3) con TypeScript
- **Estado global:** Pinia
- **Estilos:** Tailwind CSS y Nuxt UI
- **Backend:** Supabase (PostgreSQL, Auth y API REST) con Row Level Security
- **Pruebas:** Jest (unitarias) y Selenium (extremo a extremo)
- **CI/CD:** GitHub Actions y Vercel

## Setup

```bash
pnpm install
```

Copia `.env.example` a `.env` y completa las variables de Supabase (Settings > API).

> Nota: el build requiere que las variables existan. Puedes usar valores de marcador
> (por ejemplo `https://placeholder.supabase.co` y `placeholder`) para que compile sin
> conectarse a un proyecto real; el acceso a datos funcionará cuando pongas las reales.

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo en http://localhost:3000 |
| `pnpm build` | Build de producción |
| `pnpm preview` | Previsualizar el build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Verificación de tipos |
| `pnpm test` | Pruebas unitarias (Jest) |
| `pnpm test:coverage` | Pruebas con reporte de cobertura |

## Roadmap (Release 1)

El proyecto se desarrolla historia de usuario por historia de usuario:

- **E1 Cuentas y acceso:** HU-01 registro, HU-02 inicio/cierre de sesión
- **E2 Gestión de mazos:** HU-03 creación, HU-04 administración
- **E3 Gestión de tarjetas:** HU-05 creación, HU-06 administración
- **E4 Motor de repaso espaciado:** HU-07 sesión diaria, HU-08 calificación con SM-2
- **E5 Enfoque Pomodoro:** HU-09 temporizador, HU-10 indicador global, HU-11 duraciones
- **E6 Notas de estudio:** HU-12 gestión de notas