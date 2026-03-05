# Tikpie – Plateforme Vidéo Short-Form (Vertical Scroll)

Application web mobile-first type TikTok : scroll vertical, vidéos plein écran, lazy loading, bannières pub tous les 5 swipes.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** (dark mode)
- **Prisma** (PostgreSQL, table `Video`)

## Démarrage

```bash
npm install
cp .env.example .env
# Renseigner DATABASE_URL dans .env
npx prisma generate
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Base de données

Table **Videos** (Prisma) : `id`, `url`, `title`, `likes`, `createdAt`, `updatedAt`.

Création des tables :

```bash
npx prisma migrate dev --name init
```

## Fonctionnalités

- Scroll vertical type TikTok (snap par slide)
- Chaque slide = vidéo plein écran (object-cover)
- Lazy loading des vidéos (IntersectionObserver)
- Tous les 5 swipes : placeholder bannière pub 300×250
- Dark mode (Tailwind, thème sombre)
- API `GET /api/videos` pour alimenter le feed depuis la BDD

## Déploiement gratuit (GitHub + Vercel)

Pour mettre l’app en ligne gratuitement avec GitHub : voir **[docs/DEPLOY.md](docs/DEPLOY.md)** (création du repo, Vercel, base Neon/Supabase, migrations).

## Structure

- `src/app/` – pages et layout
- `src/components/` – `VerticalFeed`, `VideoSlide`, `AdBanner`
- `src/lib/` – Prisma client, `buildFeedWithAds`, `ad-config`
- `prisma/schema.prisma` – schéma Video
