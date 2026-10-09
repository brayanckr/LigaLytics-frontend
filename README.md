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
