# AGENTS.md — OUTBOUND SNIPER

> Design : lire `DESIGN_CONTRACT.md` ; les jetons du thème « Chamfer Paper & Ink » sont dans `public/tokens.css`, et rien d'autre ne définit le thème.

Règles générales : 250 lignes max par fichier, données dans `data/*.json`, tests obligatoires.

## Où lire
| Besoin | Fichier |
|---|---|
| Fonctionnement, configuration, structure | `README.md` (anglais), `docs/README.fr.md` (détail) |
| Pourquoi c'est construit ainsi, non-objectifs | `DECISIONS.md` |
| Ce qui marche, prochaine étape, feuille de route | `STATE.md` |
| Cadrage produit | `BRIEF.md`, `PRD.md` |
| Historique du nettoyage | `AUDIT.md` |

## Règles propres à l'app
1. **Rien ne simule un succès.** Un envoi, une vérification ou un contrôle qui ne peut pas conclure renvoie un échec ou `UNVERIFIED`, jamais « OK ».
2. **`VERIFIED` = preuve** (MX qui accepte la boîte et refuse une adresse aléatoire, ou Hunter `valid`). Voir ADR-005.
3. **Envoi = API Gmail uniquement** (`engine/google_oauth.js`). Pas de SMTP, pas de mot de passe d'application.
4. **Aucun secret vers le navigateur** : passer par `engine.publicConfig()` et `googleOAuth.publicStatus()`.
5. **Tout texte issu d'un CSV ou du serveur est échappé** avant `innerHTML` (`SniperUIHelpers.esc`) et dans les emails (`mail_composer.js`).
6. **Configuration** : défauts uniquement dans `data/config.example.json`, lecture via `engine/store.js`.
7. Mettre à jour `STATE.md` à la fin d'un chantier.

## Validation avant « terminé »
```bash
npm test
node scripts/check-lines.mjs
```
