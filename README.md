# LigaLytics — Frontend

Interfaz web de LigaLytics: predicciones de LaLiga (resultado, goles, córneres y tarjetas), calendario con resultados
en vivo, clasificación, buscador de equipos con autocompletado y panel de administración.
React 18 · Vite · TypeScript · Tailwind CSS. El backend está en
[LigaLytics-backend](https://github.com/brayanckr/LigaLytics-backend).

## Puesta en marcha
```powershell
npm install
npm run dev        # http://localhost:5173 (proxy de /api hacia http://localhost:8080)
npm run build      # comprobación de tipos + build de producción
```
La URL de la API se configura con `VITE_API_BASE_URL` (ver `.env.example`; por defecto `http://localhost:8080/api`).

## Pantallas
| Ruta | Contenido |
|---|---|
| `/` | Estado del backend, líderes de la tabla y calidad del modelo de IA |
| `/teams` | Buscador con autocompletado, perfil de equipo con forma e historial |
| `/calendar` | Partidos por fecha y marcadores en vivo (se actualizan cada 30 s) |
| `/predict` | Predicción de un partido con probabilidades, marcador probable, córneres y tarjetas |
| `/ranking` | Clasificación por temporada |
| `/admin` | Carga de datos, subida de CSV, reentrenamiento y métricas |

## Despliegue
`vercel.json` incluye la redirección a `index.html` para el enrutado de la SPA. En Vercel define
`VITE_API_BASE_URL=https://<tu-backend>.up.railway.app/api`. GitHub Actions (`.github/workflows/ci.yml`) compila en
cada push y despliega a Vercel si están configurados los secretos `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`.

**Sesión.** El backend guarda la sesión en una cookie `HttpOnly`. Como Vercel y Railway son sitios distintos, en Railway
hay que definir `COOKIE_SAME_SITE=None` y poner en `CORS_ALLOWED_ORIGINS` la URL exacta de este frontend (ver el README
del backend); si no, el login parece funcionar pero la app dice «Tu sesión expiró» en la pantalla siguiente. Tras entrar,
la app comprueba que la sesión se guardó y, si no, lo avisa en el propio formulario de acceso.

*Alternativa sin cookies de terceros (recomendada):* que el navegador llame a `/api` en el dominio de Vercel y que Vercel
lo reenvíe a Railway. Así la cookie es del propio dominio, funciona también en Safari y en navegación privada, y en
Railway basta con `CORS_ALLOWED_ORIGINS` (ya no hace falta `COOKIE_SAME_SITE=None`). Pasos:
1. `vercel.json` ya reenvía `/api/:path*` a `https://ligalytics-api-production.up.railway.app/api/:path*`, antes de la
   regla de `index.html`.
2. `.env.production` (versionado, solo URLs públicas) fija `VITE_API_BASE_URL=/api` y `VITE_LIVE_BASE_URL` con la URL
   directa de Railway (Vercel no reenvía WebSockets: el canal en vivo, que no usa cookies, va directo al backend).
   **Borra de Vercel (Settings → Environment Variables) cualquier `VITE_API_BASE_URL` antiguo con la URL completa de
   Railway**: las variables de Vercel tienen prioridad sobre `.env.production` y devolverían la app a las cookies de terceros.
3. En Railway, `CORS_ALLOWED_ORIGINS` debe incluir la URL exacta del frontend (Vercel reenvía la cabecera `Origin`).
4. Redespliega el frontend **y el backend**: si Railway ejecuta una versión anterior a las cookies (comprobable porque
   `POST /api/webhooks/matches` da 404), el login no se mantiene sea cual sea la configuración.
