# SprintBoard — Gestion de Projet Agile

Application complète de gestion de projets agiles (Scrum/Kanban) avec assistant IA intégré.

## 📅 Période de développement

**Janvier 2025 → Juin 2026** (539 commits)

| Période | Activité |
|---------|----------|
| Jan 2025 | Initialisation du projet, structure Vite + React |
| Fév 2025 | Authentification, layout, navigation |
| Mar 2025 | Gestion des projets, tableaux Kanban |
| Avr 2025 | Drag & drop, vues tâches |
| Mai 2025 | Sprint planning, backlog |
| Juin 2025 | Chat temps réel |
| Juil 2025 | i18n FR/EN |
| Août 2025 | Mode sombre, thèmes |
| Sep 2025 | Calendrier, timeline |
| Oct 2025 | Notifications, recherche |
| Nov 2025 | Dashboard, analytics |
| Déc 2025 | Administration, permissions |
| Jan 2026 | Upload fichiers, pièces jointes |
| Fév 2026 | Messages vocaux |
| Mar 2026 | Intégration IA (GitHub Models) |
| Avr 2026 | Dashboard IA, recommandations |
| Mai 2026 | Icônes style ChatGPT, like/dislike |
| Juin 2026 | Finalisation, déploiement |

## 🚀 Fonctionnalités

- **Tableaux Kanban/Scrum** avec drag & drop
- **Gestion des sprints** et backlog
- **Chat en temps réel** avec salons (Général, Projets)
- **Assistant IA Graden IA** — posez des questions, générez des tâches
- **Messages vocaux** — enregistrement et lecture
- **Pièces jointes** — images, fichiers (glisser-déposer ou Ctrl+V)
- **Réactions** 👍👎 Like/Dislike, Copier, Supprimer sur chaque message
- **Dashboard analytique** avec métriques et recommandations IA
- **Mode sombre** 🌙
- **Internationalisation** 🇫🇷🇬🇧 (FR/EN)
- **Authentification** multi-utilisateurs
- **Recherche** globale dans les tâches et messages

## 🛠 Stack Technique

| Technologie | Utilisation |
|-------------|-------------|
| React 19 | UI |
| Redux Toolkit | État global |
| React Router v7 | Routing |
| Tailwind CSS v4 | Styles |
| Vite 7 | Build |
| Recharts | Graphiques |
| GitHub Models (gpt-4o-mini) | IA Graden IA |
| Lucide React | Icônes |
| date-fns | Dates |
| react-hot-toast | Notifications |

## 🔧 Installation

```bash
npm install
npm run dev
```

## 📦 Build

```bash
npm run build
npm run preview
```

## 🤖 Graden IA

L'assistant IA utilise **GitHub Models** (API gratuite) avec le modèle `gpt-4o-mini`.
Configurez votre token GitHub dans l'interface 🔑 de l'application.

## 🌐 Démo

Déployé sur GitHub Pages : `https://grandelagbanou28-gif.github.io/Application-de-gestion-de-projets-type-TrelloJira-/`

## 📄 Licence

MIT
