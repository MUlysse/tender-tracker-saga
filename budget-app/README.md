# 💰 Budget Manager

Une application web simple et interactive pour gérer votre budget personnel.

## Fonctionnalités

- ✏️ **Édition en temps réel** - Modifiez les montants et voyez les totaux se mettre à jour instantanément
- 📊 **Catégories multiples** - Organisez vos dépenses et revenus en catégories
- 💾 **Sauvegarde locale** - Les données sont sauvegardées dans votre navigateur (localStorage)
- 📱 **Responsive** - Fonctionne sur tous les appareils
- ➕ **Ajout/suppression flexible** - Créez et supprimez les éléments selon vos besoins

## Utilisation

1. Ouvrez `index.html` dans votre navigateur
2. Modifiez les montants directement dans les champs
3. Utilisez les boutons "+ Ajouter" pour créer de nouveaux éléments
4. Les totaux se mettent à jour automatiquement

## Catégories

### Sorties (Dépenses)
- Dépenses mensuelles
- Autres sorties
- Dépenses à venir

### Entrées (Revenus)
- Ressources mensuelles
- Comptes courants
- Épargne

## Données

Les données sont sauvegardées dans `localStorage` de votre navigateur. Aucun serveur n'est nécessaire.

Pour exporter vos données, ouvrez la console et exécutez :
```javascript
console.log(localStorage.getItem('budgetData'))
```

## À venir

- Export/Import CSV
- Intégration GitHub pour la synchronisation
- Historique des modifications
