# EVAQ

Inspection dashboard for metal sleeves, metal bellows, and metal grommets / bushes.

This repository is the **website only**. It does not control motors, pneumatics, or other hardware.

Product types:

- Metal Sleeve
- Metal Bellows
- Metal Grommet / Bush

## 1. Project overview

Operators use the dashboard to watch the live camera, current product, dimensional measurements, visual/AI results, PASS/DEFECT decision, machine state, statistics, and inspection history.

## 2. Architecture

```
                 EXISTING SYSTEM
                       │
          ┌────────────┴────────────┐
          │                         │
      ESP32-CAM                Inspection backend
          │                         │
      Camera feed              REST / WebSocket
          │                         │
          └────────────┬────────────┘
                       │
                 PRIVATE LAN
                       │
                       ▼
                NEXT.JS DASHBOARD
                       │
                       ▼
                  OPERATOR
```

Camera path (default): `ESP32-CAM → HTTP MJPEG → <img> in the browser`.

Alternate path: `ESP32-CAM → backend JPEG → GET /camera/latest → dashboard poll`.

Inspection data path: `backend REST + WebSocket → adapters → Zustand → UI`.

## 3. Technology stack

Next.js (App Router) · TypeScript · React · Tailwind CSS v4 · shadcn/ui (base-nova / official CSS variables) · Lucide · Recharts · Zustand · next-themes

## 4. Installation

```bash
npm install
```

## 5. Development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/dashboard`.

```bash
npm run build
npm start
```

## 6. Environment variables

See `.env.example`. Copy to `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CAMERA_STREAM_URL` | Browser-reachable camera stream |
| `NEXT_PUBLIC_API_BASE_URL` | Inspection REST origin |
| `NEXT_PUBLIC_WS_URL` | Inspection WebSocket |
| `NEXT_PUBLIC_DEMO_MODE` | `true` (default) or `false` for live-only |
| `NEXT_PUBLIC_CAMERA_MODE` | `MJPEG_STREAM` \| `LATEST_FRAME` \| `OFFLINE` |
| `NEXT_PUBLIC_USE_CAMERA_PROXY` | Optional Next.js stream proxy |
| `NEXT_PUBLIC_DEBUG` | Debug strip in development |

These values are public to the browser. Do not put secrets in `NEXT_PUBLIC_*`.

Settings in the UI persist in localStorage and override env for the current PC.

## 7. Camera integration

Set the stream in **Settings → Camera** or `NEXT_PUBLIC_CAMERA_STREAM_URL`.

MJPEG is rendered with a native `<img>` (no JS decode). If `LATEST_FRAME` is selected, the UI polls `GET {API}/camera/latest`.

If the stream is down, the panel shows **CAMERA OFFLINE** and Retry. It does not show a fake part image.

## 8. Backend integration

REST helpers live in `src/services/api.ts`. Path names live in `src/config/backend.ts` so they can be changed in one place when the real contract is known.

Expected JSON shapes are in `src/types/inspection.ts`. Responses are sanitized in `src/lib/validate.ts`; malformed payloads do not crash the layout.

## 9. Demo mode

Default is demo until `NEXT_PUBLIC_DEMO_MODE=false`.

Demo controls: Start Demo, Stop Demo, Next Inspection, Simulate PASS, Simulate DEFECT.

All simulated rows are marked **DEMO**. Live mode never generates random measurements.

## 10. WebSocket integration

Implemented in `src/services/realtime.ts`.

Events handled: `machine_state`, `inspection_result`, `cycle_completed`, `alarm`, `heartbeat`. Also accepted (and logged): `inspection_started`, `image_captured`, `measurement_result`, `visual_result`.

Reconnect uses exponential backoff. Header shows CONNECTED / CONNECTING / RECONNECTING / DISCONNECTED.

## 11. Troubleshooting

- **Camera offline**: PC and browser must reach the ESP32 on the LAN. Confirm the URL in another tab.
- **CORS**: some cameras omit CORS headers. Enable **Use local camera proxy** or serve the stream from the inspection backend.
- **Mixed content**: an HTTPS dashboard cannot load an `http://192.168.x.x` camera. Serve the dashboard over HTTP on the LAN, or terminate TLS in a way that also proxies the camera.
- **Backend offline**: set API URL, confirm the PC can `curl` it, then disable demo mode.
- **No inspection**: Live mode shows WAITING FOR INSPECTION until a result arrives.

## 12. LAN networking notes

`192.168.x.x` is a private address. localhost is **not** the ESP32. The operator PC must be on the same network (or routed) to the camera and backend. The browser, not just the Next.js server, must reach the camera URL unless the proxy is enabled.

---

Hardware control is intentionally omitted. Command APIs can be added later behind an explicit backend, not as fake HMI buttons.
