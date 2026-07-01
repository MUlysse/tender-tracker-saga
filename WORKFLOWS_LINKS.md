# 📋 Flux des Liens - Tender Tracker SAGA

## Fonctionnement Simplifié

Vous pouvez maintenant utiliser Tender Tracker **sans userscript** ! Voici comment :

---

## ✅ Workflow Standard (RECOMMANDÉ)

### Sans Userscript Installé

```
1. Vous cliquez sur "Offre" ou "Page Inactive" dans le tableau
   ↓
2. Une page intermédiaire (launcher) s'ouvre
   ├─ Affiche le mot-clé détecté
   ├─ Vous donne l'instruction
   └─ Redirige vers le site cible
   ↓
3. Le site cible s'ouvre
   ↓
4. Vous appuyez sur Ctrl+F (ou Cmd+F sur Mac)
   ↓
5. Tapez le mot-clé affiché (ou copie-le)
   ↓
6. ✅ Le mot-clé est trouvé sur la page
```

**Avantage** : Simple, pas d'installation, pas de CORS, fonctionne partout

---

## 🚀 Workflow Avancé (Avec Userscript)

### Si vous installez Tampermonkey + le Userscript

```
1. Vous cliquez sur "Offre" ou "Page Inactive" dans le tableau
   ↓
2. Une page intermédiaire (launcher) s'ouvre avec instruction
   ↓
3. Le site cible s'ouvre (paramètre URL inclus)
   ↓
4. ✨ Le userscript détecte le mot-clé
   ├─ Lance automatiquement la recherche Ctrl+F
   ├─ Surligne le mot-clé EN JAUNE
   └─ Affiche un badge de confirmation
   ↓
5. ✅ Recherche et surlignage AUTOMATIQUES
```

**Avantage** : Complètement automatisé, plus besoin de faire Ctrl+F

---

## 📊 Comparaison

| Aspect | Sans Userscript | Avec Userscript |
|--------|---|---|
| Installation | ❌ Rien | ✅ 5 min (Tampermonkey) |
| Simplicité | ⭐⭐⭐⭐ Très simple | ⭐⭐⭐ Simple |
| Automatisation | ⭐⭐ Manuel (Ctrl+F) | ⭐⭐⭐⭐ Auto (Ctrl+F + surlignage) |
| Compatibilité | ✅ 100% | ✅ 99% (selon navigateur) |
| Fiabilité | ✅ Certaine | ✅ Certaine |

---

## 🛠️ Installation du Userscript (Optionnel)

Si vous voulez l'automatisation complète :

### Étape 1 : Installer Tampermonkey
- **Chrome/Edge** : https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobela
- **Firefox** : https://addons.mozilla.org/firefox/addon/tampermonkey/
- **Safari/Opera** : Voir https://www.tampermonkey.net/

### Étape 2 : Créer un nouveau script dans Tampermonkey

1. Cliquez sur l'icône Tampermonkey → "Créer un nouveau script"
2. Effacez le contenu par défaut
3. Collez le contenu de `userscript_highlight.js`
4. Sauvegardez (`Ctrl+S`)

### Étape 3 : Test

1. Cliquez sur "Offre" ou "Page Inactive" dans Tender Tracker
2. La page s'ouvre
3. Attendez 1 seconde
4. ✨ La recherche devrait se lancer automatiquement

---

## ⚙️ Détails Techniques

### Sans Userscript

**Paramètres URL envoyés** :
```
launcher.html?url=https://example.com&keyword=tax+reform
```

Le launcher affiche une page intermédiaire avec :
- Le mot-clé détecté
- Une instruction "Appuyez sur Ctrl+F"
- Un lien direct vers le site

### Avec Userscript

**Paramètres URL envoyés** :
```
https://example.com#tender-tracker-search:tax+reform
```

Le userscript :
1. Détecte le fragment `#tender-tracker-search:keyword`
2. Lance `window.find(keyword)` pour déclencher Ctrl+F
3. Essaie de surligner le mot-clé dans le DOM
4. Affiche un badge de confirmation

---

## 🔧 Dépannage

### Problème : Le mot-clé n'est pas trouvé sur la page

**Cause possible** : Le scraper a peut-être détecté le mot-clé dans le HTML source, mais pas dans le texte visible.

**Solutions** :
1. Cherchez des variations (pluriel, accent, majuscule)
2. Regardez le code source (F12 → Ctrl+F → cherchez)
3. Le site peut avoir changé depuis le scan

### Problème : Ctrl+F ne se lance pas automatiquement

**Cause possible** : Le userscript n'est pas activé ou le navigateur bloque les actions automatisées.

**Solutions** :
1. Vérifiez que Tampermonkey est ✅ activé
2. Vérifiez que le script est ✅ activé dans Tampermonkey
3. Essayez de rafraîchir la page
4. Utilisez le workflow manuel (appuyez sur Ctrl+F vous-même)

### Problème : Le userscript crée des effets de bord

**Cause possible** : Le userscript interfère avec le site.

**Solution** : Utilisez le workflow simple sans userscript - il fonctionne partout.

---

## 📝 Résumé

**Vous avez maintenant 2 options** :

### ✅ Option 1 : Simple (Recommandé pour la plupart)
- Aucune installation
- Cliquez sur un lien → Appuyez sur Ctrl+F
- Fonctionne sur 100% des sites

### ✅ Option 2 : Avancée (Pour power-users)
- Installez le userscript (5 min)
- Cliquez sur un lien → C'est automatique
- Recherche et surlignage en 1 clic

---

**Status** : ✅ Les deux workflows sont opérationnels
