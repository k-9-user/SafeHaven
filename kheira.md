# Guide Technique Safe Haven Money — kheira.md
**Dernière mise à jour : 16 juin 2026**

---

## 1. Vue d'ensemble

**Safe Haven Money (SHM)** est une application d'éducation financière + DeFi sur Solana.
Déployée en production sur Vercel (frontend) + Railway (backend).

| Composant | Dossier | Port local | Techno |
|-----------|---------|-----------|--------|
| Backend API | `agent/` | 3001 | Node.js + Express + TypeScript |
| Frontend web | `projet/` | 5173 | React 18 + Vite 6 + Tailwind |

**Production :**
- Frontend : `https://safe-haven-z92f.vercel.app`
- Backend : Railway (URL dans les variables Vercel `VITE_AGENT_URL`)

---

## 2. Démarrage local

### Une seule commande (recommandé)
```bash
cd ~/Documents/SafeHaven\ Money/SHM
npm run dev
# Backend  → http://localhost:3001  (logs cyan)
# Frontend → http://localhost:5173  (logs magenta)
# Ctrl+C pour tout arrêter
```

### Vérifications
```bash
curl http://localhost:3001/health
# → { "status": "ok", ... }
```

### Accès admin
URL : `http://localhost:5173/admin`
- Identifiant : `Kheira_Mialy`
- Mot de passe : `KMSHM2k26`

---

## 3. Architecture

```
Navigateur (projet/ port 5173)
  │
  │ fetch /api/* (proxy Vite → :3001 en dev, VITE_AGENT_URL en prod)
  ▼
Express API (agent/ port 3001)
  ├── /api/auth         ← register, login, me, forgot-password, reset-password
  ├── /api/admin        ← users, stats (JWT admin séparé)
  ├── /api/chat         ← Claude streaming SSE
  ├── /api/yields       ← APY DeFi temps réel
  ├── /api/strategies   ← Recommandations DeFi
  ├── /api/risk-profile ← Profil risque utilisateur
  └── /api/voice        ← TTS ElevenLabs (EN/FR/ES)
  │
  ├── agent/data/users.json          ← Comptes utilisateurs
  └── agent/data/reset-tokens.json   ← Tokens réinit. mot de passe (1h TTL)
```

---

## 4. Variables d'environnement (`agent/.env`)

```env
# OBLIGATOIRE
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=phrase-aleatoire-longue-minimum-32-chars

# Serveur
AGENT_PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173

# Admin — NE PAS CHANGER LE MOT DE PASSE
ADMIN_USERNAME=Kheira_Mialy
ADMIN_PASSWORD=KMSHM2k26

# Email (laisser vide = dev console)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Safe Haven Money <noreply@safehaven.app>
APP_URL=http://localhost:5173

# Optionnel
ELEVENLABS_VOICE_ID_FR=TX3LPaxmHKxFdv7VOQHJ
ELEVENLABS_VOICE_ID_EN=...
LIFI_API_KEY=...
```

**Variables Railway (production) :**
- Tout ce qui est ci-dessus, plus :
- `CORS_ORIGINS=https://safe-haven-z92f.vercel.app` ← sans slash final !
- `NODE_ENV=production`

**Variables Vercel (production) :**
- `VITE_AGENT_URL=https://[url-railway-service]`
- ⚠️ Après changement de `VITE_AGENT_URL` → **Redeploy obligatoire** (baked à build)

---

## 5. Structure backend (`agent/src/`)

| Fichier | Rôle |
|---------|------|
| `index.ts` | Serveur Express (Helmet, CORS, rate-limit, body-limit 512kb) — API only |
| `auth/users.ts` | CRUD utilisateurs JSON + updatePassword() |
| `auth/middleware.ts` | requireAuth (Bearer JWT user), requireAdmin (Bearer JWT admin), signToken() |
| `auth/mailer.ts` | Emails welcome + reset (dev: console, prod: SMTP nodemailer) |
| `auth/resetTokens.ts` | Génération/vérification/consommation tokens reset |
| `routes/auth.ts` | 5 endpoints auth |
| `routes/admin.ts` | 5 endpoints admin (login + CRUD users + stats) |
| `routes/chat.ts` | Chat IA streaming SSE |
| `routes/voice.ts` | TTS ElevenLabs multilingue EN/FR/ES |
| `routes/yields.ts` | APY DeFi |
| `routes/strategies.ts` | Recommandations DeFi |
| `routes/risk.ts` | Profil risque |
| `llm/claude.ts` | Client Anthropic (stream + one-shot) |
| `llm/memory.ts` | Résumé conversation (contexte long) |
| `safety/guardrails.ts` | Filtres IA : levier, PII, arnaque, garantis… |
| `strategies/library.ts` | Catalogue Kamino, MarginFi |
| `risk/profiler.ts` | Machine à états score 1-5 |

---

## 5b. Routes admin backend

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | /api/admin/login | Non | → adminToken JWT (12h, isAdmin:true) |
| GET | /api/admin/users | Admin | Liste comptes (sans passwordHash) |
| PATCH | /api/admin/users/:id | Admin | Modifier isActive |
| DELETE | /api/admin/users/:id | Admin | Supprimer un compte |
| GET | /api/admin/stats | Admin | Total, actifs, 7j, derniers inscrits |

L'admin ne peut pas se modifier/supprimer lui-même.

---

## 6. Structure frontend (`projet/src/`)

| Fichier | Route | Accès |
|---------|-------|-------|
| `pages/LoginPage.jsx` | `/login` | Public seulement |
| `pages/RegisterPage.jsx` | `/register` | Public seulement |
| `pages/ForgotPasswordPage.jsx` | `/forgot-password` | Public |
| `pages/ResetPasswordPage.jsx` | `/reset-password?token=` | Public |
| `pages/EducationalHub.jsx` | — | Composant principal éducation |
| `pages/dashboard/DashboardLayout.jsx` | `/dashboard/*` | Connecté |
| `pages/dashboard/Overview.jsx` | `/dashboard` | Connecté |
| `pages/dashboard/Education.jsx` | `/dashboard/education` | Connecté (re-export EducationalHub) |
| `pages/dashboard/Platform.jsx` | `/dashboard/platform` | Connecté |
| `pages/dashboard/AIChat.jsx` | `/dashboard/chat` | Connecté |
| `pages/dashboard/Settings.jsx` | `/dashboard/settings` | Connecté |
| `pages/admin/AdminLogin.jsx` | `/admin/login` | Public |
| `pages/admin/AdminPage.jsx` | `/admin` | Token admin |
| `lib/AuthContext.jsx` | — | `useAuth()` : user, login, logout, register |
| `lib/LanguageContext.jsx` | — | `useLanguage()` : lang, t(), switchLang() |
| `lib/api.js` | — | fetch wrapper + api.auth.* |
| `lib/courseProgress.js` | — | Progression + XP + Levels (localStorage) |
| `components/LanguageSwitcher.jsx` | — | Boutons 🇬🇧 🇫🇷 🇪🇸 |
| `data/coursesData.js` | — | 5 mondes × 5 leçons trilingues |

---

## 7. Système multilingue

**Provider :** `LanguageContext.jsx` — EN par défaut, FR et ES disponibles.
**Stockage :** `localStorage['shm_lang']`
**Hook :** `const { lang, t, switchLang } = useLanguage()`

```jsx
// Exemple d'utilisation dans un composant
const { t, lang } = useLanguage();
<h1>{t('settings.title')}</h1>
```

**Provider order dans App.jsx (important) :**
```jsx
<LanguageProvider>    ← EN PREMIER
  <AuthProvider>
    ...
  </AuthProvider>
</LanguageProvider>
```

**LanguageSwitcher** est présent dans : sidebar desktop + header mobile (DashboardLayout).

---

## 8. Educational Hub — Skill Tree

**Fichier principal :** `projet/src/pages/EducationalHub.jsx`

Design jeu vidéo : fond `#060d1a`, accents néon bleu/vert.

### Données (`coursesData.js`)
- 5 mondes : world1 à world5
- Chaque monde : 4 leçons normales + 1 boss (isChallenge: true)
- Tout est trilingue : `title.en`, `title.fr`, `title.es` (idem content et quiz)

### XP et Niveaux
- Bonne réponse quiz : +XP (défini par leçon, ex: 50 XP)
- Skip : +50% XP
- Levels : Novice (0) → Apprentice (200) → Saver (500) → Investor (1000) → DeFi Master (2000)
- Stockage : `localStorage['shm_xp']`

### Règles de déverrouillage
- World 1 toujours déverrouillé
- World N : déverrouillé quand les 5 leçons de World N-1 sont terminées
- Boss : déverrouillé quand les 4 leçons normales du monde sont terminées

### Layout
- Sans sélection : grille 1→2→3 cols
- Avec leçon sélectionnée : côte à côte (flex-row sur md+), panneau 400px à droite
- Mobile : empilé verticalement

### Bouton "Leçon suivante →"
Apparaît après bonne réponse OU skip dans le QuizSection.
Passe à la leçon suivante dans le même monde. Dernière leçon → ferme le panneau.

---

## 9. localStorage — toutes les clés

| Clé | Contenu |
|-----|---------|
| `safehaven_token` | JWT utilisateur (7 jours) |
| `safehaven_admin_token` | JWT admin (12 heures) |
| `shm_lang` | Langue ('en' / 'fr' / 'es') |
| `safehaven_course_progress_v1` | `{ worldId: { lessonId: true } }` |
| `safehaven_course_quiz_scores_v1` | `{ worldId: { lessonId: scorePercent } }` |
| `shm_xp` | XP total (string numérique) |

⚠️ La progression cours est **locale au navigateur**, pas liée au compte serveur.
Si l'utilisateur change de navigateur, la progression repart de zéro.

---

## 10. Sécurité

| Mécanisme | Détail |
|-----------|--------|
| Helmet | CSP, X-Frame-Options, HSTS, X-Content-Type |
| CORS | Whitelist CORS_ORIGINS dans .env (sans slash final) |
| Rate limit | 60 req/min global, 20 req/min /api/chat |
| bcrypt | 12 rounds — mots de passe jamais en clair |
| JWT user | 7 jours, signé JWT_SECRET |
| JWT admin | 12 heures, `isAdmin: true`, séparé des users |
| Zod | Validation stricte tous les body |
| Body limit | 512kb |
| Guardrails IA | 6 catégories filtrées + nettoyage PII |
| Anti-énumération | /forgot-password répond identique qu'il y ait un compte ou non |
| Tokens reset | 32 octets random, TTL 1h, usage unique |
| Non-custodial | Jamais de clés privées côté serveur |

---

## 10b. Accès Administrateur

- Un seul admin : **Kheira_Mialy** / **KMSHM2k26**
- Défini dans `agent/.env` et vérifié dans `routes/admin.ts`
- Token séparé : `safehaven_admin_token` (localStorage, différent de `safehaven_token`)
- Aucun moyen de créer un 2e admin depuis l'interface

---

## 11. Authentification — flux complet

### Inscription
```
POST /api/auth/register { email, password, name }
→ Zod validate → bcrypt.hash(12) → createUser() → signToken(7j)
→ sendWelcomeEmail() [non bloquant]
→ { token, user }
Frontend : localStorage['safehaven_token'] = token → /dashboard
```

### Connexion
```
POST /api/auth/login { email, password }
→ findByEmail() → bcrypt.compare() → signToken(7j)
→ { token, user }
Frontend : localStorage['safehaven_token'] = token → /dashboard
```

### Vérification au chargement
```
AuthContext monte → lit localStorage['safehaven_token']
→ GET /api/auth/me (Bearer token)
→ succès → user chargé, dashboard accessible
→ échec → token supprimé, redirect /login
```

### Mot de passe oublié
```
POST /api/auth/forgot-password { email }
→ réponse identique (anti-énumération)
→ si user existe : createResetToken() → sendResetEmail()
→ email : APP_URL/reset-password?token=<64 hex chars>
→ token TTL 1h, usage unique

POST /api/auth/reset-password { token, password }
→ verifyResetToken() → bcrypt.hash(12) → updatePassword() → consumeResetToken()
Frontend : banner succès → /login après 3s
```

---

## 12. Email (nodemailer)

**Dev** (SMTP_HOST vide) : emails dans la console, format `📧 [Mailer DEV]...`

**Prod** : configurer dans `agent/.env` :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=vous@gmail.com
SMTP_PASS=votre-app-password
SMTP_FROM=Safe Haven Money <vous@gmail.com>
APP_URL=https://safe-haven-z92f.vercel.app
```

---

## 13. Déploiement Railway → Vercel

### Railway (backend)
1. Pointer Railway sur le dossier `agent/`
2. Variables dans Railway : ANTHROPIC_API_KEY, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, CORS_ORIGINS (sans slash), NODE_ENV=production
3. `agent/railway.toml` est déjà configuré correctement

### Vercel (frontend)
1. Pointer Vercel sur le dossier `projet/`
2. Variable `VITE_AGENT_URL` = URL complète Railway (ex: `https://web-production-xxxx.railway.app`)
3. **Après tout changement de VITE_AGENT_URL** : Redeploy dans Vercel (variable baked à build time Vite)

### Piège courant
`CORS_ORIGINS` avec slash final → les requêtes CORS échouent.
Le code nettie automatiquement les slashes, mais vérifier la variable Railway.

---

## 14. Conventions de code

- **Frontend** : JSX (pas TSX), `// @ts-nocheck` en haut des fichiers JSX si besoin
- **Backend** : TypeScript strict, Zod pour la validation, async/await
- **Styles** : Tailwind CSS + shadcn/ui (composants dans `components/ui/`)
- **Alias** : `@/` = `projet/src/` (vite.config.js)
- **Token JWT user** : `localStorage['safehaven_token']`
- **Token JWT admin** : `localStorage['safehaven_admin_token']`
- **Langue** : `localStorage['shm_lang']`
- Pas de commentaires inutiles, noms de variables explicites

---

## 15. Ce qui reste à faire (backlog)

- [ ] Protéger /api/chat et autres routes avec JWT (requireAuth)
- [ ] Modifier profil utilisateur (nom, mot de passe) depuis Settings
- [ ] Base de données réelle (SQLite/PostgreSQL) — remplacer users.json
- [ ] Progression cours liée au compte (serveur, pas juste localStorage)
- [ ] Analytics : sessions IA, temps passé, progression côté serveur
- [ ] Tests automatisés (Vitest + Testing Library)
- [ ] Voix espagnole ElevenLabs (ELEVENLABS_VOICE_ID_ES)

## Ce qui est terminé ✅

- [x] Authentification complète (register, login, forgot-password, reset)
- [x] Panel admin Kheira_Mialy (liste/désactiver/supprimer/stats)
- [x] Refonte nom → Safe Haven Money + logo SVG (bouclier bleu + ondes + $)
- [x] Système multilingue EN/FR/ES (LanguageContext + LanguageSwitcher)
- [x] Dashboard entièrement traduit (Overview, Settings, DashboardLayout, AIChat, Platform)
- [x] Educational Hub — skill tree gamifié (5 mondes, 25 leçons trilingues)
- [x] Système XP + 5 niveaux (courseProgress.js)
- [x] Layout côte à côte leçon/carte sur desktop (md+)
- [x] Bouton "Leçon suivante →" après quiz réussi
- [x] Bug reset état quiz (key={lesson.id})
- [x] Bug compteur progression Overview (isLessonRead vs getCourseProgress)
- [x] Déploiement Railway + Vercel en production
- [x] CORS fix (trim + slash removal)
