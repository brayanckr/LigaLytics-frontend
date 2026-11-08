# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Apostante informado que sigue LaLiga: abre el inicio para ver qué partidos vienen, qué tan fiable es el modelo (accuracy / MAE frente al modelo trivial) y saltar a predecir un partido o a apostar en modo demo. Contexto de uso: móvil y escritorio, sesiones cortas antes de un partido.

## Product Purpose
LigaLytics predice partidos de LaLiga (1X2, goles, córneres, tarjetas) con modelos Poisson y Weka ML, muestra la probabilidad a la vista y audita el modelo con métricas de validación. Incluye apuestas demo con cuotas reales del proveedor y marcadores en vivo.

## Positioning
Predicción con el modelo auditado a la vista: cada probabilidad llega con su métrica de validación y su comparación contra el modelo trivial, algo que un portal de apuestas no muestra.

## Capabilities and Constraints
- Frontend React 18 + Vite + Tailwind 3 (tema `slate`/`sky` redefinido en tailwind.config.js); rutas protegidas por sesión.
- Datos dinámicos del backend: ranking, fixtures, informe del modelo, salud de la API; marcadores en vivo por STOMP.
- Terminología fija: «Poisson & Weka ML Trained», «Predecir un partido», «Apuestas demo», accuracy, MAE, «modelo trivial».
- Idioma de la interfaz: español.

## Brand Commitments
Identidad oscura con acento naranja (#ff5000) y lima para cuotas/valor. Tipografía pedida por el usuario: Inter o Plus Jakarta Sans para la interfaz; JetBrains Mono o Space Grotesk para números, probabilidades y métricas.

## Evidence on Hand
Datos reales vienen del backend (no inventar cifras). Escudos de equipos vía componente Crest.

## Product Principles
1. La fiabilidad del modelo se muestra siempre junto a la predicción.
2. Densidad útil: más información por pantalla sin cajas dentro de cajas.
3. Los números son el protagonista; la decoración nunca compite con ellos.
4. Móvil primero en las acciones (predecir, apostar).

## Accessibility & Inclusion
Contraste suficiente sobre fondo oscuro, objetivos táctiles de 44 px, `prefers-reduced-motion` respetado.
