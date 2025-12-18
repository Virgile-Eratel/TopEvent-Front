# TopEvent — Front
Application React de gestion d’événements : consultation, inscription utilisateur, et administration (création/gestion) pour les comptes `Organisateur`.


## Technologies

- React avec TypeScript
- [Shadcn](https://ui.shadcn.com/)
- [Tailwind](https://tailwindcss.com/)
- [Zod](https://zod.dev/)
- [Tanstack React query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React router](https://reactrouter.com/)
- [Vitest](https://vitest.dev/)
- Docker

## Démarrer
### En local 
- **Installer** : `yarn`
- **Dev** : `yarn dev` → `http://localhost:5173`
- **Build** : `yarn build` (output `dist/`)
- **Preview** : `yarn preview`
- **Tests** : `yarn test` / **coverage** : `yarn test:coverage`
### Avec docker
- **Lancer** : `docker compose up --build -d`
- **Arrêter** : `docker compose down`

## Configuration (API)

- **Base URL** : `VITE_API_URL`
  - valeur par défaut : `http://localhost:3000`
  - en Docker dev : injecté dans `docker-compose.yml`

## Architecture rapide

- **Entrée** : `src/main.tsx` → `src/app/App.tsx`
- **Providers** : `src/app/providers.tsx`
  - React Query (`QueryClientProvider`)
  - Auth (`AuthProvider`)
  - Toasts (`react-hot-toast`)
- **Routing** : `src/app/router.tsx` (React Router)
- **UI** : `src/shared/components/ui/*` (Shadcn)
- **Alias import** : `@` pointe vers `src/` (voir `vite.config.ts`)

## Routes

- **Public**
  - `/auth` : login / register
  - `/home` : home (affiche aussi un bloc “inscriptions” si connecté)
  - `/events` : liste + filtres
  - `/events/:eventId` : détail événement
- **User connecté**
  - `/subscriptions` : mes inscriptions
- **Admin (protégé)**
  - `/admin/events` : liste admin
  - `/admin/events/create` : création
  - `/admin/events/:eventId` : détail admin + liste des inscrits

## Auth / rôles

- **Stockage** : token + user en `localStorage` (clés `topevent:*`).
- **Guard admin** : `ProtectedAdminRoute` bloque `/admin/*` si non connecté ou si `user.role !== "admin"`.
- **HTTP 401** : le client HTTP supprime le token et redirige vers `/auth`.

## Appels API (principaux)

Les appels passent par `src/shared/lib/http.ts` (headers JSON + `Authorization: Bearer <token>`).
- **Auth** : `POST /user/create`, `POST /user/login`
- **Événements** : `GET /events/top`, `GET /events/all`, `GET /event/:id`, `GET /admins/events/all`
- **Admin events** : `POST /admin/event`, `PUT /admin/event/:id`, `DELETE /admin/event/:id`
- **Inscriptions** : `POST /user/subscription`, `GET /user/subscriptions`, `GET /user/subscription/:eventId`, `DELETE /user/subscription/:subscriptionId`, `GET /admin/event/:eventId/subscriptions`

## Docker

- **Dev** : `docker-compose.yml` (hot reload sur `5173`, avec `VITE_API_URL`).
- **Prod** : build Vite puis Nginx (`Dockerfile` + `nginx.conf`). Exemple d’exécution : `docker-compose.prod.yml` (expose `80` via `3002`).

