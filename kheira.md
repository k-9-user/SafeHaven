# Guide Technique SafeHaven — kheira.md
**Dernière mise à jour : 11 juin 2026**

---

## 1. Vue d'ensemble du projet

SafeHaven Money (SHM) est une application d'éducation financière + DeFi sur Solana.

| Composant | Dossier | Port | Techno |
|-----------|---------|------|--------|
| Backend API | `agent/` | 3001 | Node.js + Express + TypeScript |
| Frontend web | `projet/` | 5173 | React 18 + Vite 6 + Tailwind |
| App mobile | `app/` | — | React Native Expo |
| Smart contracts | `contracts/` | — | Solana Anchor |

---

## 2. Architecture générale

```
Navigateur (projet/ port 5173)
  │
  │ fetch /api/* (proxy Vite → :3001)
  ▼
Express API (agent/ port 3001)
  ├── /api/auth         ← register, login, me, forgot-password, reset-password
  ├── /api/chat         ← Claude streaming SSE
  ├── /api/yields       ← APY DeFi temps réel
  ├── /api/strategies   ← Recommandations DeFi
  ├── /api/risk-profile ← Profil risque utilisateur
  └── /api/voice        ← TTS ElevenLabs
  │
  ├── agent/data/users.json          ← Comptes utilisateurs
  └── agent/data/reset-tokens.json   ← Tokens réinit. mot de passe (1h TTL)
```

---

## 3. Authentification — flux complet

### Inscription (`/register`)
1. Frontend envoie `POST /api/auth/register { email, password, name }`
2. Backend : validation Zod → `bcrypt.hash(password, 12)` → `createUser()` → `signToken()`
3. Backend envoie email de bienvenue (non bloquant, console en dev)
4. Réponse : `{ token, user: { id, email, name } }`
5. Frontend : stocke token dans `localStorage['safehaven_token']`
6. Affiche banner vert "Compte créé !" pendant 2s → redirect `/dashboard`

### Connexion (`/login`)
1. `POST /api/auth/login { email, password }` → `bcrypt.compare()` → `signToken()`
2. Réponse identique. Même stockage. Redirect `/dashboard`.

### Vérification au chargement
- `AuthContext` lit localStorage → `GET /api/auth/me` avec `Bearer <token>`
- Succès → user chargé, accès au dashboard
- Échec → token supprimé, redirect `/login`

### Mot de passe oublié
1. `/forgot-password` → `POST /api/auth/forgot-password { email }`
2. Backend : réponse identique qu'il existe ou non (anti-énumération)
3. Si user existe : `createResetToken()` → email avec lien `APP_URL/reset-password?token=<hex64>`
4. Token : 32 octets random, TTL 1h, un seul actif par user

### Réinitialisation
1. `/reset-password?token=...` → `POST /api/auth/reset-password { token, password }`
2. Backend : `verifyResetToken()` → `bcrypt.hash()` → `updatePassword()` → `consumeResetToken()`
3. Frontend : banner succès → redirect `/login` après 3s

---

## 4. Structure des fichiers backend (`agent/src/`)

| Fichier | Rôle |
|---------|------|
| `index.ts` | Serveur Express (Helmet, CORS, rate-limit, body-limit 512kb) |
| `auth/users.ts` | CRUD utilisateurs en JSON + `updatePassword()` |
| `auth/middleware.ts` | `requireAuth` (Bearer JWT), `signToken()` |
| `auth/mailer.ts` | Envoi emails welcome + reset (dev: console, prod: SMTP) |
| `auth/resetTokens.ts` | Génération/vérification/consommation tokens reset |
| `routes/auth.ts` | Toutes les routes auth (5 endpoints) |
| `routes/chat.ts` | Chat IA streaming SSE |
| `routes/yields.ts` | APY DeFi |
| `routes/strategies.ts` | Recommandations DeFi |
| `routes/risk.ts` | Profil risque |
| `routes/voice.ts` | TTS ElevenLabs |
| `llm/claude.ts` | Client Anthropic (stream + one-shot) |
| `llm/memory.ts` | Résumé conversation (contexte long) |
| `safety/guardrails.ts` | Filtres IA (levier, PII, arnaque…) |
| `strategies/library.ts` | Catalogue Kamino, MarginFi |
| `risk/profiler.ts` | Machine à états score 1-5 |

---

## 4b. Routes admin backend

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | /api/admin/users | Admin | Liste tous les comptes (sans passwordHash) |
| PATCH | /api/admin/users/:id | Admin | Modifier isActive ou role |
| DELETE | /api/admin/users/:id | Admin | Supprimer un compte |
| GET | /api/admin/stats | Admin | total, actifs, 7j, admins, derniers inscrits |

Un admin ne peut pas se modifier/supprimer lui-même depuis le panel.

---

## 5. Structure des fichiers frontend (`projet/src/`)

| Fichier | Route | Accès |
|---------|-------|-------|
| `pages/LoginPage.jsx` | `/login` | Public seulement |
| `pages/RegisterPage.jsx` | `/register` | Public seulement |
| `pages/ForgotPasswordPage.jsx` | `/forgot-password` | Public |
| `pages/ResetPasswordPage.jsx` | `/reset-password?token=` | Public |
| `pages/dashboard/DashboardLayout.jsx` | `/dashboard/*` | Connecté |
| `pages/dashboard/Overview.jsx` | `/dashboard` | Connecté |
| `pages/dashboard/Education.jsx` | `/dashboard/education` | Connecté |
| `pages/dashboard/Platform.jsx` | `/dashboard/platform` | Connecté |
| `pages/dashboard/AIChat.jsx` | `/dashboard/chat` | Connecté |
| `pages/dashboard/Settings.jsx` | `/dashboard/settings` | Connecté |
| `pages/admin/AdminLogin.jsx` | `/admin/login` | Public |
| `pages/admin/AdminPage.jsx` | `/admin` | Token admin requis |
| `lib/AuthContext.jsx` | — | `useAuth()` hook global |
| `lib/api.js` | — | fetch wrapper + `get/post/patch/del()` + `api.auth.*` |
| `App.jsx` | — | Routeur + ProtectedRoute / PublicOnlyRoute / AdminRoute |

---

## 6. Email (nodemailer)

**Mode développement** (SMTP_HOST vide dans `.env`) :
- Les emails sont affichés dans la console du backend
- Format : `📧 [Mailer DEV] À: ... Sujet: ...`
- Aucun email n'est envoyé réellement

**Mode production** : remplir dans `agent/.env` :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=vous@gmail.com
SMTP_PASS=votre-app-password
SMTP_FROM=SafeHaven <vous@gmail.com>
APP_URL=https://votre-domaine.com
```

---

## 7. Sécurité

| Mécanisme | Détail |
|-----------|--------|
| Helmet | CSP, X-Frame-Options, HSTS, X-Content-Type |
| CORS | Whitelist CORS_ORIGINS dans .env |
| Rate limit | 60 req/min global, 20 req/min /api/chat |
| bcrypt | 12 rounds (hash irréversible) |
| JWT | 7 jours, signé avec JWT_SECRET |
| Zod | Validation stricte tous les body |
| Body limit | 512kb (protection bombes JSON) |
| Guardrails IA | 6 catégories filtrées + PII |
| Anti-énumération | /forgot-password réponse identique |
| Tokens reset | 32 octets random, TTL 1h, usage unique |
| Non-custodial | Jamais de clés privées côté serveur |

---

## 7b. Accès Administrateur

L'admin est **complètement séparé** du système de comptes utilisateurs. Pas de rôle dans les comptes.

**Identifiants admin (uniques, fixes)** — définis dans `agent/.env` :
```
ADMIN_USERNAME=Kheira_Mialy
ADMIN_PASSWORD=KMSHM2k26
```

**Flux d'accès :**
1. Aller sur `http://localhost:5173/admin` → redirigé vers `/admin/login`
2. Saisir `Kheira_Mialy` + `KMSHM2k26`
3. Backend vérifie et retourne un `adminToken` (JWT 12h avec `isAdmin: true`)
4. Token stocké dans `localStorage['safehaven_admin_token']`
5. Accès au panel admin

**Ce que peut faire l'admin :**
- Voir tous les comptes inscrits (email, nom, date, statut)
- Désactiver / réactiver un compte (`isActive`) — l'utilisateur désactivé reçoit une erreur 403
- Supprimer définitivement un compte
- Voir les statistiques (total, actifs, désactivés, 7j, derniers inscrits)

**Sécurité :** Impossible de créer un 2e admin depuis l'interface. Le seul admin est `Kheira_Mialy`.

---

## 8. Variables d'environnement (`agent/.env`)

```env
# OBLIGATOIRE
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=phrase-aleatoire-longue-minimum-32-chars

# Serveur
AGENT_PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173

# Admin (identifiants fixes — accès sur /admin/login)
ADMIN_USERNAME=Kheira_Mialy
ADMIN_PASSWORD=KMSHM2k26

# Email (laisser vide = mode dev, console uniquement)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=SafeHaven <noreply@safehaven.app>
APP_URL=http://localhost:5173

# Optionnel
ELEVENLABS_VOICE_ID_FR=TX3LPaxmHKxFdv7VOQHJ
LIFI_API_KEY=replace_with_lifi_key
```

---

## 9. Démarrage

### Méthode recommandée — une seule commande depuis la racine

```bash
cd ~/Documents/SafeHaven\ Money/SHM
npm run dev
```

Les deux serveurs démarrent en même temps :
- `[BACKEND]` (cyan) → `http://localhost:3001`
- `[FRONTEND]` (magenta) → `http://localhost:5173`

Pour tout arrêter : `Ctrl+C`

### Autres commandes disponibles à la racine

```bash
npm run build        # Build backend + frontend en une fois
npm run install:all  # Réinstaller les dépendances des deux projets
```

### Méthode alternative — deux terminaux séparés

Si la commande unique ne fonctionne pas, tu peux aussi ouvrir deux terminaux :

```bash
# Terminal 1 — Backend
cd ~/Documents/SafeHaven\ Money/SHM/agent
npm run dev

# Terminal 2 — Frontend
cd ~/Documents/SafeHaven\ Money/SHM/projet
npm run dev
```

### Vérifications

```bash
# Vérifier que le backend répond
curl http://localhost:3001/health

# Tester l'inscription (optionnel)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"motdepasse123","name":"Test"}'
```

### Accès admin

Une fois le projet démarré, aller sur `http://localhost:5173/admin` et saisir :
- Identifiant : `Kheira_Mialy`
- Mot de passe : `KMSHM2k26`

---

## 10. Ce qui reste à faire

- [ ] Protéger /api/chat et autres routes avec `requireAuth`
- [ ] Modifier le profil utilisateur (nom, mot de passe) depuis Settings
- [ ] Base de données réelle (SQLite ou PostgreSQL) pour remplacer les .json
- [ ] Analytics (nb sessions IA, temps passé, progression cours)
- [ ] Internationalisation i18n (FR/EN)
- [ ] Tests automatisés (Vitest + Testing Library)
- [ ] Déploiement Railway (backend) + Vercel (frontend)

---

## 11. Conventions de code

- **Frontend** : JSX (pas TSX), Tailwind + shadcn/ui, React Router v6
- **Backend** : TypeScript strict, Zod pour la validation, async/await
- **Composants** : dans `projet/src/components/ui/` (shadcn/ui)
- **Alias** : `@/` = `projet/src/` (vite.config.js)
- **Token JWT** : clé localStorage = `safehaven_token`
- Pas de commentaires inutiles, noms de variables explicites
