# 📍 STATE — OUTBOUND SNIPER STUDIO

Dernière mise à jour : 2026-09-29
Statut : 🟡 Base assainie (v2.0.0). Aucun envoi réel n'a encore été validé de bout en bout avec un compte Google.

---

## 🏁 Fonctionnel et testé (`npm test`, 26 tests)
- [x] Import CSV robuste (guillemets, `;` `,` tabulation, BOM), sans valeur inventée.
- [x] Vérification en cascade : syntaxe, typo, jetable, MX, sonde SMTP réelle avec détection catch-all. `VERIFIED` seulement sur preuve ; un refus lié à l'IP n'est pas lu comme « boîte inexistante ».
- [x] Hunter.io en option : vérification des adresses non prouvées, recherche d'adresse (Email Finder).
- [x] Recherche de format d'adresse (prenom.nom…), retenu seulement s'il est prouvé.
- [x] Envoi via l'API Gmail (OAuth2), MIME texte + HTML, en-tête `List-Unsubscribe`. Chemin d'envoi (refresh du jeton, 429) testé sur réseau simulé ; aucun envoi réel validé.
- [x] Contrôle avant envoi bloquant, quota journalier (simulation hors quota), cadence, horaires, coupe-circuit sur erreur Gmail fatale.
- [x] Suivi des clics signés (HMAC), passerelle VM autonome, synchronisation protégée par secret (refusée hors HTTPS).
- [x] Diagnostic DNS réel (MX, SPF, DKIM Google, DMARC ; panne DNS = « indéterminé », jamais « absent »), liens, SpamAssassin (Postmark, sans conformité par défaut en cas de panne).
- [x] API locale protégée (Host / Origin / Content-Type), aucun secret exposé, échappement HTML partout.

## 🎯 Prochaine étape
0. [ ] Relancer la vérification des listes existantes : les statuts attribués par l'ancien vérificateur sont remis à « À vérifier ».
1. [ ] Connecter le compte Google (voir README) et envoyer un email de test vers Mail-Tester.
2. [ ] Déployer `gateway/tracking_gateway.js` sur la VM (port 3001 par défaut, `PORT=` sinon), derrière HTTPS sur un sous-domaine, avec `TRACKING_SECRET`.
3. [ ] Simulation puis premier envoi réel sur une petite liste vérifiée.

## 🗺️ Feuille de route (non commencée)
| # | Chantier | Priorité | Note |
|---|---|---|---|
| 1 | Détection des rebonds et réponses (scope `gmail.readonly`) | Haute | Seul moyen réel de couper une campagne sur rebond 550 et d'arrêter les relances après réponse |
| 2 | Fiche contact : historique (envoyé, cliqué) | Basse | — |
| 3 | Plusieurs expéditeurs (alias Gmail « Envoyer en tant que ») | Basse | Nécessite `gmail.settings.basic` pour lister les alias réels |

## ⚠️ Limites connues
- Port 25 sortant souvent bloqué : sans Hunter.io, la plupart des adresses restent `UNVERIFIED`.
- Rebonds non détectés automatiquement (voir chantier 1).
- La file d'envoi vit en mémoire : après un redémarrage, relancer la campagne (les contacts `SENT` sont exclus).
- Le filtre anti-robots des clics est indicatif (basé sur le user-agent).
