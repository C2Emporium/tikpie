# Mettre Tikpie en ligne gratuitement avec GitHub

Méthode recommandée : **GitHub** (code) + **Vercel** (hébergement gratuit) + **base de données gratuite** (Neon ou Supabase).

---

## 1. Préparer le projet sur GitHub

### Créer un dépôt

1. Va sur [github.com](https://github.com) → **New repository**.
2. Nom du repo : par ex. `tikpie`.
3. **Private** ou **Public** selon ton choix. Ne coche pas « Add a README » si tu as déjà un projet local.
4. Clique sur **Create repository**.

### Pousser ton code

Dans un terminal, à la racine du projet (`tikpie-app`) :

```bash
cd /Users/taylorwush/tikpie-app

git init
git add .
git commit -m "Initial commit – Tikpie"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/tikpie.git
git push -u origin main
```

Remplace `TON_USERNAME` et `tikpie` par ton compte GitHub et le nom du repo.

---

## 2. Base de données gratuite (obligatoire pour les vidéos)

Sur Vercel, le disque est éphémère : les fichiers uploadés dans `public/videos` **ne sont pas conservés**. Il faut une vraie BDD et, pour les vidéos, des URLs externes (voir plus bas).

### Option A – Neon (PostgreSQL gratuit)

1. Va sur [neon.tech](https://neon.tech) et crée un compte (gratuit).
2. **New Project** → donne un nom → **Create**.
3. Dans le dashboard, onglet **Connection** : copie l’URL de connexion (format `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).
4. Tu utiliseras cette URL comme `DATABASE_URL` sur Vercel (étape 4).

### Option B – Supabase (PostgreSQL gratuit)

1. Va sur [supabase.com](https://supabase.com) → **Start your project**.
2. Crée un projet, note le mot de passe de la base.
3. **Project Settings** → **Database** → **Connection string** → **URI** : copie l’URL.
4. Utilise-la comme `DATABASE_URL` sur Vercel.

---

## 3. Déployer sur Vercel (gratuit)

1. Va sur [vercel.com](https://vercel.com) → **Sign up** avec ton compte **GitHub**.
2. **Add New** → **Project**.
3. **Import** le repo `tikpie` (il apparaît si tu as connecté GitHub).
4. **Root Directory** : laisse par défaut (ou `./` si le repo = le projet Next.js).
5. **Framework Preset** : Vercel détecte Next.js.
6. **Environment Variables** : ajoute au minimum :

   | Name           | Value                    |
   |----------------|--------------------------|
   | `DATABASE_URL` | L’URL Neon ou Supabase   |

   Tu peux aussi ajouter tout de suite les variables de pub (voir `docs/ADS.md`) :

   - `NEXT_PUBLIC_AD_IFRAME_URL` ou  
   - `NEXT_PUBLIC_AD_SCRIPT_URL` + `NEXT_PUBLIC_AD_ZONE_ID`

7. Clique sur **Deploy**. Vercel build puis te donne une URL du type `https://tikpie-xxx.vercel.app`.

### Migrations Prisma

Au premier déploiement, les tables doivent exister. Deux possibilités :

- **Soit** tu as déjà fait `npx prisma migrate dev` en local et tu as un dossier `prisma/migrations`. Au build, le script exécute `prisma generate` ; pour appliquer les migrations sur la BDD de prod, exécute **une fois** en local :

  ```bash
  DATABASE_URL="ta_url_neon_ou_supabase" npx prisma migrate deploy
  ```

- **Soit** tu n’as pas encore de migrations : en local, avec `DATABASE_URL` pointant vers Neon/Supabase, fais :

  ```bash
  npx prisma migrate dev --name init
  git add prisma/migrations
  git commit -m "Add Prisma migrations"
  git push
  ```

  Puis sur la BDD de prod (même URL que sur Vercel) :

  ```bash
  DATABASE_URL="url_prod" npx prisma migrate deploy
  ```

---

## 4. Vidéos en production (important)

- Sur Vercel, **les uploads vers `public/videos` ne sont pas persistés** (environnement serverless).
- Pour une vraie app en ligne :
  - Héberge les vidéos ailleurs : **Cloudinary**, **Bunny.net**, **Vercel Blob**, etc.
  - Dans l’admin, au lieu d’uploader un fichier vers le serveur, tu enverrais le fichier vers ce service et tu enregistrerais dans la BDD l’**URL** retournée (champ `url` de la table `Videos`).

Pour tester tout de suite sans changer le code : ajoute en base des vidéos avec des `url` pointant vers des MP4 déjà en ligne ; le flux et les pubs fonctionneront, seul l’upload direct depuis l’admin ne stockera pas les fichiers sur Vercel.

---

## 5. Résumé du flux gratuit

| Élément        | Service gratuit   |
|----------------|--------------------|
| Code           | GitHub             |
| Hébergement    | Vercel             |
| Base de données| Neon ou Supabase  |
| Vidéos (fichiers) | À héberger ailleurs (Cloudinary, Bunny, etc.) |

Une fois le repo poussé et le projet Vercel connecté, chaque `git push` sur `main` déclenche un nouveau déploiement automatique.
