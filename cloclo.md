# CLOCLO — Contexte complet du projet SafeHaven
# Fichier à envoyer à Claude en début de conversation pour recharger tout le contexte.
# Dernière mise à jour : 10 juin 2026

---

## QUI EST KHEIRA

Kheira est la développeuse et propriétaire du projet SafeHaven Money (SHM).
Quand elle envoie ce fichier, tu dois immédiatement comprendre l'intégralité du projet
sans avoir besoin de relire les fichiers sources. Tu peux aller directement au travail.

---

## CE QUI A ÉTÉ FAIT (historique complet)

### Session 1 — Refactoring complet du projet

**Demande initiale :** Reprendre tout le projet, supprimer le superflu, créer une architecture
solide, sécuriser le code, créer une interface avec login/mot de passe et dashboard.

**Actions réalisées :**

#### Backend (`agent/`) — Ajout de l'authentification
- Créé `agent/src/auth/users.ts` : stockage des utilisateurs en JSON (`agent/data/users.json`)
- Créé `agent/src/auth/middleware.ts` : vérification JWT sur les routes protégées
- Créé `agent/src/routes/auth.ts` : POST /register, POST /login, GET /me
- Modifié `agent/src/index.ts` : montage de authRouter, CORS élargi pour port 5173
- Modifié `agent/package.json` : ajout de `bcryptjs` + `@types/bcryptjs`
- Installé `bcryptjs` via npm
- Créé `agent/.env` avec toutes les variables nécessaires (ANTHROPIC_API_KEY à remplir)
- **Bug corrigé** : `crypto.randomUUID()` non global Node 18 → `import { randomUUID } from 'node:crypto'`

#### Frontend (`projet/`) — Nettoyage + rebuild complet

**Packages supprimés :** `@base44/sdk`, `@base44/vite-plugin`

**Fichiers créés :**
- `src/lib/api.js` : client HTTP fetch avec JWT automatique + export `post()`
- `src/lib/AuthContext.jsx` : contexte auth JWT (useAuth hook)
- `src/pages/LoginPage.jsx` : formulaire connexion + lien "Mot de passe oublié"
- `src/pages/RegisterPage.jsx` : formulaire inscription + spinner + banner succès
- `src/pages/ForgotPasswordPage.jsx` : demande réinitialisation mot de passe
- `src/pages/ResetPasswordPage.jsx` : nouveau mot de passe via token URL
- `src/pages/dashboard/DashboardLayout.jsx` : sidebar + header mobile
- `src/pages/dashboard/Overview.jsx` : stats, XP, actions rapides
- `src/pages/dashboard/Education.jsx` : re-export EducationalHub
- `src/pages/dashboard/Platform.jsx` : MarketMonitor + LiFiWidget
- `src/pages/dashboard/AIChat.jsx` : chat streaming Claude
- `src/pages/dashboard/Settings.jsx` : profil + déconnexion

**Fichiers modifiés :**
- `src/App.jsx` : routeur propre avec ProtectedRoute / PublicOnlyRoute + routes forgot/reset
- `src/lib/PageNotFound.jsx` : nettoyé (suppression base44)
- `src/pages/EducationalHub.jsx` : bug `setGuardMessage` corrigé
- `vite.config.js` : suppression plugin base44, alias `@/` configuré

**Build vérifié :** `npm run build` → succès, zéro erreur

### Session 3 — Panel Administrateur

**Demande :** Accès admin pour gérer la plateforme (utilisateurs, stats, désactivation, suppression)

**Actions réalisées :**

#### Backend (`agent/`)
- Ajouté `isActive: boolean` dans l'interface `User` (`users.ts`) — pas de rôle côté user
- Ajouté `updateUser()`, `deleteUser()`, `listUsers()` dans `users.ts`
- `requireAuth` vérifie `isActive` → 403 si compte désactivé
- Admin = identifiants fixes dans `.env` : `ADMIN_USERNAME=Kheira_Mialy` + `ADMIN_PASSWORD=KMSHM2k26`
- `signAdminToken()` → JWT avec `{ isAdmin: true }`, durée 12h
- `requireAdmin` vérifie `isAdmin: true` dans le JWT (complètement séparé des comptes utilisateurs)
- Créé `routes/admin.ts` :
  - `POST /api/admin/login` → vérifie identifiants fixes → retourne `adminToken`
  - `GET /api/admin/users` → liste tous les comptes (sans passwordHash)
  - `PATCH /api/admin/users/:id` → modifier `isActive` seulement
  - `DELETE /api/admin/users/:id` → supprimer un compte
  - `GET /api/admin/stats` → total, actifs, inactifs, 7j, 30j, derniers inscrits
- Mis à jour `index.ts` : montage adminRouter + PATCH/DELETE dans CORS
- Mis à jour `agent/.env` : `ADMIN_USERNAME` + `ADMIN_PASSWORD`

#### Frontend (`projet/`)
- Ajouté helpers `get/post/patch/del()` + `adminGet/adminPost/adminPatch/adminDel()` dans `api.js`
  - Les helpers admin utilisent `localStorage['safehaven_admin_token']` (token séparé)
- Créé `pages/admin/AdminLogin.jsx` : formulaire login admin (fond sombre, couronne dorée)
- Créé `pages/admin/AdminPage.jsx` : panel admin complet
  - Onglet **Statistiques** : 4 cards + derniers inscrits
  - Onglet **Utilisateurs** : tableau avec toggle actif/inactif + suppression (pas de promotion admin)
  - Bouton déconnexion admin (supprime `safehaven_admin_token`)
- Mis à jour `App.jsx` :
  - `AdminRoute` vérifie `safehaven_admin_token` → redirige vers `/admin/login` si absent
  - Routes `/admin/login` et `/admin` ajoutées
- `DashboardLayout.jsx` : aucun lien admin dans la sidebar (admin accède à `/admin` directement)

### Session 2 — Email + Mot de passe oublié + UX inscription

**Demande :** Création longue sans feedback + email de confirmation + onglet récupération mot de passe + mise à jour docs

**Actions réalisées :**

#### Backend (`agent/`)
- Installé `nodemailer` + `@types/nodemailer`
- Créé `agent/src/auth/mailer.ts` : envoi email welcome + reset (dev = log console, prod = SMTP)
- Créé `agent/src/auth/resetTokens.ts` : tokens reset 32 octets hex, TTL 1h, stockés dans `agent/data/reset-tokens.json`
- Ajouté `updatePassword(id, hash)` dans `agent/src/auth/users.ts`
- Mis à jour `agent/src/routes/auth.ts` :
  - POST /register → appelle `sendWelcomeEmail` (non bloquant)
  - POST /forgot-password → crée token + envoie `sendResetEmail` (réponse identique user existant ou non)
  - POST /reset-password → vérifie token, change hash, consomme token

#### Frontend (`projet/`)
- `RegisterPage.jsx` : spinner Loader2 pendant création + banner vert succès "Compte créé !" + redirection 2s
- `LoginPage.jsx` : ajout lien "Mot de passe oublié ?" sous le champ mot de passe
- `ForgotPasswordPage.jsx` : page dédiée avec état succès + lien retour connexion
- `ResetPasswordPage.jsx` : lit `?token=` dans URL, change le mot de passe, redirige login 3s
- `App.jsx` : routes `/forgot-password` et `/reset-password` ajoutées (publiques)
- `api.js` : export `post(path, body)` ajouté pour usage direct dans les nouvelles pages

---

## STRUCTURE DU PROJET (état actuel)

```
SHM/
├── agent/                    ← Backend Node.js + TypeScript (port 3001)
│   ├── src/
│   │   ├── index.ts          ← Serveur Express (Helmet, CORS, rate-limit)
│   │   ├── auth/
│   │   │   ├── users.ts      ← Store JSON utilisateurs + updatePassword()
│   │   │   ├── middleware.ts ← Vérification JWT (requireAuth, signToken)
│   │   │   ├── mailer.ts     ← Envoi emails welcome + reset (nodemailer)
│   │   │   └── resetTokens.ts← Tokens réinit. mot de passe (TTL 1h)
│   │   ├── routes/
│   │   │   ├── auth.ts       ← /api/auth : register, login, me, forgot, reset
│   │   │   ├── chat.ts       ← /api/chat : streaming SSE Claude
│   │   │   ├── risk.ts       ← /api/risk-profile
│   │   │   ├── strategies.ts ← /api/strategies
│   │   │   ├── voice.ts      ← /api/voice : ElevenLabs TTS
│   │   │   └── yields.ts     ← /api/yields : APY DeFi
│   │   ├── llm/
│   │   │   ├── claude.ts     ← Client Anthropic (stream + non-stream)
│   │   │   ├── memory.ts     ← Résumé conversation
│   │   │   └── system-prompt.md ← Personnalité Coco l'IA
│   │   ├── risk/
│   │   │   ├── profiler.ts   ← Machine à états profil risque (score 1-5)
│   │   │   └── profile.ts    ← Types RiskProfile
│   │   ├── safety/
│   │   │   └── guardrails.ts ← Filtres anti-levier, anti-arnaque, PII
│   │   └── strategies/
│   │       ├── library.ts    ← Catalogue stratégies DeFi (Kamino, MarginFi)
│   │       ├── conservative.ts ← Règles + APY
│   │       ├── recommend.ts  ← Moteur recommandation
│   │       └── lifi.ts       ← Routes LI.FI
│   ├── data/
│   │   ├── users.json        ← Créé automatiquement au 1er register
│   │   └── reset-tokens.json ← Créé automatiquement à la 1ère demande reset
│   ├── .env                  ← Variables d'env (ANTHROPIC_API_KEY à remplir)
│   └── package.json
│
├── projet/                   ← Frontend React + Vite (port 5173)
│   ├── src/
│   │   ├── App.jsx           ← Routeur + Providers (Auth, QueryClient, Router)
│   │   ├── main.jsx          ← Point d'entrée React
│   │   ├── lib/
│   │   │   ├── AuthContext.jsx   ← useAuth() : user, login, logout, register
│   │   │   ├── api.js            ← fetch wrapper avec JWT auto + export post()
│   │   │   ├── courseProgress.js ← Progression cours (localStorage)
│   │   │   ├── query-client.js   ← React Query config
│   │   │   └── utils.js          ← cn() Tailwind helper
│   │   ├── hooks/
│   │   │   ├── useSolana.js      ← Wallet Phantom connect/sign
│   │   │   └── use-mobile.jsx    ← Breakpoint mobile
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx         ← /login (+ lien mot de passe oublié)
│   │   │   ├── RegisterPage.jsx      ← /register (spinner + banner succès)
│   │   │   ├── ForgotPasswordPage.jsx← /forgot-password
│   │   │   ├── ResetPasswordPage.jsx ← /reset-password?token=...
│   │   │   ├── EducationalHub.jsx    ← Cours + quiz + XP + Market + LiFi
│   │   │   └── dashboard/
│   │   │       ├── DashboardLayout.jsx ← Sidebar slate-900 + outlet
│   │   │       ├── Overview.jsx        ← /dashboard (stats + actions)
│   │   │       ├── Education.jsx       ← /dashboard/education
│   │   │       ├── Platform.jsx        ← /dashboard/platform
│   │   │       ├── AIChat.jsx          ← /dashboard/chat (SSE streaming)
│   │   │       └── Settings.jsx        ← /dashboard/settings
│   │   ├── components/
│   │   │   ├── MarketMonitor.jsx   ← Prix SOL temps réel (CoinGecko)
│   │   │   ├── VoiceFinanceCoach.jsx ← ElevenLabs ConvAI widget
│   │   │   ├── LiFiWalletWidget.jsx  ← Widget échange cross-chain
│   │   │   ├── WalletSelector.jsx    ← Sélecteur portefeuille
│   │   │   └── ui/                   ← 30+ composants shadcn/ui (Radix)
│   │   └── data/
│   │       └── coursesData.js        ← Contenu statique des cours
│   ├── vite.config.js         ← alias @/ → src/, proxy /api → :3001
│   └── package.json
│
├── app/                      ← React Native Expo (mobile, non modifié)
├── contracts/                ← Solana Anchor (smart contracts, non modifié)
├── docs/                     ← ADR, threat model, accessibilité
├── GUIDE_PROJET.md           ← Documentation technique complète
├── kheira.md                 ← Guide complet mis à jour
├── cloclo.md                 ← CE FICHIER (contexte Claude)
└── .env.example              ← Template variables globales
```

---

## STACK TECHNIQUE

| Couche | Techno | Version |
|--------|--------|---------|
| Frontend | React + Vite | React 18, Vite 6 |
| Styles | Tailwind CSS + shadcn/ui | Tailwind 3 |
| Routing | React Router DOM | v6 |
| Cache API | TanStack React Query | v5 |
| Backend | Node.js + Express + TypeScript | Express 4 |
| Auth | bcryptjs (12 rounds) + JWT (7j) | — |
| Email | nodemailer (dev: console, prod: SMTP) | — |
| LLM | Anthropic Claude | claude-sonnet-4-6 |
| Voice | ElevenLabs ConvAI widget | — |
| DeFi | LI.FI Widget + Kamino + MarginFi | Solana mainnet |
| Wallet | Phantom via window.solana | web3.js v1 |

---

## ROUTES BACKEND

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | /api/auth/register | Non | Créer un compte + email welcome |
| POST | /api/auth/login | Non | Connexion → JWT |
| GET | /api/auth/me | Oui | Profil utilisateur |
| POST | /api/auth/forgot-password | Non | Demande réinit. (envoie email) |
| POST | /api/auth/reset-password | Non | Nouveau mdp avec token |
| GET | /api/admin/users | Admin | Liste tous les comptes |
| PATCH | /api/admin/users/:id | Admin | Modifier isActive ou role |
| DELETE | /api/admin/users/:id | Admin | Supprimer un compte |
| GET | /api/admin/stats | Admin | Statistiques globales |
| POST | /api/chat | Non* | Chat IA streaming SSE |
| POST | /api/chat/summarize | Non* | Résumé conversation |
| POST | /api/risk-profile | Non* | Sauvegarder profil risque |
| GET | /api/strategies | Non* | Stratégies disponibles |
| GET | /api/yields | Non* | APY DeFi en temps réel |
| POST | /api/voice/synthesize | Non* | TTS ElevenLabs |
| GET | /health | Non | Statut serveur |

*= pas encore protégées par JWT (prévu pour v2)

---

## ROUTES FRONTEND

| Route | Accès | Fichier |
|-------|-------|---------|
| /login | Public seulement | pages/LoginPage.jsx |
| /register | Public seulement | pages/RegisterPage.jsx |
| /forgot-password | Public | pages/ForgotPasswordPage.jsx |
| /reset-password?token=... | Public | pages/ResetPasswordPage.jsx |
| /dashboard | Connecté | pages/dashboard/Overview.jsx |
| /dashboard/education | Connecté | pages/dashboard/Education.jsx |
| /dashboard/platform | Connecté | pages/dashboard/Platform.jsx |
| /dashboard/chat | Connecté | pages/dashboard/AIChat.jsx |
| /dashboard/settings | Connecté | pages/dashboard/Settings.jsx |
| /admin/login | Public | pages/admin/AdminLogin.jsx |
| /admin | Token admin requis | pages/admin/AdminPage.jsx |
| / et /* | → redirect | /dashboard |

---

## AUTHENTIFICATION — FONCTIONNEMENT

```
Register :
  frontend → POST /api/auth/register { email, password, name }
  backend  → bcrypt.hash(12) → createUser() → signToken()
           → sendWelcomeEmail() [non bloquant]
           → { token, user }
  frontend → localStorage.setItem('safehaven_token', token)
  frontend → affiche banner succès 2s → navigate('/dashboard')

Login :
  frontend → POST /api/auth/login { email, password }
  backend  → bcrypt.compare() → signToken() → { token, user }
  frontend → localStorage.setItem('safehaven_token', token) → navigate('/dashboard')

Vérification au chargement :
  AuthContext monte → lit localStorage
  → GET /api/auth/me (Bearer token)
  → success → user chargé
  → fail   → token supprimé, redirect /login

Logout :
  localStorage.removeItem('safehaven_token')
  setUser(null) → navigate('/login')

Mot de passe oublié :
  /forgot-password → POST /api/auth/forgot-password { email }
  backend → réponse identique (sécurité), si user existe → createResetToken() → sendResetEmail()
  email contient : APP_URL/reset-password?token=<hex64chars>

Réinitialisation :
  /reset-password?token=... → POST /api/auth/reset-password { token, password }
  backend → verifyResetToken() → bcrypt.hash(12) → updatePassword() → consumeResetToken()
  frontend → banner succès → redirect /login 3s
```

---

## EMAILS (nodemailer)

En mode développement (SMTP_HOST absent dans .env) :
- Les emails s'affichent dans la console du backend (pas envoyés vraiment)
- Log format : `📧 [Mailer DEV] À: ..., Sujet: ...`

En production : configurez SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM dans agent/.env

---

## CHAT IA — FONCTIONNEMENT

```
AIChat.jsx sendMessage() :
  fetch POST /api/chat { messages[], stream: true, locale: 'fr' }
  ↓
agent/routes/chat.ts :
  guardrails.filterInput()  ← bloque levier, PII, arnaques
  claude.streamChat()       ← SSE vers Anthropic
  guardrails.filterOutput() ← nettoie la réponse
  ↓
SSE : data: {"chunk":"..."} × N → data: {"done":true}
  ↓
AIChat.jsx : accumule chunks → affiche en temps réel
```

---

## SÉCURITÉ EN PLACE

1. **Helmet** : CSP, X-Frame-Options, HSTS
2. **CORS** : whitelist d'origines (CORS_ORIGINS dans .env)
3. **Rate limit** : 60 req/min global, 20 req/min sur /api/chat
4. **bcrypt 12 rounds** : mots de passe jamais en clair
5. **JWT 7 jours** : signé avec JWT_SECRET
6. **Zod** : validation stricte de tous les corps de requête
7. **Guardrails IA** : 6 catégories bloquées + nettoyage PII
8. **Body limit 512kb** : protection bombes JSON
9. **Non-custodial** : jamais de clés privées côté serveur
10. **Tokens reset** : 32 octets aléatoires, TTL 1h, usage unique, 1 token/user max
11. **Énumération email bloquée** : /forgot-password répond identiquement email existant ou non

---

## STOCKAGE DES DONNÉES

| Donnée | Où | Format |
|--------|----|--------|
| Comptes utilisateurs | `agent/data/users.json` | JSON (id, email, passwordHash, name, createdAt) |
| Tokens réinitialisation | `agent/data/reset-tokens.json` | JSON (token, userId, expiresAt) |
| Token JWT | `localStorage` navigateur | String (clé: safehaven_token) |
| Progression cours | `localStorage` navigateur | JSON (safehaven_course_progress_v1) |
| Scores quiz | `localStorage` navigateur | JSON (safehaven_course_quiz_scores_v1) |
| Adresse wallet Solana | `localStorage` navigateur | String (solana-address) |

Pas de base de données SQL/NoSQL pour l'instant. Tout est fichier JSON (MVP).

---

## DÉMARRAGE

### Commande unique (recommandé)

```bash
cd ~/Documents/SafeHaven\ Money/SHM
npm run dev
# → Backend  : http://localhost:3001  (logs cyan)
# → Frontend : http://localhost:5173  (logs magenta)
# Arrêt : Ctrl+C
```

### Autres commandes racine

```bash
npm run build        # Build backend + frontend
npm run install:all  # Réinstaller toutes les dépendances
```

### Accès admin après démarrage

URL : `http://localhost:5173/admin`
Identifiant : `Kheira_Mialy` — Mot de passe : `KMSHM2k26`

---

## VARIABLES D'ENV IMPORTANTES

```env
# agent/.env
ANTHROPIC_API_KEY=sk-ant-...        ← OBLIGATOIRE pour le chat IA
JWT_SECRET=phrase-longue-aleatoire  ← OBLIGATOIRE pour l'auth
AGENT_PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173

# Pour l'envoi d'emails réels (optionnel, dev = console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=vous@gmail.com
SMTP_PASS=app-password-gmail
SMTP_FROM=SafeHaven <vous@gmail.com>
APP_URL=http://localhost:5173
```

---

## CE QUI RESTE À FAIRE / IDÉES FUTURES

- [ ] Protéger /api/chat et autres routes avec JWT (requireAuth)
- [ ] Modifier le profil utilisateur (nom, mot de passe)
- [ ] Base de données réelle (SQLite ou PostgreSQL) pour remplacer users.json
- [ ] Tableau de bord analytics (nb messages IA, temps passé...)
- [ ] Mode multilingue sur le frontend (i18n)
- [ ] Tests automatisés frontend (Vitest)
- [ ] Déploiement Railway (backend) + Vercel (frontend)

---

## CONVENTIONS DE CODE

- Frontend : JSX (pas TSX), Tailwind pour les styles, shadcn/ui pour les composants
- Backend : TypeScript strict, Zod pour la validation, async/await
- Composants UI réutilisables : toujours dans `projet/src/components/ui/`
- Alias d'import : `@/` = `projet/src/` (configuré dans vite.config.js)
- Token localStorage : clé = `safehaven_token`
- Pas de commentaires inutiles dans le code, noms de variables explicites

---

## COMMENT UTILISER CE FICHIER

Envoyer ce fichier à Claude en début de conversation avec ce message :
"Voici le contexte complet du projet SafeHaven. [coller le contenu ou joindre le fichier]
Je veux [ta demande]."

Claude aura immédiatement tout le contexte sans avoir besoin de relire les fichiers.
