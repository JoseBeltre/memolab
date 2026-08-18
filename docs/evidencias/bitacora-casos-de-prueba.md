# Bitácora de ejecución de los casos de prueba

Release 1 de MemoLab. Los diecisiete casos del apartado 3.6.2 del documento, con el resultado de la
última ejecución y dónde quedó la evidencia.

- Ambiente: aplicación construida con `pnpm build` y servida en `http://localhost:3100`, sobre el
  proyecto de Supabase del curso. Navegador Chrome controlado con Selenium WebDriver.
- Ejecutado por: Maxwell Aybar (manuales) y Aaron Montero (automatizadas).
- Fecha de ejecución: 17 de agosto de 2026.

## Resumen

| Total | Aprobados | Fallidos | Bloqueados | No ejecutados |
| --- | --- | --- | --- | --- |
| 17 | 17 | 0 | 0 | 0 |

Se cumplen los criterios de salida del apartado 3.3.1: se ejecutó el 100 % de los casos de prioridad
alta, el 100 % de los ejecutados quedó en estado «Aprobado», no quedan defectos abiertos y el flujo
de integración continua termina en verde.

## Detalle

| Código | HU | Título | Tipo | Cómo se ejecutó | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- |
| CP-001 | HU-01 | Registro correcto de un usuario nuevo | Funcional | Selenium · `tests/e2e/registro.e2e.test.ts` | Aprobado | `HU-01/CP-001-registro-exitoso.png` |
| CP-002 | HU-01 | Registro rechazado por correo mal escrito | Funcional | Selenium · `tests/e2e/registro.e2e.test.ts` | Aprobado | `HU-01/CP-002-correo-invalido.png` |
| CP-003 | HU-02 | Inicio de sesión rechazado por contraseña incorrecta | Funcional | Selenium · `tests/e2e/login.e2e.test.ts` | Aprobado | `HU-02/CP-003-contrasena-incorrecta.png` |
| CP-004 | HU-02 | Bloqueo de pantallas internas sin sesión | Seguridad | Selenium · `tests/e2e/mazos.e2e.test.ts` | Aprobado | `HU-02/CP-004-ruta-protegida.png` |
| CP-005 | HU-03 | Mazo rechazado por no tener nombre | Funcional | Selenium · `tests/e2e/mazos.e2e.test.ts` | Aprobado | `HU-03/CP-005-mazo-sin-nombre.png` |
| CP-006 | HU-04 | Eliminación de un mazo con confirmación | Funcional | Selenium · `tests/e2e/mazos.e2e.test.ts` | Aprobado | `HU-04/CP-006-mazo-eliminado.png` |
| CP-007 | HU-05 | Tarjeta nueva queda lista para repaso | Funcional | Selenium · `tests/e2e/tarjetas.e2e.test.ts` | Aprobado | `HU-05/CP-007-tarjeta-lista-para-repaso.png` |
| CP-008 | HU-07 | Sesión de repaso sin tarjetas vencidas | Funcional | Selenium · `tests/e2e/repaso.e2e.test.ts` | Aprobado | `HU-07/CP-008-sin-tarjetas-vencidas.png` |
| CP-009 | HU-08 | Intervalo de seis días en la segunda calificación correcta | Funcional | Jest · `tests/unit/sm2.test.ts` | Aprobado | Reporte de Jest en GitHub Actions |
| CP-010 | HU-08 | Reinicio del intervalo al calificar con «Otra vez» | Funcional | Jest · `tests/unit/sm2.test.ts` y Selenium · `tests/e2e/repaso.e2e.test.ts` | Aprobado | `HU-08/CP-010-otra-vez.png` |
| CP-011 | HU-10 | El temporizador sigue corriendo al cambiar de sección | Funcional | Selenium · `tests/e2e/pomodoro.e2e.test.ts` | Aprobado | `HU-10/CP-011-indicador-flotante.png` |
| CP-012 | HU-11 | Duración de enfoque rechazada por estar fuera de rango | Funcional | Selenium · `tests/e2e/pomodoro.e2e.test.ts` | Aprobado | `HU-11/CP-012-duracion-invalida.png` |
| CP-013 | HU-12 | Búsqueda de notas sin importar mayúsculas | Funcional | Jest · `tests/unit/notas.test.ts` y Selenium · `tests/e2e/notas.e2e.test.ts` | Aprobado | `HU-12/CP-013-busqueda-de-notas.png` |
| CP-014 | RNF-04 | Un usuario no puede ver los datos de otro | Seguridad | Jest · `tests/integracion/seguridad.test.ts` | Aprobado | Reporte de Jest en GitHub Actions |
| CP-015 | RNF-01 | Tiempo de carga de la pantalla principal | Rendimiento | Google Lighthouse sobre `https://memolab.vercel.app` | Aprobado | `rendimiento/lighthouse-portada.report.html` |
| CP-016 | HU-06 | Edición y eliminación de una tarjeta | Funcional | Selenium · `tests/e2e/tarjetas.e2e.test.ts` | Aprobado | `HU-06/CP-016-tarjeta-editada-y-eliminada.png` |
| CP-017 | HU-09 | Inicio, pausa y reinicio del temporizador | Funcional | Selenium · `tests/e2e/pomodoro.e2e.test.ts` | Aprobado | `HU-09/CP-017-iniciar-pausar-reiniciar.png` |

## Notas de la ejecución

- **CP-004.** Se borran las cookies del navegador y se escribe la dirección `/mazos` directamente: el
  middleware de rutas protegidas manda a `/login`. El mismo comportamiento se verificó sobre la
  aplicación publicada en Vercel.
- **CP-009 y CP-010.** El cálculo del algoritmo SM-2 se prueba en el nivel unitario porque es una
  función pura; la prueba de extremo a extremo comprueba además que la tarjeta calificada con
  «Otra vez» vuelva a aparecer en la misma sesión.
- **CP-014.** La prueba crea dos usuarios reales, el usuario A guarda un mazo y el usuario B intenta
  leerlo, editarlo, eliminarlo y crear registros a nombre de A. Las cuatro operaciones son rechazadas
  por las políticas de Row Level Security.
- **CP-015.** Auditoría de Lighthouse sobre la aplicación publicada: Largest Contentful Paint de
  1.3 segundos, muy por debajo de los 3 segundos que pide RNF-01. De paso quedan cubiertos el puntaje
  de rendimiento (98) y el de accesibilidad (96), este último por encima de los 90 puntos que pide
  RNF-08. El reporte y su resumen están en `rendimiento/`.

## Defectos encontrados y corregidos durante el Sprint

| Caso | Problema | Corrección |
| --- | --- | --- |
| CP-001 | El registro creaba la cuenta pero no abría la sesión, así que el usuario se quedaba en la pantalla de registro sin ningún mensaje. | Se desactivó la confirmación por correo en Supabase y se agregó el mensaje de error para el caso en que no se devuelva una sesión. |
| CP-005 | Al crear un mazo la aplicación respondía con un error 403 de la base de datos. | El identificador del usuario se estaba tomando de `user.id`, pero el módulo de Supabase entrega los datos del token, donde el identificador viene en `sub`. |
| CP-016 | Al refrescar la lista después de guardar o eliminar, las tarjetas desaparecían un momento. | La pantalla solo muestra el esqueleto de carga la primera vez; en las recargas siguientes mantiene la lista visible. |
