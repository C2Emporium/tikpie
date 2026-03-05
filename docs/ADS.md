# Intégration des bannières publicitaires (contenu adulte)

L’app affiche un emplacement bannière **300×250** tous les 5 swipes dans le flux. Sans configuration, un placeholder s’affiche. Dès que tu configures un réseau pub, les **vraies pubs** s’affichent.

---

## Réseaux compatibles (contenu adulte)

- **ExoClick** – bannières, iframe ou script async  
- **TrafficJunky** – souvent fourni en iframe ou tag  
- **JuicyAds**  
- **EroAdvertising**  
- **AdXpansion**  

Tu récupères un **zone ID** (et selon le réseau : une URL de script ou une URL d’iframe) dans le back-office du réseau, puis tu les renseignes dans `.env`.

---

## Option A – iframe (recommandé)

Convient à la plupart des réseaux (ExoClick, TrafficJunky, etc.) qui fournissent une URL d’iframe du type :

```text
https://a.xxx.com/iframe.php?idzone=TON_ZONE_ID&size=300x250
```

**Configuration :**

1. Ouvre `.env` à la racine du projet.
2. Ajoute (en remplaçant par **ta** zone et **ta** URL) :

```env
NEXT_PUBLIC_AD_IFRAME_URL=https://a.xxx.com/iframe.php?idzone=1234567&size=300x250
```

3. Redémarre le serveur (`npm run dev`).  
Les bannières 300×250 du flux utiliseront cette URL.

---

## Option B – script async (ExoClick)

Si ton réseau te donne un **script** + **zone ID** (comme ExoClick en mode async) :

1. Dans `.env` :

```env
NEXT_PUBLIC_AD_SCRIPT_URL=https://a.xxx.com/ads.js
NEXT_PUBLIC_AD_ZONE_ID=1234567
```

2. Remplace par l’URL du script et le zone ID fournis par ExoClick (ou équivalent).  
3. Redémarre l’app.

L’app injecte le script, affiche un bloc `<ins data-zoneid="...">` 300×250 et déclenche le « serve » après chargement du script.

---

## Où sont affichées les pubs ?

- **Emplacement** : dans le **flux vertical**, une **bannière 300×250** est insérée **tous les 5 swipes** (après les vidéos 5, 10, 15, etc.).
- **Comportement** : même slide full-screen que les vidéos, avec la bannière centrée.

---

## ExoClick – récupérer les tags

1. Connexion sur [ExoClick](https://www.exoclick.com/).
2. **Mon compte** → **Sites & Zones** → créer une zone (ou utiliser une existante).
3. Format **Banner**, taille **300×250**.
4. Choisir le type de tag :
   - **iFrame** : copier l’URL `https://...iframe.php?idzone=XXXX&size=300x250` → `NEXT_PUBLIC_AD_IFRAME_URL`.
   - **Asynchronous** : copier l’URL du script + le zone ID → `NEXT_PUBLIC_AD_SCRIPT_URL` et `NEXT_PUBLIC_AD_ZONE_ID`.

Tu peux ajouter des **tags** (mots-clés) pour cibler le type de contenu (ex. `&tags=keyword` dans l’iframe ou `data-keywords="keyword"` côté script si le réseau le gère).

---

## Sécurité

- Ne mets **jamais** de clé secrète (API key privée) dans une variable `NEXT_PUBLIC_*` : elles sont visibles dans le navigateur.
- Les variables utilisées ici sont uniquement : zone ID et URL de script/iframe, ce qui est normal pour des bannières côté client.
