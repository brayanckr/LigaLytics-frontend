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
- Frontend React 18 + Vite + Tailwind 3 (tema `slate`/`sky`/`lime`/`rose` redefinido en tailwind.config.js con la paleta del logo); rutas protegidas por sesión.
- Datos dinámicos del backend: ranking, fixtures, informe del modelo, salud de la API; marcadores en vivo por STOMP.
- Terminología fija: «Poisson & Weka ML Trained», «Predecir un partido», «Apuestas demo», accuracy, MAE, «modelo trivial».
- Idioma de la interfaz: español.

## Brand Commitments
Identidad deportiva oscura extraída del logo de LaLiga Lytics: tinta navy (#06121c fondo, #0b1c2c superficie), cian/azul primario (#12c0ee, hasta #0868d8) para acciones, verde menta (#2bf29a) para cuotas, valor y estados positivos, y rojo del emblema (#ea1a2f) para errores y derrotas; púrpura (#8b2a6b) solo como tercer color de gráficos. Botones primarios cian con texto oscuro (#031018). El degradado de marca (cian → menta) solo se usa en texto de titulares y en el wordmark "LYTICS", nunca en botones ni fondos de tarjeta. Esquinas casi rectas (controles 4px, tarjetas 6px) y superficies planas con filo de 1px.
Tipografía: Barlow Condensed cursiva 800 en MAYÚSCULAS para titulares de página; Inter para interfaz, navegación y etiquetas (mayúsculas con tracking); JetBrains Mono para números, probabilidades y métricas (accuracy / MAE). No usar escudos ni marcas oficiales de LaLiga.

## Evidence on Hand
Datos reales vienen del backend (no inventar cifras). Escudos de equipos vía componente Crest.

## Product Principles
1. La fiabilidad del modelo se muestra siempre junto a la predicción.
2. Densidad útil: más información por pantalla sin cajas dentro de cajas.
3. Los números son el protagonista; la decoración nunca compite con ellos.
4. Móvil primero en las acciones (predecir, apostar).

## Accessibility & Inclusion
Contraste suficiente sobre fondo oscuro, objetivos táctiles de 44 px, `prefers-reduced-motion` respetado.
