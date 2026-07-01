# 🔍 Installation du Userscript - Surlignage Automatique

## Qu'est-ce que c'est?

Un **userscript** est un petit programme JavaScript qui s'exécute automatiquement dans votre navigateur. Celui-ci surligne les mots-clés détectés quand vous cliquez sur un lien depuis Tender Tracker.

---

## 📥 Installation (5 minutes)

### Étape 1: Installer Tampermonkey

**Chrome / Edge / Firefox / Opera** :
1. Allez sur https://www.tampermonkey.net/
2. Cliquez "Install" pour votre navigateur
3. Confirmez l'installation

**Safari** : Utilisez plutôt l'extension "Userscripts" (plus complexe, voir Safari ci-dessous)

---

### Étape 2: Importer le Userscript

#### Option A : Copier-coller (Recommandé)

1. Ouvrez Tampermonkey → Créer un nouveau script
2. **Effacez** tout le contenu par défaut
3. **Collez** le contenu de `userscript_highlight.js`
4. Appuyez `Ctrl+S` pour sauvegarder
5. Confirmez le nom du script

#### Option B : Importer directement

1. Ouvrez le fichier `userscript_highlight.js` avec un éditeur
2. Sélectionnez tout (`Ctrl+A`) et copiez (`Ctrl+C`)
3. Ouvrez Tampermonkey → Créer un nouveau script
4. Collez le contenu
5. Sauvegardez

---

## 🎯 Utilisation

### Flux Normal

```
1. Vous ouvrez Tender Tracker
2. Vous voyez le tableau avec les sources
3. Vous cliquez sur un lien d'une source qui a des mots-clés détectés
4. ✨ La page externe s'ouvre
5. ✨ Les mots-clés sont automatiquement surlignés en JAUNE
6. 🔍 Un badge "Tender Tracker" apparaît en haut à droite
```

### Exemple

```
Source : Bahamas
URL    : https://www.bahamas.gov.bs/tender-notices
Mots-clés détectés : ["tax reform", "fiscal policy"]

↓ Clic sur le lien ↓

La page Bahamas s'ouvre
"tax reform" est surligné en JAUNE
"fiscal policy" est surligné en JAUNE
Badge affiche : "🔍 Tender Tracker - 2 mot(s)-clé(s)"
```

---

## 🎨 Personnalisation

### Changer la couleur de surlignage

Dans le userscript, trouvez cette section :

```javascript
const highlightColor = '#FFFF00';      // Jaune
const backgroundColor = '#FFD700';     // Or
const borderColor = '#FFA500';         // Orange
```

Et modifiez les codes couleur :

| Couleur | Code |
|---------|------|
| 🔴 Rouge | #FF0000 |
| 🟢 Vert | #00FF00 |
| 🔵 Bleu | #0000FF |
| 🟡 Jaune | #FFFF00 |
| 🟠 Orange | #FFA500 |
| 🟣 Violet | #FF00FF |

### Exemple : Surlignage en vert

```javascript
const highlightColor = '#00FF00';      // Vert
const backgroundColor = '#90EE90';     // Vert clair
const borderColor = '#00AA00';         // Vert foncé
```

---

## ❓ Questions Fréquentes

### Q: Le userscript ne fonctionne pas

**Réponses possibles :**

1. **Vérifiez que Tampermonkey est activé**
   - Cliquez l'icône Tampermonkey en haut à droite
   - Vérifiez que le script est ✅ activé

2. **Vérifiez que vous cliquez depuis Tender Tracker**
   - Le surlignage ne fonctionne que si vous cliquez sur un lien du tableau
   - Le lien doit avoir des mots-clés détectés

3. **Vérifiez la console du navigateur**
   - Appuyez `F12` → Console
   - Cherchez des messages d'erreur rouge
   - Partagez l'erreur si problème

4. **Essayez de vider le cache**
   - Tampermonkey : Cliquez icône → Vérifier les mises à jour
   - Navigateur : `Ctrl+Shift+Delete` → Effacez le cache

---

### Q: Pourquoi un badge orange apparaît en haut à droite?

C'est normal ! Ce badge montre combien de mots-clés ont été surlignés. Il disparaît automatiquement après 10 secondes ou quand vous cliquez dessus.

---

### Q: Est-ce que ça fonctionne sur tous les sites?

**Oui, avec des limitations :**

✅ Fonctionne sur la plupart des sites publics
❌ Ne fonctionne PAS sur les sites qui bloquent les scripts (certains gouvernements)
❌ Ne fonctionne PAS sur les pages protégeant le PDF (scripts bloqués)

**Si un site bloque :** C'est une limite technique, pas un bug du userscript.

---

### Q: Les mots-clés restent surlignés quand je navigue?

Non, le surlignage fonctionne **uniquement** sur la première page ouverte depuis Tender Tracker. Si vous naviguez vers d'autres pages, le surlignage ne s'appliquera pas (c'est intentionnel).

---

## 🔐 Sécurité

### C'est sûr?

Oui ! Le userscript :

✅ Ne collecte aucune donnée
✅ Ne vous trace pas
✅ Ne modifie que l'affichage (pas la page réelle)
✅ Code ouvert et auditable
✅ Ne fonctionne que depuis Tender Tracker

### Données partagées

- Les mots-clés sont stockés **temporairement** dans localStorage
- Ils sont **supprimés** après surlignage
- Aucune donnée n'est envoyée à des serveurs externes

---

## 🐛 Dépannage

### Le surlignage s'applique à des sites non visés?

Si vous êtes allé sur plusieurs sites Tender Tracker, le flag peut persister. **Solution :** Nettoyez localStorage :

```javascript
// Dans la console (F12)
localStorage.clear();
```

### Je veux désactiver temporairement

Cliquez l'icône Tampermonkey → Désactivez le script pour ce site.

---

## 📝 Maintenance

### Mise à jour du userscript

Si vous modifiez les mots-clés dans Tender Tracker, le userscript se mettra à jour automatiquement (il lit depuis localStorage).

### Mise à jour de Tender Tracker

Si Tender Tracker change, le userscript peut avoir besoin d'être mis à jour. Vérifiez le fichier `userscript_highlight.js` pour les changements.

---

## 💡 Conseils

1. **Testez d'abord** sur un petit site pour vérifier le surlignage
2. **Activez la console** (F12) pour voir les logs
3. **Ajustez les couleurs** selon votre préférence
4. **Nettoyez localStorage** si ça semble glitchy

---

## 📞 Support

Si le userscript ne fonctionne pas :

1. Vérifiez la console (F12) pour les erreurs
2. Testez sur un site différent
3. Réinstallez Tampermonkey
4. Videz le cache du navigateur

---

**Status** : ✅ Prêt à l'emploi  
**Navigateurs** : Chrome, Firefox, Edge, Opera, Brave  
**Tampermonkey** : Version 4.0+

