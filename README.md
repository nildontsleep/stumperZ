# StumperZ — révision de la piscine C Epitech

Site de révision interactif construit à partir des 12 PDF de la piscine (Day 01 → Day 12) :
diagnostic adaptatif, parcours « stumper demain » selon le temps disponible, cours par notion,
103 quiz, 56 exercices de code **compilés et testés dans le navigateur**, 5 simulations d'examen
d'une heure, statistiques et file de révision. Tout est stocké localement (IndexedDB), sans compte.

## Utiliser

- **Hors ligne** : `npm ci && npm run build`, puis ouvre `dist/stumperz.html` (un seul fichier, tout est dedans).
- **Développement** : `npm run dev`.
- **GitHub Pages** : le workflow `.github/workflows/pages.yml` publie le site (activer Settings → Pages → Source « GitHub Actions »).

## Comment le C est exécuté

Le compilateur est **wcc** ([tyfkda/xcc](https://github.com/tyfkda/xcc), MIT), compilé en WebAssembly
(`vendor/wcc/cc.wasm`, commit dans `vendor/wcc/XCC_COMMIT`), avec deux correctifs (`vendor/wcc/xcc-stumperz.patch`) :
`errno` correct pour `open` (ENOENT / EACCES) et un bug de repli de constantes 64 bits.
Le programme compilé tourne dans un Web Worker, sur un système de fichiers en mémoire (WASI minimal :
`src/runtime/wasi.ts`), sans réseau, arrêté après 2 s, sortie limitée à 64 Ko.

Différences avec Linux x86-64 (affichées dans le site) : pointeurs de 4 octets ; `long` réécrit en `long long`
dans le code de l'étudiant pour faire 64 bits ; un accès à NULL ne plante pas toujours ; messages d'erreur
au format `fichier(ligne)`.

## Contenu et validation

- `src/content/pdf.ts` : tout ce qui vient des PDF (règles, tâches, pages, prototypes, notes d'extraction).
- `src/content/` : notions, cours, exercices, quiz, examens, vidéos — des données, séparées de l'interface.
- `npm run validate` : compile chaque solution de référence avec wcc **et** gcc, vérifie que les sorties
  sont identiques, que chaque squelette compile mais échoue à au moins un test, que les questions
  « prédire la sortie » donnent réellement la sortie annoncée, et que toutes les références existent.
  Génère `src/content/generated/expected.json` (sorties attendues).
- `npm test` : tests unitaires du calcul des scores, du planificateur, des sauvegardes.
- `node tools/e2e/smoke.mjs dist/stumperz.html` : parcours complets dans Chromium (Playwright).

## Vidéos

Liens relevés dans l'index officiel de l'auteur (github.com/jasonchampagne/FormationVideo). YouTube n'était
pas accessible pendant la construction : durées et chapitres ne sont pas affichés car non vérifiés.
