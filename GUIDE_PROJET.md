# Safe Haven Money — Guide complet du projet

> Document de référence technique. Explique comment fonctionne chaque partie du code,
> pourquoi elle a été conçue ainsi, et où aller pour effectuer des modifications.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture générale](#2-architecture-générale)
3. [Démarrage rapide](#3-démarrage-rapide)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Backend — le dossier `agent/`](#5-backend--le-dossier-agent)
6. [Frontend — le dossier `projet/`](#6-frontend--le-dossier-projet)
7. [Les pages de l'application](#7-les-pages-de-lapplication)
8. [Sécurité — couches et mécanismes](#8-sécurité--couches-et-mécanismes)
9. [Flux de données expliqués](#9-flux-de-données-expliqués)
10. [Où chercher pour modifier quoi](#10-où-chercher-pour-modifier-quoi)

---

## 1. Vue d'ensemble

**Safe Haven Money** est une application web de finance personnelle propulsée par l'IA.
Elle a été conçue pour les populations non bancarisées d'Afrique et d'Amérique Latine,
mais elle est utilisable par n'importe qui.
Déployée en production : Vercel (frontend) + Railway (backend).

### Ce que fait l'application

| Fonctionnalité | Description |
|---|---|
| **Éducation financière** | Cours interactifs avec quiz et progression XP |
| **Coach IA** | Chat en temps réel avec "Coco", une IA propulsée par Claude (Anthropic) |
| **Plateforme DeFi** | Surveillance du marché SOL, échange via LI.FI, stratégies USDC |
| **Authentification** | Système de comptes email/mot de passe avec JWT |

### Ce que l'application n'est PAS

- Elle ne stocke jamais vos clés privées de portefeuille
- Elle ne prend jamais de positions spéculatives (pas de levier, pas de dérivés)
- Elle ne donne pas de conseils fiscaux
- Elle n'est pas un exchange centralisé

---

## 2. Architecture générale

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVIGATEUR (port 5173)                    │
│                                                             │
│  ┌──────────────┐    ┌─────────────────────────────────┐   │
│  │  Sidebar Nav │    │       Page active (React)        │   │
│  │  (Dashboard) │    │  Overview / Education / Chat...  │   │
│  └──────────────┘    └────────────────┬────────────────┘   │
└───────────────────────────────────────┼─────────────────────┘
                                        │ fetch() / SSE
                                        ▼
┌─────────────────────────────────────────────────────────────┐
│               AGENT BACKEND (port 3001, Node.js)            │
│                                                             │
│  Helmet  →  CORS  →  Rate limit  →  Routes                 │
│                                                             │
│  /api/auth  /api/chat  /api/yields  /api/voice  /api/risk   │
│       │          │                                          │
│  bcrypt+JWT  Claude AI (streaming SSE)                      │
│                                                             │
│  Fichier: agent/data/users.json  (base utilisateurs)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ API externe
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
      Anthropic Claude    ElevenLabs       LI.FI Bridge
      (LLM, streaming)   (TTS voix)       (DeFi routes)
```

**Règle d'or** : Le frontend ne connaît jamais les clés API (Anthropic, ElevenLabs).
Elles restent côté backend dans le fichier `.env` du dossier `agent/`.

---

## 3. Démarrage rapide

### Prérequis
- Node.js ≥ 18
- npm ≥ 9

### 1 — Backend

```bash
cd agent
cp .env.example .env          # remplir les clés API
npm install
npm run dev                   # démarre sur http://localhost:3001
```

### 2 — Frontend

```bash
cd projet
npm install
npm run dev                   # démarre sur http://localhost:5173
```

### 3 — Vérification

Ouvrez `http://localhost:5173` → vous arrivez sur la page de connexion.

- Créez un compte avec n'importe quel email + mot de passe (min 8 caractères)
- Vous arrivez sur le dashboard

> **Note** : Si le backend n'est pas démarré, la connexion échouera.
> Le frontend et le backend doivent tourner simultanément.

---

## 4. Variables d'environnement

Fichier à créer : `agent/.env` (copié depuis `agent/.env.example`)

```env
# ── IA ──────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...         # Clé API Anthropic (obligatoire pour le chat)
ANTHROPIC_MODEL=claude-sonnet-4-6    # Modèle à utiliser
ANTHROPIC_MAX_TOKENS=1500            # Longueur max des réponses IA

# ── Voix ────────────────────────────────────────────
ELEVENLABS_VOICE_ID_EN=...           # ID de la voix anglaise
ELEVENLABS_VOICE_ID_FR=...           # ID de la voix française
ELEVENLABS_MODEL=eleven_multilingual_v2

# ── Authentification ─────────────────────────────────
JWT_SECRET=change-this-to-something-long-and-random
                                     # IMPORTANT : changez cette valeur en production

# ── Serveur ──────────────────────────────────────────
AGENT_PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:8081

# ── Blockchain ───────────────────────────────────────
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_CLUSTER=mainnet-beta

# ── Limites ──────────────────────────────────────────
RATE_LIMIT_RPM=60                    # Requêtes/min globales
RATE_LIMIT_USER_RPM=20              # Requêtes chat/min par utilisateur
```

---

## 5. Backend — le dossier `agent/`

```
agent/
├── src/
│   ├── index.ts              ← Point d'entrée du serveur
│   ├── auth/
│   │   ├── users.ts          ← Base de données utilisateurs (fichier JSON)
│   │   └── middleware.ts     ← Vérification du token JWT
│   ├── routes/
│   │   ├── auth.ts           ← Register / Login / Me
│   │   ├── chat.ts           ← Chat IA (streaming SSE)
│   │   ├── risk.ts           ← Profil de risque utilisateur
│   │   ├── strategies.ts     ← Liste des stratégies DeFi disponibles
│   │   ├── voice.ts          ← Synthèse vocale ElevenLabs
│   │   └── yields.ts         ← Taux d'intérêt DeFi en temps réel
│   ├── llm/
│   │   ├── claude.ts         ← Client Anthropic Claude
│   │   ├── memory.ts         ← Résumé automatique de conversation
│   │   └── system-prompt.md  ← Personnalité et règles de l'IA Coco
│   ├── risk/
│   │   ├── profiler.ts       ← Machine à états du profil de risque
│   │   └── profile.ts        ← Types TypeScript du profil
│   ├── safety/
│   │   └── guardrails.ts     ← Filtres pré/post-IA (anti-arnaque, anti-levier)
│   └── strategies/
│       ├── library.ts        ← Catalogue des stratégies DeFi
│       ├── conservative.ts   ← Règles des stratégies conservatrices + APY
│       ├── recommend.ts      ← Moteur de recommandation de stratégies
│       └── lifi.ts           ← Optimisation des routes LI.FI
├── data/
│   └── users.json            ← Fichier de stockage des comptes (créé automatiquement)
└── package.json
```

---

### `agent/src/index.ts` — Point d'entrée

C'est le serveur Express principal. Il orchestre tout dans cet ordre :

1. **Helmet** : ajoute des en-têtes HTTP de sécurité (Content-Security-Policy, etc.)
2. **CORS** : autorise uniquement les origines listées dans `CORS_ORIGINS`
3. **Rate limiting** : 60 req/min globalement, 20 req/min sur `/api/chat`
4. **Body parsing** : limite les corps à 512 Ko (protection contre les bombes JSON)
5. **Montage des routes** : chaque fichier de route est monté sur son préfixe

```
/api/auth      → auth.ts       (register, login, me)
/api/chat      → chat.ts       (IA streaming)
/api/chat      → memory.ts     (résumé)
/api/risk-profile → risk.ts
/api/strategies   → strategies.ts
/api/yields       → yields.ts
/api/voice        → voice.ts
/health           → réponse JSON simple
```

---

### `agent/src/auth/users.ts` — Stockage des utilisateurs

Ce fichier gère la base de données des utilisateurs.
Format de stockage : fichier `agent/data/users.json`.

**Structure d'un utilisateur dans le JSON :**
```json
{
  "id": "uuid-généré-automatiquement",
  "email": "user@example.com",
  "passwordHash": "$2b$12$...",   ← hash bcrypt, jamais le vrai mot de passe
  "name": "Prénom",
  "createdAt": "2026-06-10T12:00:00.000Z"
}
```

**Fonctions exportées :**

| Fonction | Ce qu'elle fait |
|---|---|
| `findByEmail(email)` | Cherche un utilisateur par email (insensible à la casse) |
| `findById(id)` | Cherche un utilisateur par son UUID |
| `createUser(data)` | Crée et sauvegarde un nouvel utilisateur |

---

### `agent/src/auth/middleware.ts` — Vérification JWT

Ce fichier protège les routes qui nécessitent d'être connecté.

**Comment ça marche :**
1. L'utilisateur envoie un header `Authorization: Bearer <token>`
2. Le middleware extrait le token de ce header
3. Il vérifie la signature cryptographique avec `JWT_SECRET`
4. Si valide, il ajoute `req.userId` et `req.userEmail` à la requête
5. Si invalide ou expiré → réponse 401

**Fonction `signToken(userId, email)`** :
Génère un token JWT signé, valable 7 jours.

---

### `agent/src/routes/auth.ts` — Routes d'authentification

#### `POST /api/auth/register`
Crée un nouveau compte.

```
Corps attendu: { email, password, name? }
Validation:
  - email: format email valide, max 255 chars
  - password: min 8, max 128 chars
  - name: optionnel, max 100 chars

Retourne: { token: "jwt...", user: { id, email, name } }
Erreurs:
  - 400 si validation échoue
  - 409 si email déjà utilisé
```

#### `POST /api/auth/login`
Connecte un utilisateur existant.

```
Corps attendu: { email, password }
Vérifie: bcrypt.compare(password, passwordHash)

Retourne: { token: "jwt...", user: { id, email, name } }
Erreur: 401 "Invalid email or password" (message volontairement vague pour la sécurité)
```

#### `GET /api/auth/me`
Retourne le profil de l'utilisateur connecté.

```
Header requis: Authorization: Bearer <token>
Retourne: { id, email, name, createdAt }
Erreur: 401 si token manquant ou invalide
```

---

### `agent/src/routes/chat.ts` — Chat IA

C'est la route la plus complexe. Elle fait le lien entre l'utilisateur et Claude.

**Deux modes de fonctionnement :**

**Mode streaming (par défaut)** :
```
Corps: { messages, locale, stream: true, ... }

Réponse: Server-Sent Events (SSE)
  data: {"chunk": "partie du texte"}    ← reçu en temps réel
  data: {"chunk": "..."}
  data: {"done": true, "finalResponse": "texte complet", "distressLevel": "none"}
```

**Mode non-streaming** :
```
Corps: { messages, stream: false }
Réponse: { response: "texte complet", distressLevel: "none" }
```

**Pipeline interne d'une requête chat :**
```
Message utilisateur
    ↓
guardrails.filterInput()    ← vérifie les sujets dangereux
    ↓ (si bloqué) → renvoie une réponse de sécurité
    ↓ (sinon)
claude.streamChat()         ← appelle l'API Anthropic
    ↓
guardrails.filterOutput()   ← nettoie la réponse
    ↓
ensureDisclaimer()          ← ajoute les mentions légales si nécessaire
    ↓
SSE → frontend
```

---

### `agent/src/safety/guardrails.ts` — Filtres de sécurité

**Filtre d'entrée (avant l'IA) :**

6 catégories bloquées automatiquement :

| Catégorie | Exemple de déclencheur | Action |
|---|---|---|
| `leverage_trading` | "10x", "margin trade" | Refus + explication |
| `perpetuals_options` | "perp", "futures contract" | Refus |
| `private_key_request` | "seed phrase", "12 words" | Alerte urgente |
| `guaranteed_returns` | "guaranteed 100% return" | Mise en garde arnaque |
| `tax_advice` | "minimize tax" | Redirect vers professionnel |
| `pyramid_scheme` | "MLM", "recruit friends" | Alerte arnaque |

**Nettoyage des données personnelles (PII) :**
Avant d'envoyer le message à Claude, les données sensibles sont supprimées :
- Numéros de téléphone
- Numéros de carte bancaire
- Adresses email (dans le texte)
- Numéros de sécurité sociale / CNI

**Filtre de sortie (après l'IA) :**
- Supprime les patterns de code exécutable des réponses
- Empêche Claude de générer des scripts dangereux

---

### `agent/src/llm/claude.ts` — Client IA

Ce fichier gère toute la communication avec l'API Anthropic.

**`buildSystemPrompt(ctx)`** :
Génère le prompt système à partir du template `system-prompt.md`.
Injecte les informations contextuelles : langue, tier utilisateur, score de risque.

**`streamChat(messages, ctx)`** :
Générateur asynchrone. Envoie les messages à Claude et yield les morceaux de texte
au fur et à mesure de leur réception.

**`chat(messages, ctx)`** :
Version non-streaming, attend la réponse complète.

**`detectDistress(text)`** :
Scan léger (regex) pour détecter des signaux de détresse :
- `'none'` : situation normale
- `'financial'` : difficulté financière
- `'emotional'` : stress émotionnel
- `'crisis'` : urgence (mots-clés de crise)

Si `'crisis'` est détecté, l'IA est instruite de fournir les numéros d'urgence
dans la langue de l'utilisateur.

---

### `agent/src/strategies/library.ts` — Catalogue DeFi

Définit les stratégies d'investissement disponibles.

**Stratégies actuellement disponibles :**

| ID | Protocole | APY estimé | Risque | Montant min |
|---|---|---|---|---|
| `kamino-usdc-main` | Kamino Finance | 4.5 – 8.5% | 1/5 | $5 |
| `marginfi-usdc` | MarginFi | 3.5 – 6.5% | 1/5 | $5 |

**Règle de sécurité** : `SAFETY_CEILING = 0.05` (5%)
Toute stratégie avec APY > 5% affiche automatiquement un avertissement de risque.

---

### `agent/src/risk/profiler.ts` — Profil de risque

Classe l'utilisateur en niveau de risque de 1 à 5 selon ses réponses :

| Score | Profil | Stratégies disponibles |
|---|---|---|
| 1 | Ultra-conservateur | Épargne USDC seulement |
| 2 | Conservateur | Lending USDC (Kamino / MarginFi) |
| 3 | Conservateur-modéré | Lending USDC + diversification légère |
| 4–5 | Non disponible en v1 | Bloqué, déblocable par modules futurs |

---

## 6. Frontend — le dossier `projet/`

```
projet/
├── src/
│   ├── App.jsx               ← Routeur principal + providers
│   ├── main.jsx              ← Point d'entrée React
│   ├── index.css             ← Styles globaux Tailwind
│   │
│   ├── lib/
│   │   ├── AuthContext.jsx      ← État global d'authentification (useAuth)
│   │   ├── LanguageContext.jsx  ← i18n EN/FR/ES (useLanguage, t(), switchLang)
│   │   ├── api.js               ← Client HTTP vers le backend (JWT auto)
│   │   ├── courseProgress.js    ← Progression + XP + Niveaux (localStorage)
│   │   ├── query-client.js      ← Configuration React Query
│   │   └── utils.js             ← Utilitaires (cn pour Tailwind)
│   │
│   ├── hooks/
│   │   ├── useSolana.js      ← Hook wallet Phantom/Solana
│   │   └── use-mobile.jsx    ← Détection mobile (breakpoint)
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx     ← Page de connexion (logo SHM)
│   │   ├── RegisterPage.jsx  ← Page de création de compte
│   │   ├── ForgotPasswordPage.jsx ← Réinitialisation par email
│   │   ├── ResetPasswordPage.jsx  ← Nouveau mot de passe via token
│   │   ├── EducationalHub.jsx← Skill tree gamifié (5 mondes, XP, quiz trilingue)
│   │   └── dashboard/
│   │       ├── DashboardLayout.jsx ← Sidebar + LanguageSwitcher + nav traduit
│   │       ├── Overview.jsx        ← Stats multilingues (isLessonRead correct)
│   │       ├── Education.jsx       ← Re-export de EducationalHub
│   │       ├── Platform.jsx        ← Logo SHM + MarketMonitor + LiFiWidget (i18n)
│   │       ├── AIChat.jsx          ← Chat IA streaming (lang depuis useLanguage)
│   │       └── Settings.jsx        ← Paramètres & déconnexion (multilingue)
│   │
│   ├── components/
│   │   ├── LanguageSwitcher.jsx    ← Boutons 🇬🇧 EN / 🇫🇷 FR / 🇪🇸 ES
│   │   ├── MarketMonitor.jsx       ← Surveillance SOL (prix, risque)
│   │   ├── VoiceFinanceCoach.jsx   ← Widget ElevenLabs ConvAI
│   │   ├── LiFiWalletWidget.jsx    ← Widget d'échange cross-chain
│   │   ├── WalletSelector.jsx      ← Sélecteur de portefeuille
│   │   └── ui/                     ← 30+ composants shadcn/ui
│   │
│   └── data/
│       └── coursesData.js     ← 5 mondes × 5 leçons, trilingue EN/FR/ES
│
├── vite.config.js            ← Config Vite (alias @/, proxy API)
├── package.json              ← Dépendances
└── index.html                ← HTML racine
```

---

### `projet/src/App.jsx` — Routeur principal

Ce fichier est le cœur du frontend. Il configure :

1. **Les Providers** (dans l'ordre d'imbrication, important) :
   - `LanguageProvider` : i18n EN/FR/ES — **doit être le plus externe**
   - `AuthProvider` : gère l'état de connexion global
   - `QueryClientProvider` : gère le cache des requêtes API (React Query)
   - `BrowserRouter` : active la navigation URL

2. **Les routes** :

| Route | Accès | Composant |
|---|---|---|
| `/login` | Public seulement | `LoginPage` |
| `/register` | Public seulement | `RegisterPage` |
| `/dashboard` | Connecté seulement | `DashboardLayout` |
| `/dashboard/education` | Connecté seulement | `Education` |
| `/dashboard/platform` | Connecté seulement | `Platform` |
| `/dashboard/chat` | Connecté seulement | `AIChat` |
| `/dashboard/settings` | Connecté seulement | `Settings` |
| `/` | Redirige | vers `/dashboard` |
| `/*` | Redirige | vers `/dashboard` |

3. **Les guards** :
   - `ProtectedRoute` : si non connecté → redirige vers `/login`
   - `PublicOnlyRoute` : si déjà connecté → redirige vers `/dashboard`

---

### `projet/src/lib/AuthContext.jsx` — Gestion de l'authentification

**Provider** qui expose ces valeurs à toute l'application via `useAuth()` :

| Valeur | Type | Description |
|---|---|---|
| `user` | `object \| null` | `{ id, email, name }` ou `null` si déconnecté |
| `isAuthenticated` | `boolean` | `true` si `user` n'est pas null |
| `isLoading` | `boolean` | `true` pendant la vérification initiale du token |
| `login(email, password)` | `async function` | Appelle `/api/auth/login`, stocke le token |
| `register(email, password, name)` | `async function` | Appelle `/api/auth/register` |
| `logout()` | `function` | Supprime le token, met `user` à null |

**Fonctionnement au chargement de la page :**
```
App démarre
    ↓
AuthContext lit localStorage.getItem('safehaven_token')
    ↓ (token trouvé)
Appelle GET /api/auth/me avec le token
    ↓ (succès) → user = profil chargé, isLoading = false
    ↓ (échec)  → supprime le token, user = null, isLoading = false
    ↓ (pas de token)
isLoading = false, user = null
```

---

### `projet/src/lib/api.js` — Client HTTP

Toutes les requêtes vers le backend passent par ce fichier.

**Architecture interne :**
```javascript
request(path, options)
    ↓
Récupère le token depuis localStorage
    ↓
Ajoute Header: Authorization: Bearer <token>
    ↓
fetch(BASE_URL + path)
    ↓ erreur HTTP → throw new Error(message du backend)
    ↓ succès      → retourne le JSON parsé
```

**`BASE_URL`** : vide en développement (le proxy Vite redirige `/api` → `localhost:3001`).
En production, mettre l'URL complète dans `VITE_AGENT_URL`.

---

### `projet/src/lib/LanguageContext.jsx` — Internationalisation

Système i18n maison sans dépendance externe.

**Hook :** `const { lang, t, switchLang } = useLanguage()`
**Langues :** `'en'` (défaut), `'fr'`, `'es'`
**Stockage :** `localStorage['shm_lang']`

```javascript
t('nav.overview')     // → 'Overview' / 'Vue d'ensemble' / 'Resumen'
t('edu.next_lesson')  // → 'Next lesson →' / 'Leçon suivante →' / 'Siguiente lección →'
switchLang('fr')      // change la langue partout dans l'app
```

**Clés disponibles :** `nav.*`, `common.*`, `edu.*`, `overview.*`, `settings.*`, `auth.*`, `voice.*`

**⚠️ Important :** `LanguageProvider` doit englober `AuthProvider` dans `App.jsx`.

---

### `projet/src/lib/courseProgress.js` — Suivi des cours + XP

Gère la progression et le système d'expérience.
**Tout est stocké dans `localStorage`** (côté navigateur, pas en base de données).

| Clé localStorage | Contenu |
|---|---|
| `safehaven_course_progress_v1` | JSON : `{ worldId: { lessonId: true } }` |
| `safehaven_course_quiz_scores_v1` | JSON : `{ worldId: { lessonId: score% } }` |
| `shm_xp` | XP total cumulé (string numérique) |

**Fonctions disponibles :**

| Fonction | Description |
|---|---|
| `isLessonRead(courseId, lessonId)` | La leçon a-t-elle été complétée ? |
| `markLessonRead(courseId, lessonId, read)` | Marque/démarque une leçon |
| `getCourseProgress(courseId)` | Retourne `{ completed, total }` |
| `setLessonScore(courseId, lessonId, scorePercent)` | Enregistre le score d'un quiz |
| `getLessonScore(courseId, lessonId)` | Retourne le score ou `null` |
| `getTotalXP()` | Retourne le total XP depuis localStorage |
| `addXP(amount)` | Ajoute des XP et sauvegarde |
| `getLevel()` | Retourne `{ level, name, xp, nextLevelXP }` |
| `isWorldUnlocked(worldIndex)` | World 0 = toujours libre, N = 5 leçons du précédent |

**Niveaux :**

| Niveau | Nom | XP requis |
|---|---|---|
| 1 | Novice | 0 |
| 2 | Apprentice | 200 |
| 3 | Saver | 500 |
| 4 | Investor | 1000 |
| 5 | DeFi Master | 2000 |

**⚠️ Ne pas utiliser `getCourseProgress().completed` dans Overview** —
utiliser `isLessonRead()` par leçon (getCourseProgress comptait mal les leçons non tentées).

---

### `projet/src/hooks/useSolana.js` — Wallet Solana

Hook qui interagit avec un portefeuille Solana (Phantom, Backpack, etc.)
via l'objet `window.solana` injecté par l'extension navigateur.

**Retourne :**

| Valeur | Description |
|---|---|
| `address` | Adresse publique connectée (string ou vide) |
| `isConnecting` | En cours de connexion |
| `isSigning` | En cours de signature de transaction |
| `connectSolana()` | Ouvre la popup du portefeuille pour se connecter |
| `disconnect()` | Déconnecte le portefeuille |
| `signAndSendTransaction(connection, tx)` | Signe une transaction |

> Si l'extension Phantom n'est pas installée, `connectSolana()` lance une erreur.

---

### `projet/src/components/MarketMonitor.jsx`

Affiche les données de marché Solana en temps réel.

**Source des données** : API CoinGecko (publique, sans clé).

**Ce qu'il affiche :**
- Prix SOL actuel
- Variation 24h
- Niveau de risque calculé : `low` / `medium` / `high`
- Volatilité estimée
- Solde de portefeuille (props)

**Logique de risque :**
```
variation < -10% → risque HIGH
variation < -4%  → risque MEDIUM
variation ≥ -4%  → risque LOW
```

**`onAutoSecure`** : callback prop déclenché quand l'utilisateur veut
convertir des SOL en USDC automatiquement (protection). En mode démo
(adresse commençant par `DEMO-`), simule la transaction sans l'exécuter.

---

### `projet/src/components/LiFiWalletWidget.jsx`

Intègre le widget officiel LI.FI pour les échanges cross-chain.

**Configuration** :
- Chaîne source : Solana
- Chaîne cible : Solana
- Token source : SOL
- Token cible : USDC
- Montant par défaut : 0.25 SOL

Le widget est monté dans un `createRoot()` isolé pour éviter les conflits
de styles avec l'application principale.

---

### `projet/src/components/VoiceFinanceCoach.jsx`

Charge le widget ConvAI d'ElevenLabs (un agent vocal IA) en bas à droite
de l'écran. Le script est chargé dynamiquement une seule fois.

L'`ELEVENLABS_AGENT_ID` est lu depuis `VITE_ELEVENLABS_AGENT_ID`.
Si non défini, un agent de démo par défaut est utilisé.

---

### `projet/src/data/coursesData.js`

Contenu statique de tous les cours. Structure :

```javascript
[
  {
    id: 'finance-basics',
    title: 'Notions de base en finance',
    description: '...',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Qu\'est-ce qu\'un budget ?',
        content: 'Texte de la leçon...',
        quiz: {
          question: 'Quelle est la règle des 50/30/20 ?',
          options: ['Réponse A', 'Réponse B', 'Réponse C', 'Réponse D'],
          correctIndex: 2
        }
      }
    ]
  }
]
```

---

## 7. Les pages de l'application

### Page Login — `/login`

**Fichier :** `projet/src/pages/LoginPage.jsx`

Formulaire de connexion avec :
- Champ email
- Champ mot de passe avec bouton afficher/masquer
- Gestion d'erreur inline (message d'erreur du backend affiché)
- Lien vers la page d'inscription
- Spinner pendant la requête

**Ce qui se passe quand on clique sur "Se connecter" :**
```
1. Appel: api.auth.login(email, password)
2. Backend vérifie: bcrypt.compare(password, hash)
3. Retourne: { token, user }
4. Frontend: localStorage.setItem('safehaven_token', token)
5. AuthContext: setUser(user)
6. Redirection vers /dashboard
```

---

### Page Register — `/register`

**Fichier :** `projet/src/pages/RegisterPage.jsx`

Formulaire de création de compte avec :
- Nom (optionnel)
- Email
- Mot de passe (min 8 caractères)
- Confirmation du mot de passe
- Validation côté client avant envoi au serveur

**Validations côté client :**
1. Mot de passe ≥ 8 caractères
2. Mot de passe = confirmation

**Si les validations passent :**
```
1. Appel: api.auth.register(email, password, name)
2. Backend: hash bcrypt, crée user dans users.json
3. Retourne: { token, user }
4. Frontend: stocke token, setUser, redirige vers /dashboard
```

---

### Dashboard Layout — `/dashboard`

**Fichier :** `projet/src/pages/dashboard/DashboardLayout.jsx`

C'est le contenant de toutes les pages du dashboard. Il affiche :

**Sidebar (bureau)** :
- Logo SafeHaven
- Navigation : Vue d'ensemble / Éducation / Plateforme / Coach IA / Paramètres
- Avatar + nom + email de l'utilisateur
- Bouton "Déconnexion"

**Header (mobile)** :
- Bouton hamburger pour ouvrir la sidebar en overlay
- Logo compact

Le contenu des pages est rendu dans `<Outlet />` (composant React Router qui
affiche la route enfant active).

---

### Page Overview — `/dashboard`

**Fichier :** `projet/src/pages/dashboard/Overview.jsx`

Tableau de bord principal. Affiche :

1. **Message de bienvenue** personnalisé avec le nom de l'utilisateur
2. **4 cartes statistiques** :
   - Leçons terminées (depuis `courseProgress.js`)
   - XP total (leçons × 50 points)
   - Progression cours (pourcentage)
   - Sessions IA (non implémenté = "—")
3. **3 actions rapides** (liens vers les autres pages)
4. **Bannière mission SafeHaven**

---

### Page Éducation — `/dashboard/education`

**Fichier :** `projet/src/pages/dashboard/Education.jsx` → re-export de `EducationalHub.jsx`

**Fichier principal :** `projet/src/pages/EducationalHub.jsx`

Page de type **skill tree gamifié**, inspirée des jeux vidéo. Fond `#060d1a`, style néon.

#### Structure des données (`coursesData.js`)

5 mondes × 5 leçons (4 normales + 1 boss) = **25 leçons**, tout trilingue EN/FR/ES :

| Monde | Thème | Accent couleur |
|---|---|---|
| world1 | 💰 Money Fundamentals | Amber |
| world2 | 🛡️ Protect Your Money | Cyan |
| world3 | ⛓️ Blockchain & Wallets | Violet |
| world4 | 🌾 DeFi & Yields | Emerald |
| world5 | 🌉 Bridge & Grow | Rose |

#### Layout
- **Sans leçon sélectionnée** : grille 1/2/3 colonnes
- **Avec leçon sélectionnée** : flex-row sur md+ (WorldMaps à gauche, panneau 400px à droite)
- **Mobile** : toujours empilé verticalement

#### Fonctionnalités quiz
- Bonne réponse : +XP complet + bouton **"Leçon suivante →"**
- Skip : +50% XP + bouton "Leçon suivante →"
- Mauvaise réponse : bouton Retry, pas de progression
- `key={lesson.id}` sur QuizSection → reset complet état entre leçons

#### Règles de déverrouillage
- World 1 : toujours accessible
- World N : déverrouillé quand les 5 leçons du World N-1 sont terminées
- Boss : déverrouillé quand les 4 leçons normales du monde sont terminées

#### Header XP
- Barre XP avec gradient bleu → cyan
- Badge niveau coloré (Novice gris → DeFi Master violet)
- Compteur leçons terminées / total

---

### Page Plateforme — `/dashboard/platform`

**Fichier :** `projet/src/pages/dashboard/Platform.jsx`

Affiche :
1. **Header** : logo Safe Haven Money + titre traduit (EN/FR/ES)
2. **MarketMonitor** : données de marché SOL en temps réel, bouton "Auto-Secure"
3. **LiFiWalletWidget** : widget d'échange SOL → USDC

En mode démo (pas de vrai wallet connecté), les transactions sont simulées.

---

### Page Coach IA — `/dashboard/chat`

**Fichier :** `projet/src/pages/dashboard/AIChat.jsx`

Interface de chat en temps réel avec "Coco", l'IA financière.

**Architecture de la communication :**
```
Utilisateur écrit un message
    ↓
sendMessage() est appelée
    ↓
fetch('POST /api/chat', { messages, stream: true, locale: 'fr' })
    ↓
Backend → filtre → Claude API (streaming)
    ↓
Réponse SSE reçue morceau par morceau
    ↓
Chaque "data: {"chunk": "..."}" met à jour le dernier message
    ↓
Quand "done: true" → message final affiché
```

**Affichage :**
- Messages utilisateur : bulle sombre, alignée à droite
- Messages Coco : bulle claire, alignée à gauche, rendu Markdown
- Animation de chargement (3 points) pendant le streaming
- Entrée + touche Enter pour envoyer

**Widget vocal** : ElevenLabs ConvAI affiché en bas à droite (si configuré).

---

### Page Paramètres — `/dashboard/settings`

**Fichier :** `projet/src/pages/dashboard/Settings.jsx`

Affiche :
1. **Profil** : nom et email (en lecture seule pour l'instant)
2. **Sécurité** : rappel que le mot de passe est haché avec bcrypt
3. **À propos** : description du projet SafeHaven
4. **Bouton déconnexion** : appelle `logout()` → efface le token → redirige vers `/login`

---

## 8. Sécurité — couches et mécanismes

```
COUCHE 1 — Transport
└── TLS/HTTPS en production (Nginx ou load balancer)
    └── Le backend ne doit jamais tourner en HTTP en production

COUCHE 2 — Headers HTTP (Helmet)
└── Content-Security-Policy : restreint les ressources externes
└── X-Frame-Options : empêche le clickjacking (iframe)
└── X-XSS-Protection
└── Strict-Transport-Security (HSTS)

COUCHE 3 — CORS
└── Liste blanche d'origines (CORS_ORIGINS dans .env)
└── Seules GET et POST autorisées
└── Header Authorization explicitement autorisé

COUCHE 4 — Rate Limiting
└── Global : 60 req/min (contre les bots)
└── Chat : 20 req/min (limite le coût Anthropic)

COUCHE 5 — Authentification JWT
└── Token signé avec JWT_SECRET (HMAC-SHA256)
└── Durée de vie : 7 jours
└── Stocké dans localStorage côté client
└── Vérifié sur chaque route protégée par requireAuth()

COUCHE 6 — Hashage des mots de passe
└── bcryptjs avec 12 rounds de sel
└── Le mot de passe en clair n'est JAMAIS stocké ni loggué
└── Compare via bcrypt.compare() (timing-safe)

COUCHE 7 — Validation des entrées (Zod)
└── Chaque route valide son corps avec un schéma Zod strict
└── Taille limite : 512 Ko par requête
└── Champs inconnus rejetés

COUCHE 8 — Filtres de sécurité IA (Guardrails)
└── PRÉ-IA : 6 catégories de sujets dangereux bloqués
└── PRÉ-IA : nettoyage des données personnelles (PII)
└── POST-IA : suppression des patterns de code exécutable
└── POST-IA : ajout automatique de disclaimers financiers

COUCHE 9 — Non-custodial par design
└── SafeHaven ne demande JAMAIS les clés privées
└── Les transactions sont signées dans l'extension wallet de l'utilisateur
└── Le backend ne construit pas de transactions signées
```

---

### Mots de passe — bcrypt expliqué

```
Inscription :
  password "monmotdepasse"
      ↓ bcrypt.hash(password, 12)
      ↓ 2^12 = 4096 itérations de hachage
  passwordHash "$2b$12$Xh9Kq8..."
      ↓ stocké dans users.json

Connexion :
  password "monmotdepasse" + hash stocké
      ↓ bcrypt.compare(password, hash)
      ↓ true / false
```

Même si `users.json` était volé, les mots de passe ne pourraient pas être retrouvés.

---

### JWT — Token expliqué

```
Structure d'un JWT :
  HEADER.PAYLOAD.SIGNATURE

  Header   : { "alg": "HS256", "typ": "JWT" }
  Payload  : { "userId": "uuid", "email": "...", "iat": 1718..., "exp": 1719... }
  Signature: HMAC-SHA256(header + payload, JWT_SECRET)

Vérification par le serveur :
  1. Décode le payload (lisible sans secret)
  2. Recalcule la signature avec JWT_SECRET
  3. Si les signatures correspondent → token valide
  4. Vérifie que exp (expiration) n'est pas dépassé
```

---

## 9. Flux de données expliqués

### Flux : Première visite

```
1. Navigateur charge http://localhost:5173
2. React démarre → App.jsx monte
3. AuthProvider vérifie localStorage.getItem('safehaven_token')
4. Pas de token → isLoading = false, isAuthenticated = false
5. Route "/" → redirige vers "/dashboard"
6. ProtectedRoute voit isAuthenticated = false → redirige vers "/login"
7. LoginPage s'affiche
```

### Flux : Connexion réussie

```
1. Utilisateur saisit email + mot de passe
2. LoginPage appelle login(email, password) depuis useAuth()
3. AuthContext appelle api.auth.login()
4. fetch POST /api/auth/login
5. Proxy Vite redirige vers http://localhost:3001/api/auth/login
6. Backend : LoginSchema.safeParse → findByEmail → bcrypt.compare
7. Succès → signToken → { token, user }
8. AuthContext : localStorage.setItem('safehaven_token', token)
9. AuthContext : setUser(user) → isAuthenticated = true
10. LoginPage : navigate('/dashboard')
11. ProtectedRoute voit isAuthenticated = true → affiche DashboardLayout
```

### Flux : Message IA (streaming)

```
1. Utilisateur tape dans AIChat et appuie Entrée
2. sendMessage() construit le tableau messages[]
3. fetch POST /api/chat { messages, stream: true, locale: 'fr' }
4. Backend : ChatRequestSchema.safeParse ✓
5. Backend : guardrails.filterInput() → message propre
6. Backend : claude.streamChat(messages, ctx)
7. Backend commence à recevoir des chunks d'Anthropic
8. Pour chaque chunk : res.write(`data: {"chunk":"..."}\n\n`)
9. Frontend : reader.read() en boucle
10. Chaque chunk : setMessages() met à jour le dernier message
11. L'utilisateur voit le texte apparaître en temps réel
12. Fin : `data: {"done":true, "finalResponse":"..."}` → message complet
```

### Flux : Rechargement de page (token existant)

```
1. Utilisateur recharge la page
2. AuthProvider monte → isLoading = true
3. localStorage contient 'safehaven_token'
4. Appel GET /api/auth/me (Authorization: Bearer <token>)
5. Backend : requireAuth() vérifie le JWT → valide
6. Backend retourne { id, email, name, createdAt }
7. AuthContext : setUser(profil) → isLoading = false
8. ProtectedRoute voit isAuthenticated = true → affiche le dashboard
```

---

## 10. Où chercher pour modifier quoi

### "Je veux changer le design de la page de connexion"

→ `projet/src/pages/LoginPage.jsx`
Utilise les composants `Button`, `Input`, `Label` de `components/ui/`.
Le fond est un dégradé Tailwind sur le `div` racine.

---

### "Je veux ajouter une nouvelle page au dashboard"

1. Créer `projet/src/pages/dashboard/MaPage.jsx`
2. Dans `projet/src/App.jsx`, ajouter la route :
   ```jsx
   <Route path="ma-page" element={<MaPage />} />
   ```
3. Dans `projet/src/pages/dashboard/DashboardLayout.jsx`, ajouter l'entrée dans `NAV` :
   ```javascript
   { to: '/dashboard/ma-page', label: 'Ma page', icon: IconLucide }
   ```

---

### "Je veux modifier les cours / ajouter une leçon"

→ `projet/src/data/coursesData.js`
Ajouter un objet dans le tableau. Structure :
```javascript
{
  id: 'mon-cours',
  title: 'Mon cours',
  description: '...',
  lessons: [
    {
      id: 'lecon-1',
      title: 'Titre',
      content: 'Texte...',
      quiz: { question: '...', options: ['A','B','C'], correctIndex: 0 }
    }
  ]
}
```

---

### "Je veux changer la personnalité de l'IA Coco"

→ `agent/src/llm/system-prompt.md`
Ce fichier Markdown définit complètement le comportement de l'IA :
sa personnalité, sa langue, ses limites, ses règles financières.

---

### "Je veux ajouter une nouvelle règle de sécurité IA"

→ `agent/src/safety/guardrails.ts`
Dans le tableau `BLOCKED_TOPICS`, ajouter :
```typescript
{
  name: 'nom_de_la_regle',
  pattern: /regex/i,
  response: 'Message de refus affiché à l\'utilisateur'
}
```

---

### "Je veux ajouter une nouvelle stratégie DeFi"

→ `agent/src/strategies/library.ts`
Ajouter un objet dans `STRATEGY_LIBRARY` en respectant l'interface `StrategyTemplate`.

---

### "Je veux ajouter un champ dans le profil utilisateur"

1. `agent/src/auth/users.ts` → ajouter le champ dans l'interface `User`
2. `agent/src/routes/auth.ts` → adapter `RegisterSchema` si nécessaire
3. `projet/src/pages/dashboard/Settings.jsx` → afficher le nouveau champ

---

### "Je veux mettre en production"

**Backend :**
```bash
cd agent
npm run build        # compile TypeScript → dist/
npm start            # lance dist/index.js
```

**Frontend :**
```bash
cd projet
npm run build        # génère dist/ (HTML/CSS/JS minifiés)
```
Servir le dossier `dist/` avec Nginx ou Vercel.

**Variables à changer pour la production :**
- `JWT_SECRET` : valeur longue et aléatoire (32+ caractères)
- `CORS_ORIGINS` : URL de votre domaine de production
- `NODE_ENV=production`
- `ANTHROPIC_API_KEY` : votre vraie clé Anthropic

---

## Résumé des dépendances clés

### Backend (`agent/package.json`)

| Package | Rôle |
|---|---|
| `express` | Serveur HTTP |
| `helmet` | Sécurité HTTP headers |
| `cors` | Politique CORS |
| `express-rate-limit` | Limitation de débit |
| `bcryptjs` | Hashage des mots de passe |
| `jsonwebtoken` | Génération et vérification JWT |
| `zod` | Validation des données entrantes |
| `@anthropic-ai/sdk` | Client officiel Claude |
| `axios` | Requêtes HTTP (vers ElevenLabs) |
| `dotenv` | Lecture du fichier .env |
| `tsx` | Exécution TypeScript sans compilation |

### Frontend (`projet/package.json`)

| Package | Rôle |
|---|---|
| `react` + `react-dom` | Interface utilisateur |
| `react-router-dom` | Navigation entre pages |
| `@tanstack/react-query` | Cache et gestion des requêtes |
| `tailwindcss` | Styles utilitaires CSS |
| `lucide-react` | Icônes SVG |
| `@radix-ui/*` | Composants accessibles (shadcn/ui) |
| `framer-motion` | Animations |
| `react-markdown` | Rendu Markdown dans le chat |
| `@lifi/widget` | Widget d'échange cross-chain |
| `@solana/web3.js` | Interaction blockchain Solana |
| `zod` | Validation côté client |

---

---

## Où chercher pour modifier la langue

### "Je veux ajouter une clé de traduction"

→ `projet/src/lib/LanguageContext.jsx`
Ajouter la clé dans les 3 objets `en`, `fr`, `es` :
```javascript
// Dans en:
'ma.cle': 'My text',
// Dans fr:
'ma.cle': 'Mon texte',
// Dans es:
'ma.cle': 'Mi texto',
```
Puis l'utiliser dans le composant avec `const { t } = useLanguage(); t('ma.cle')`

### "Je veux changer la langue par défaut"

→ `projet/src/lib/LanguageContext.jsx`, ligne `return 'en'` dans l'init state.

### "Je veux ajouter une nouvelle langue"

1. Ajouter l'objet de traduction dans `TRANSLATIONS` (LanguageContext.jsx)
2. Ajouter le code langue dans la validation : `['en', 'fr', 'es', 'xx'].includes(saved)`
3. Ajouter le bouton dans `LanguageSwitcher.jsx`

---

*Document mis à jour le 16 juin 2026 — Safe Haven Money v2.0*
