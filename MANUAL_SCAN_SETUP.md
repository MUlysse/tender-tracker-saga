# 🚀 Configuration du Scan Manuel - Tender-Tracker SAGA

## Vue d'Ensemble

Le bouton "Scan Maintenant" permet de déclencher le scraper à la demande via GitHub Actions.

**Fréquence du scraper** : Toutes les heures (0 * * * *)  
**Scan manuel** : À la demande via le bouton ou GitHub UI

---

## Configuration Requise

### Option A : Via GitHub Token (Recommandé pour Production)

**Étape 1 : Générer un Personal Access Token GitHub**

1. Allez sur : https://github.com/settings/tokens
2. Cliquez "Generate new token" → "Generate new token (classic)"
3. Configurez les permissions :
   ```
   ✅ repo (Accès complet au dépôt)
   ✅ workflow (Gestion des actions)
   ```
4. Copiez le token (il ne s'affichera qu'une fois)

**Étape 2 : Stocker le Token Sécurièrement**

1. Allez sur : https://github.com/YOUR_USERNAME/tender-tracker-saga/settings/secrets/actions
2. Cliquez "New repository secret"
3. Nom : `GITHUB_DISPATCH_TOKEN`
4. Valeur : Collez le token généré

**Étape 3 : Mettre à Jour index.html**

Cherchez cette ligne dans le JavaScript (fonction `triggerManualScan()`) :
```javascript
'Authorization': `token YOUR_GITHUB_TOKEN`,
```

Remplacez par :
```javascript
'Authorization': `token ${sessionStorage.getItem('githubToken')}`,
```

Et configurez le token au login :
```javascript
// Dans la fonction handleLogin() après showDashboard()
sessionStorage.setItem('githubToken', 'YOUR_GITHUB_DISPATCH_TOKEN_HERE');
```

---

### Option B : Sans Token (Démo/Dev)

Si vous ne voulez pas configurer de tokens, le bouton affichera un message indiquant qu'il faut utiliser GitHub UI pour lancer le scan.

**Les utilisateurs peuvent lancer manuellement depuis** :
1. https://github.com/YOUR_USERNAME/tender-tracker-saga/actions
2. Cliquer "Tender-Tracker SAGA - Scraper"
3. Cliquer "Run workflow"

---

## Fonctionnement

### Scan Automatique
```
Toutes les heures à HH:00 (UTC)
↓
GitHub Actions exécute scraper.py
↓
Scrape 84 sources
↓
Détecte les mots-clés
↓
Commit les changements dans data.json
↓
Interface recharge automatiquement après 5 min
```

### Scan Manuel (Bouton)
```
Utilisateur clique "Scan Maintenant"
↓
Demande de confirmation
↓
GitHub Actions triggered via repository_dispatch
↓
Exécution immédiate du scraper
↓
Résultats dans 2-5 minutes
↓
Interface recharge automatiquement
```

---

## Affichage dans l'Interface

### Header
```
TENDER-TRACKER SAGA    Dernier Scan: 01/07 14:32    Prochain Scan: 23m 45s    [Scan Maintenant]
```

### Décompte
- Affiche le temps jusqu'au prochain scan automatique
- Format : "Xm Ys" (minutes et secondes)
- Se réinitialise après chaque scan

### Bouton "Scan Maintenant"
- **Normal** : Bleu, cliquable
- **En cours** : Gris, texte "Scan en cours..."
- **Après clic** : Attend 2-5 minutes, puis recharge les données

---

## Statut des Scans

### Récent (< 1 heure)
```
Prochain Scan: 47m 22s
Statut: ✅ À jour
```

### Venant de passer
```
Prochain Scan: 59m 45s
Statut: ✅ À jour (nouvelles données)
```

### Imminent
```
Prochain Scan: 1m 30s
Statut: ✅ À jour bientôt
```

---

## Logs et Debugging

**Vérifier les résultats d'un scan** :

1. Allez sur : https://github.com/YOUR_USERNAME/tender-tracker-saga/actions
2. Cherchez le run le plus récent
3. Cliquez pour voir les logs détaillés

**Logs attendus** :
```
Configuration:
  Sources: 84
  Tenders antérieurs: XX
  Mots-clés détection: 97

Scraping des portails (détection case-insensitive):
──────────────────────────────────────────────────
   Bahamas: 0 détection(s)
   British Virgin Islands: 1 détection(s)
   ...
   Onoris Journal: Aucune détection
──────────────────────────────────────────────────

RÉSULTATS:
  Total détections: 44
  Nouvelles opportunités: 5
  Portails avec détections: 12

💾 Données sauvegardées: 44 détection(s)

======================================================================
Scraping terminé avec succès
======================================================================
```

---

## Limitations et Remarques

### Quotas GitHub Actions
```
Forfait gratuit : 2000 min/mois
À 1 scan/heure  : 24h × 30 jours = 720 scans
Durée par scan  : ~4 minutes
Total           : ~2880 min/mois (dépasse le forfait)

⚠️ Solution: Passer à 2 scans/heure (12 scans/jour) ou payer pour plus de min
```

### Repository_dispatch Webhook
- Nécessite un token GitHub valide
- Maximum 300 requêtes par minute
- Délai d'exécution : quelques secondes

### Fréquence Actuelle
- **Scans automatiques** : Toutes les heures
- **Scans manuels** : À la demande
- **Prochain scan** : +1 heure depuis le dernier

---

## Configuration Recommandée

### Pour Production
```yaml
# scraper.yml
schedule:
  - cron: '0 0,6,12,18 * * *'  # 4 fois/jour (plus économe)
```

### Pour Développement
```yaml
# scraper.yml
schedule:
  - cron: '*/30 * * * *'  # Toutes les 30 minutes (pour tests)
```

### Pour Staging
```yaml
# scraper.yml
schedule:
  - cron: '0 * * * *'  # Toutes les heures (recommandé)
```

---

## Problèmes Courants

### Le bouton "Scan Maintenant" ne fonctionne pas
1. Vérifiez que le GITHUB_DISPATCH_TOKEN est configuré
2. Vérifiez l'URL du dépôt dans le code JavaScript
3. Vérifiez les permissions du token

### Le scan prend trop de temps
1. Certains portails répondent lentement
2. Timeout défaut : 30 minutes
3. Le scraper continue même si un portail timeout

### Les données ne se mettent pas à jour
1. Le commit & push peut échouer silencieusement
2. Vérifiez les logs GitHub Actions
3. Vérifiez les permissions du GITHUB_TOKEN

---

## Support et Aide

Pour plus d'informations :
- GitHub Actions Docs : https://docs.github.com/en/actions
- repository_dispatch : https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event

---

**FIN DE LA CONFIGURATION**
