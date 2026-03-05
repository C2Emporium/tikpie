# Guide UI & bonnes pratiques – Tikpie

## Logo

### Tailles recommandées (en pixels)

| Contexte        | Hauteur | Largeur   | Usage                    |
|-----------------|---------|-----------|--------------------------|
| **Header mobile** | **32 px** | auto      | Barre du haut (h-8)      |
| **Header desktop** | **40 px** | auto      | Barre du haut (h-10)     |
| **Favicon**     | **32 px** | **32 px** | Onglet navigateur        |
| **PWA / splash**| 192 px  | 192 px    | Ajout à l’écran d’accueil |

Le composant `Logo` utilise par défaut `h-8 md:h-10` (32 px / 40 px).  
Pour un logo seul (sans texte) : `<Logo showText={false} className="h-8" />`.

---

## Trucs & essentiels web app short-form

1. **Header fixe**  
   Toujours visible, fond semi-transparent (`bg-black/70 backdrop-blur-md`) pour garder le contenu lisible sur la vidéo.

2. **Barre de recherche**  
   - Centrée sur desktop, icône seule sur mobile (ouvre la page `/search`).  
   - Hauteur confortable : 36–40 px (h-9 / h-10).

3. **Bottom nav**  
   - 3–5 entrées max.  
   - Hauteur ~64 px (h-16) + `safe-area-inset-bottom` pour les encoches.  
   - État actif clair (couleur / graisse).

4. **Slides vidéo**  
   - Hauteur = viewport moins header et nav (`slide-height` en CSS) pour éviter que la vidéo soit cachée.  
   - Snap scroll pour un slide = un “écran”.

5. **Touch targets**  
   - Boutons / liens au moins 44×44 px pour le doigt.

6. **Dark mode**  
   - Thème sombre par défaut ; couleurs zinc pour hiérarchie (zinc-400, zinc-500, white).

7. **Performance**  
   - Lazy loading des vidéos (IntersectionObserver).  
   - Précharger uniquement la vidéo visible + la suivante.

8. **Safe areas**  
   - Classes `.safe-area-inset-top` et `.safe-area-inset-bottom` pour encoches et barre de statut.
