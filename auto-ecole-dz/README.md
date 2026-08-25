# اختبار كود الطريق - Auto École DZ

Application de bureau (Windows, via Electron) pour s'entraîner à l'examen du code de la route en Algérie : questionnaire à choix multiple (QCM), en **arabe**, avec des panneaux de signalisation illustrés, et un écran de résultat final avec correction détaillée.

> ⚠️ Contenu pédagogique généraliste, préparé pour l'entraînement. Ce n'est pas une reproduction officielle des questions de la direction des transports — à utiliser comme complément de révision.

## Fonctionnalités

- Interface entièrement en arabe, RTL.
- Banque de 50 questions réparties en 5 catégories : إشارات المرور، الأولوية وقواعد المرور، السياقة الآمنة، الوثائق والتأمين، الميكانيك العامة.
- 23 panneaux de signalisation dessinés en SVG (aucune image externe, tout est embarqué dans l'app).
- Choix du nombre de questions, de la catégorie, du seuil de réussite (%), et d'un minuteur optionnel.
- Écran de résultat avec score, pourcentage, réussite/échec, et bouton « مراجعة الإجابات » pour revoir chaque question avec l'explication.
- Fonctionne 100% hors-ligne, aucune connexion internet requise une fois installée.

## Développement

```bash
npm install
npm start        # lance l'application en mode développement
```

## Générer le fichier .exe (Windows)

```bash
npm run dist:win
```

Les fichiers générés se trouvent dans `dist/` :
- `اختبار السياقة DZ Setup 1.0.0.exe` — installeur (recommandé pour un utilisateur final).
- `اختبار السياقة DZ 1.0.0.exe` — version portable (aucune installation, un seul fichier .exe).

### Construire depuis Linux/macOS

`electron-builder` doit exécuter un utilitaire Windows (`rcedit`) pour finaliser l'exécutable. Sous Linux, cela nécessite **Wine** :

```bash
# Ubuntu/Debian
sudo dpkg --add-architecture i386
sudo apt-get update
sudo apt-get install -y wine wine32 wine64 libgd3
npm run dist:win
```

Sous Windows, `npm run dist:win` fonctionne directement sans dépendance supplémentaire.

Un workflow GitHub Actions (`.github/workflows/build-windows.yml`) est aussi fourni : il construit automatiquement le `.exe` sur un runner Windows à chaque push, sans rien installer localement (voir l'onglet **Actions** du dépôt, puis récupérer le fichier dans les **Artifacts** du run).

## Ajouter ou modifier des questions

Toutes les questions sont dans `data/questions.js`. Chaque entrée suit ce format :

```js
{
  id: 51,
  category: 'panneaux', // panneaux | priorite | securite | documents | mecanique
  sign: 'stop',          // optionnel : clé d'une icône définie dans data/signs.js
  text: 'نص السؤال بالعربية؟',
  options: ['اختيار أ', 'اختيار ب', 'اختيار ج', 'اختيار د'],
  correct: 0,             // index (0 à 3) de la bonne réponse
  explain: 'شرح مختصر للإجابة الصحيحة.'
}
```

Pour ajouter un nouveau panneau, ajoutez une clé SVG dans `data/signs.js` puis référencez-la via `sign: 'maCle'`.

## Structure du projet

```
auto-ecole-dz/
├── main.js            # processus principal Electron
├── preload.js         # pont sécurisé (contextIsolation)
├── index.html          # interface (arabe, RTL)
├── style.css
├── renderer.js         # logique du quiz (aucune dépendance externe)
├── data/
│   ├── questions.js    # banque de questions
│   └── signs.js        # icônes SVG des panneaux
└── package.json        # config electron-builder (cible Windows: nsis + portable)
```
