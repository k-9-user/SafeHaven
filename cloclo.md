# CLOCLO — Contexte complet du projet SafeHaven Money
# Fichier à envoyer à Claude en début de conversation pour recharger tout le contexte.
# Dernière mise à jour : 16 juin 2026

---

## QUI EST KHEIRA

Kheira est la développeuse et propriétaire du projet Safe Haven Money (SHM).
Quand elle envoie ce fichier, tu dois immédiatement comprendre l'intégralité du projet
sans avoir besoin de relire les fichiers sources. Tu peux aller directement au travail.

---

## ÉTAT ACTUEL DU PROJET (v2)

Le projet s'appelle désormais **Safe Haven Money** (plus "SafeHaven").
Il est **déployé en production** sur :
- **Frontend** : Vercel → `https://safe-haven-z92f.vercel.app`
- **Backend** : Railway → `https://safehaven-production-*.railway.app`

La variable `VITE_AGENT_URL` dans Vercel pointe vers l'URL Railway.
Le CORS Railway doit lister l'URL Vercel dans `CORS_ORIGINS` (sans slash final).

---

## STRUCTURE DU PROJET (état actuel)

```
SHM/
├── agent/                    ← Backend Node.js + TypeScript (port 3001)
│   ├── src/
│   │   ├── index.ts          ← Serveur Express (API only, pas de static files)
│   │   ├── auth/
│   │   │   ├── users.ts      ← Store JSON utilisateurs + updatePassword()
│   │   │   ├── middleware.ts ← JWT (requireAuth, requireAdmin, signToken)
│   │   │   ├── mailer.ts     ← Emails welcome + reset (dev=console, prod=SMTP)
│   │   │   └── resetTokens.ts← Tokens reset 32 octets, TTL 1h
│   │   ├── routes/
│   │   │   ├── auth.ts       ← /api/auth : register, login, me, forgot, reset
│   │   │   ├── admin.ts      ← /api/admin : users, stats (admin JWT séparé)
│   │   │   ├── chat.ts       ← /api/chat : streaming SSE Claude
│   │   │   ├── risk.ts       ← /api/risk-profile
│   │   │   ├── strategies.ts ← /api/strategies
│   │   │   ├── voice.ts      ← /api/voice : ElevenLabs TTS (multilingue EN/FR/ES)
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
│   │       ├── conservative.ts
│   │       ├── recommend.ts
│   │       └── lifi.ts
│   ├── data/
│   │   ├── users.json        ← Créé automatiquement au 1er register
│   │   └── reset-tokens.json ← Créé automatiquement à la 1ère demande reset
│   ├── railway.toml          ← Config Railway (agent uniquement, pas de cd ../projet)
│   └── package.json
│
├── projet/                   ← Frontend React + Vite (port 5173)
│   ├── public/
│   │   └── logo.svg          ← Logo Safe Haven Money (bouclier bleu + ondes cyan + $)
│   ├── src/
│   │   ├── App.jsx           ← Routeur + Providers (Language > Auth > QueryClient > Router)
│   │   ├── lib/
│   │   │   ├── AuthContext.jsx      ← useAuth() : user, login, logout, register
│   │   │   ├── LanguageContext.jsx  ← useLanguage() : lang, t(), switchLang() — EN/FR/ES
│   │   │   ├── api.js               ← fetch wrapper JWT auto + api.auth.*
│   │   │   ├── courseProgress.js    ← Progression cours + XP + Levels (localStorage)
│   │   │   ├── query-client.js      ← React Query config
│   │   │   └── utils.js             ← cn() Tailwind helper
│   │   ├── components/
│   │   │   ├── LanguageSwitcher.jsx ← 3 boutons drapeaux EN/FR/ES
│   │   │   ├── MarketMonitor.jsx    ← Prix SOL temps réel (CoinGecko)
│   │   │   ├── VoiceFinanceCoach.jsx← ElevenLabs ConvAI widget
│   │   │   ├── LiFiWalletWidget.jsx ← Widget échange cross-chain
│   │   │   ├── WalletSelector.jsx   ← Sélecteur portefeuille
│   │   │   └── ui/                  ← 30+ composants shadcn/ui (Radix)
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── EducationalHub.jsx        ← Skill tree gamifié (FICHIER PRINCIPAL)
│   │   │   └── dashboard/
│   │   │       ├── DashboardLayout.jsx   ← Sidebar + LanguageSwitcher + nav traduit
│   │   │       ├── Overview.jsx          ← Stats multilingues + isLessonRead() correct
│   │   │       ├── Education.jsx         ← Re-export de EducationalHub
│   │   │       ├── Platform.jsx          ← Logo SHM + MarketMonitor + LiFiWidget + i18n
│   │   │       ├── AIChat.jsx            ← Chat IA SSE, lang depuis useLanguage()
│   │   │       └── Settings.jsx          ← Paramètres multilingues
│   │   └── data/
│   │       └── coursesData.js            ← 5 mondes × 5 leçons, trilingue EN/FR/ES
│   ├── index.html             ← Titre "Safe Haven Money", favicon logo.svg
│   └── vite.config.js         ← alias @/ → src/, proxy /api → :3001
│
├── railway.toml               ← Config Railway racine (fullstack si besoin)
├── GUIDE_PROJET.md            ← Doc technique complète
├── kheira.md                  ← Guide technique mis à jour
└── cloclo.md                  ← CE FICHIER
```

---

## SYSTÈME MULTILINGUE (ajouté en session 4)

**Fichier :** `projet/src/lib/LanguageContext.jsx`

- Langues : `en` (défaut), `fr`, `es`
- Stockage : `localStorage['shm_lang']`
- Hook : `const { lang, t, switchLang } = useLanguage()`
- `t('clé')` retourne la traduction dans la langue active
- Fallback : EN si la clé n'existe pas dans la langue demandée

**Provider order dans App.jsx :**
```jsx
<LanguageProvider>       ← EN PREMIER (avant AuthProvider)
  <AuthProvider>
    <QueryClientProvider>
      <BrowserRouter>...</BrowserRouter>
    </QueryClientProvider>
  </AuthProvider>
</LanguageProvider>
```

**Clés de traduction disponibles :**
- `nav.*` : navigation sidebar (overview, education, platform, chat, settings, logout)
- `common.*` : boutons génériques (start, continue, next, back, check, correct, wrong, skip, locked)
- `edu.*` : éducation (world1-5, xp_earned, level_up, chapter_complete, boss_challenge, levels, next_lesson)
- `overview.*` : page Overview (welcome, subtitle, quick_actions, mission_title, mission_body)
- `settings.*` : page Settings (title, subtitle, profile, security, about, etc.)
- `auth.*` : pages auth (login_title, register_title, email, password, etc.)
- `voice.*` : placeholder chat vocal

**Switcher :** `LanguageSwitcher.jsx` — 3 boutons drapeaux EN/FR/ES, affiché dans sidebar desktop + header mobile

---

## EDUCATIONAL HUB — SKILL TREE (redesign session 4)

**Fichier :** `projet/src/pages/EducationalHub.jsx`

Design inspiré jeu vidéo : fond `#060d1a` (bleu très sombre), style sci-fi/néon.

### Structure des données (`coursesData.js`)
```javascript
[
  {
    id: 'world1',
    title: { en: '💰 Money Fundamentals', fr: '💰 Bases de l\'Argent', es: '...' },
    lessons: [
      {
        id: 'l1',
        title: { en, fr, es },
        content: { en, fr, es },   // texte long de la leçon
        xp: 50,
        quiz: {
          question: { en, fr, es },
          options: [{ en, fr, es }, ...],  // 4 options
          correctIndex: 0
        }
      },
      // ... 3 autres leçons normales
      { id: 'boss', isChallenge: true, xp: 150, ... }  // boss final
    ]
  },
  // world2, world3, world4, world5
]
```

5 mondes : world1 (Money Fundamentals), world2 (Protect Your Money),
world3 (Blockchain & Wallets), world4 (DeFi & Yields), world5 (Bridge & Grow)

### Composants internes

| Composant | Rôle |
|-----------|------|
| `XPBar` | Barre XP avec gradient bleu → cyan |
| `LevelBadge` | Badge niveau (1-5) avec couleur selon niveau |
| `LessonNode` | Carte leçon avec statut : locked / available / completed / boss |
| `VerticalConnector` | Trait pointillé vertical entre leçons |
| `HorizontalConnector` | Trait horizontal pour leçons parallèles |
| `WorldMap` | Carte complète d'un monde (header + skill tree) |
| `QuizSection` | Quiz interactif avec feedback + bouton "Leçon suivante →" |
| `LessonPanel` | Panneau droit affichant contenu + quiz |

### Layout
- Sans leçon sélectionnée : grille 1/2/3 colonnes selon viewport
- Avec leçon sélectionnée : `flex-row` sur md+ (480px pour WorldMaps, 400px pour LessonPanel côte à côte)
- Mobile : toujours empilé verticalement

### XP et Niveaux (`courseProgress.js`)

| localStorage key | Contenu |
|-----------------|---------|
| `safehaven_course_progress_v1` | `{ worldId: { lessonId: true } }` |
| `safehaven_course_quiz_scores_v1` | `{ worldId: { lessonId: score% } }` |
| `shm_xp` | XP total cumulé (nombre) |

| Niveau | Nom | XP requis |
|--------|-----|-----------|
| 1 | Novice | 0 |
| 2 | Apprentice | 200 |
| 3 | Saver | 500 |
| 4 | Investor | 1000 |
| 5 | DeFi Master | 2000 |

Fonctions exportées : `isLessonRead`, `markLessonRead`, `getTotalXP`, `addXP`, `getLevel`, `isWorldUnlocked`

### Règle de déverrouillage des mondes
- World 1 : toujours déverrouillé
- World N : déverrouillé quand les 5 leçons du World N-1 sont terminées

### Bug fixes importants (session 5)
- **Validation auto au clic "Leçon suivante"** : corrigé par `key={lesson.id}` sur `QuizSection`
  → React recrée le composant à zéro (reset `selected`, `submitted`, `skipped`)
- **Progress = 0 dans Overview** : corrigé en utilisant `isLessonRead()` par leçon
  (pas `getCourseProgress()` qui comptait mal)

---

## ADMIN

- URL : `/admin/login` puis `/admin`
- Identifiants : `Kheira_Mialy` / `KMSHM2k26`
- Token séparé : `localStorage['safehaven_admin_token']` (JWT 12h, `isAdmin: true`)
- Fonctionnalités : liste comptes, activer/désactiver, supprimer, stats
- **RÈGLE ABSOLUE** : jamais de création d'admin via l'interface, seul `Kheira_Mialy` est admin

---

## DÉPLOIEMENT (production)

### Backend — Railway
- Dossier de build : `agent/`
- `agent/railway.toml` :
  ```toml
  [build]
  builder = "nixpacks"
  buildCommand = "npm install --include=dev && npm run build"
  [deploy]
  startCommand = "npm start"
  healthcheckPath = "/health"
  ```
- Variables Railway obligatoires :
  - `ANTHROPIC_API_KEY`, `JWT_SECRET`, `ADMIN_USERNAME=Kheira_Mialy`, `ADMIN_PASSWORD=KMSHM2k26`
  - `CORS_ORIGINS=https://safe-haven-z92f.vercel.app` (SANS slash final !)

### Frontend — Vercel
- Dossier de build : `projet/`
- Variable Vercel obligatoire : `VITE_AGENT_URL=https://[url-railway]` (URL complète du backend)
- Après tout changement de `VITE_AGENT_URL` : **Redeploy obligatoire** (variable baked à build time)

### Piège CORS connu
Le code dans `agent/src/index.ts` nettoie les origines :
```typescript
.map((o: string) => o.trim().replace(/\/$/, ''))
```
Si `CORS_ORIGINS` a un slash final dans Railway → ça ne fonctionnera pas.

---

## ROUTES BACKEND

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | /api/auth/register | Non | Créer un compte |
| POST | /api/auth/login | Non | Connexion → JWT |
| GET | /api/auth/me | JWT user | Profil utilisateur |
| POST | /api/auth/forgot-password | Non | Token reset par email |
| POST | /api/auth/reset-password | Non | Changer mdp avec token |
| POST | /api/admin/login | Non | Connexion admin → JWT admin |
| GET | /api/admin/users | JWT admin | Liste comptes |
| PATCH | /api/admin/users/:id | JWT admin | Activer/désactiver |
| DELETE | /api/admin/users/:id | JWT admin | Supprimer |
| GET | /api/admin/stats | JWT admin | Statistiques |
| POST | /api/chat | Non* | Chat IA streaming SSE |
| GET | /api/yields | Non* | APY DeFi |
| GET | /api/strategies | Non* | Stratégies disponibles |
| POST | /api/voice/synthesize | Non* | TTS ElevenLabs |
| GET | /health | Non | Statut serveur |

*= pas encore protégées par JWT (prévu v2)

---

## ROUTES FRONTEND

| Route | Accès | Composant |
|-------|-------|-----------|
| /login | Public seulement | LoginPage |
| /register | Public seulement | RegisterPage |
| /forgot-password | Public | ForgotPasswordPage |
| /reset-password?token= | Public | ResetPasswordPage |
| /dashboard | Connecté | Overview |
| /dashboard/education | Connecté | EducationalHub (via Education.jsx) |
| /dashboard/platform | Connecté | Platform |
| /dashboard/chat | Connecté | AIChat |
| /dashboard/settings | Connecté | Settings |
| /admin/login | Public | AdminLogin |
| /admin | Token admin | AdminPage |
| / et /* | Redirect | /dashboard |

---

## LOCALSTORAGE — TOUTES LES CLÉS

| Clé | Contenu | Qui l'utilise |
|-----|---------|---------------|
| `safehaven_token` | JWT utilisateur (7j) | AuthContext |
| `safehaven_admin_token` | JWT admin (12h) | AdminRoute, adminRequest() |
| `shm_lang` | Langue active ('en'/'fr'/'es') | LanguageContext |
| `safehaven_course_progress_v1` | `{ worldId: { lessonId: true } }` | courseProgress.js |
| `safehaven_course_quiz_scores_v1` | `{ worldId: { lessonId: scorePercent } }` | courseProgress.js |
| `shm_xp` | XP total (number string) | courseProgress.js |

---

## STACK TECHNIQUE

| Couche | Techno | Version |
|--------|--------|---------|
| Frontend | React + Vite | React 18, Vite 6 |
| Styles | Tailwind CSS + shadcn/ui | Tailwind 3 |
| Routing | React Router DOM | v6 |
| Cache API | TanStack React Query | v5 |
| i18n | Contexte React custom | — (pas de lib externe) |
| Backend | Node.js + Express + TypeScript | Express 4 |
| Auth | bcryptjs (12 rounds) + JWT (7j) | — |
| Email | nodemailer (dev: console, prod: SMTP) | — |
| LLM | Anthropic Claude | claude-sonnet-4-6 |
| Voice | ElevenLabs ConvAI widget + TTS | multilingual v2 |
| DeFi | LI.FI Widget + Kamino + MarginFi | Solana mainnet |
| Wallet | Phantom via window.solana | web3.js v1 |

---

## VARIABLES D'ENV (`agent/.env`)

```env
# OBLIGATOIRE
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=phrase-aleatoire-longue-minimum-32-chars

# Serveur
AGENT_PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173

# Admin (identifiants fixes — NE PAS MODIFIER LE MOT DE PASSE)
ADMIN_USERNAME=Kheira_Mialy
ADMIN_PASSWORD=KMSHM2k26

# Email (vide = mode dev console)
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

---

## DÉMARRAGE LOCAL

```bash
cd ~/Documents/SafeHaven\ Money/SHM
npm run dev
# → Backend  : http://localhost:3001
# → Frontend : http://localhost:5173
# Admin      : http://localhost:5173/admin (Kheira_Mialy / KMSHM2k26)
```

---

## CE QUI RESTE À FAIRE (backlog)

- [ ] Protéger /api/chat et autres routes avec JWT (requireAuth)
- [ ] Modifier le profil utilisateur (nom, mot de passe) depuis Settings
- [ ] Base de données réelle (SQLite/PostgreSQL) pour remplacer users.json
- [ ] Analytics (nb sessions IA, temps passé, progression cours côté serveur)
- [ ] Progression cours liée au compte serveur (pas juste localStorage)
- [ ] Tests automatisés (Vitest + Testing Library)
- [ ] Voix espagnole ElevenLabs (ELEVENLABS_VOICE_ID_ES)

## CE QUI EST TERMINÉ ✅

- [x] Authentification complète (register/login/JWT/forgot-password/reset)
- [x] Panel admin (Kheira_Mialy uniquement, liste/désactiver/supprimer comptes)
- [x] Refonte nom → Safe Haven Money + logo SVG
- [x] Système multilingue EN/FR/ES (LanguageContext + LanguageSwitcher)
- [x] Educational Hub — skill tree gamifié (5 mondes, 25 leçons, XP, niveaux)
- [x] Contenu cours trilingue (coursesData.js)
- [x] Système XP + niveaux (courseProgress.js)
- [x] Dashboard multilingue (Overview, Settings, DashboardLayout, AIChat, Platform)
- [x] Layout côte à côte leçon/carte sur desktop
- [x] Bouton "Leçon suivante →" après réussite quiz
- [x] Bug reset état quiz au changement de leçon (key={lesson.id})
- [x] Déploiement Railway (backend) + Vercel (frontend)
- [x] CORS fix (trim + remove trailing slash)
- [x] Logo Safe Haven Money dans Platform et pages auth
