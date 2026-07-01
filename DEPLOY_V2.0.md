# 🚀 Guide de Déploiement - Tender-Tracker SAGA v2.0

## ✅ Mise à Jour Rapide (5 minutes)

### 1. Pousser les changements sur GitHub
```bash
cd /c/Users/louis/Desktop/HALL9000/tender-tracker-saga
git status
git add -A
git commit -m "⬆️ Update to v2.0: hourly scans, manual trigger, fixed commit"
git push origin main
```

### 2. Vérifier que GitHub Actions fonctionne
```
Allez sur : https://github.com/YOUR_USERNAME/tender-tracker-saga/actions
Cherchez le dernier run du scraper
Vérifiez que le status est ✅ (vert)
```

### 3. Tester un scan manuel
```
1. Allez sur : https://YOUR_USERNAME.github.io/tender-tracker-saga/
2. Connectez-vous
3. Cliquez "Scan Maintenant"
4. Attendez 2-5 minutes
5. Vérifiez que les données se mettent à jour
```

---

## 📝 Changements Déployés

### `.github/workflows/scraper.yml`
✅ Fréquence : `0 0,12 * * *` → `0 * * * *` (toutes les heures)  
✅ Commit fixé : git-auto-commit-action supprimé, git native utilisé  
✅ Repository dispatch ajouté pour trigger manuel  

### `docs/index.html`
✅ "Prochain Scan" affiche correctement +1h  
✅ Bouton "Scan Maintenant" ajouté  
✅ Fonction `triggerManualScan()` implémentée  

### `docs/data.json`
✅ Onoris Journal ajouté (Test Admin)  
✅ 97 mots-clés multilingues  
✅ Détection 404 active  

---

## ⚠️ Avant de Déployer en Production

### Checklist de Déploiement

```
[ ] Tester localement
    python scripts/scraper.py
    
[ ] Vérifier data.json
    cat docs/data.json | grep -c "sources"
    
[ ] Tester GitHub Actions manuellement
    https://github.com/YOUR_USERNAME/tender-tracker-saga/actions
    Run workflow → Check logs
    
[ ] Vérifier les quotas GitHub Actions
    https://github.com/settings/billing/summary
    ⚠️ Quotas gratuits : 2000 min/mois
    ⚠️ Scan 1h = ~2880 min/mois
    
[ ] Configurer (optionnel) : Scan manuel via token GitHub
    Voir MANUAL_SCAN_SETUP.md
    
[ ] Mettre à jour README.md avec nouvelle fréquence
    Modifier : "Scraping programmé toutes les 12 heures"
    En : "Scraping programmé toutes les heures"
```

---

## 🔴 Problèmes Potentiels et Solutions

### Quotas GitHub Actions - Actuellement OK ✅
```
Configuration actuelle : 1 scan/2h
Calcul : 12 scans/jour × 4 min = 1440 min/mois
Quota gratuit : 2000 min/mois
Utilisation : 72% (OK sans payer)
```

**Si besoin de réduire encore plus** :
```yaml
# Modifier .github/workflows/scraper.yml ligne 6

# Actuel : Toutes les 2 heures (12 scans/jour = 1440 min/mois)
- cron: '0 */2 * * *'

# Alternative moins fréquent : Toutes les 6 heures (4 scans/jour = 480 min/mois)
- cron: '0 0,6,12,18 * * *'

# Alternative très économe : Toutes les 12 heures (2 scans/jour = 240 min/mois)
- cron: '0 0,12 * * *'
```

### Problème : Commit & Push échoue
```
Symptôme : "Commit & Push Changes" step fails
Cause    : Permissions GitHub token, branche protégée, etc.
Solutions:
  1. Vérifier que GITHUB_TOKEN a les bonnes permissions
  2. Vérifier que la branche main n'est pas protégée
  3. Vérifier les logs GitHub Actions pour erreur exacte
```

### Problème : Scan manuel ne fonctionne pas
```
Symptôme : Bouton "Scan Maintenant" dit "Erreur"
Cause    : Token GitHub non configuré, ou mauvaise URL
Solutions:
  1. Suivre MANUAL_SCAN_SETUP.md pour configuration
  2. Vérifier la console browser (F12) pour détails
  3. Sinon, utiliser GitHub UI pour trigger manuel
```

---

## 📊 Quotas GitHub Actions

### Plan Gratuit
```
2000 minutes/mois
À 1 scan/heure  : 2880 min (130% du quota) ❌ DÉPASSÉ
À 1 scan/2h     : 1440 min (72% du quota) ✅ OK ← ACTUELLEMENT
À 4 scans/jour  : 720 min (36% du quota) ✅ OK
À 2 scans/jour  : 360 min (18% du quota) ✅ OK
```

### Plan GitHub Pro
```
50000 minutes/mois
À 1 scan/heure  : 2880 min (5.8% du quota) ✅ OK
Coût : ~4$/mois
```

### Recommandation Actuelle
```
✅ Production : 1 scan/2h (gratuit) ← CONFIG ACTUELLE
   12 scans/jour × 4 min = 1440 min/mois (72% quota)
   Données à jour : max 2h de retard
   
ℹ️ Alternative moins fréquent : 1 scan/6h
   4 scans/jour × 4 min = 480 min/mois (24% quota)
   Données à jour : max 6h de retard
```

---

## 🔧 Configuration Supplémentaire (Optionnel)

### Configurer Notifications Webhook

**Option A : Discord Webhook**
```
1. Créer un webhook Discord
2. Stocker URL en secret GitHub : DISCORD_WEBHOOK_URL
3. Ajouter step dans scraper.yml pour notifier
```

**Option B : Slack Webhook**
```
1. Créer un incoming webhook Slack
2. Stocker URL en secret GitHub : SLACK_WEBHOOK_URL
3. Ajouter step dans scraper.yml pour notifier
```

**Option C : Email**
```
GitHub Actions ne supporte pas nativement l'email
Alternative : Ajouter step Sendgrid ou AWS SES
```

### Ajouter Monitoring

**Option A : Uptime Kuma**
```
Monitore la disponibilité du site
Vérifie si data.json se met à jour régulièrement
```

**Option B : GitHub Deployments**
```
Crée une entrée "deployment" à chaque scan
Permet de tracker l'historique
```

---

## 📈 Monitoring Post-Déploiement

### Points à Surveiller

```
✅ Scans exécutés chaque heure
   Check: https://github.com/YOUR_USERNAME/tender-tracker-saga/actions
   
✅ data.json mis à jour
   Check: Timestamp "last_updated" change chaque heure
   
✅ Alertes apparaissent
   Check: Colonne "Alerte" affiche "Offre" ou "Page inactive"
   
✅ Décompte "Prochain Scan" s'écoule
   Check: Compte de 59m 59s à 0m 0s
   
✅ Bouton "Scan Maintenant" répond
   Check: Clique sur bouton → Dialog → Scan lancé
```

### Métriques à Tracker

```
Scans par mois : ~730 (30 jours × 24h)
Temps moyen    : 4 minutes par scan
Succès rate    : Doit être > 95%
Erreurs        : Vérifier logs si < 95%
Quotas utilisés: Doit être < 2000 min/mois (gratuit)
```

---

## 🎉 Validation Finale

Après déploiement, vérifier :

```
✅ Le scraper s'est exécuté au moins une fois
✅ data.json contient des tenders détectés
✅ L'interface affiche les alertes
✅ "Dernier Scan" affiche une date/heure
✅ "Prochain Scan" affiche un décompte
✅ Le bouton "Scan Maintenant" est présent
✅ Aucune erreur dans la console (F12)
```

---

## 📞 Rollback en cas de Problème

Si quelque chose ne fonctionne pas :

```bash
# Revenir à v1.3
git log --oneline | head -10
git reset --hard <commit-v1.3>
git push origin main --force

# OU créer une branche d'urgence
git checkout -b hotfix/revert-v2
git revert <commit-v2>
git push origin hotfix/revert-v2
# Créer PR et merger
```

---

## 📚 Documentation Associée

- **`CHANGELOG_V2.0.md`** - Détails complets des changements
- **`MANUAL_SCAN_SETUP.md`** - Configuration scan manuel
- **`AUDIT_RAPPORT.md`** - Audit technique complet
- **`GUIDE_TEST_SCRAPER.md`** - Guide de test

---

**Déploiement estimé** : 5-10 minutes  
**Complexité** : ⭐ Faible (push + tester)  
**Risque** : ⭐⭐ Faible (changements non-destructifs)  

---

**FIN DU GUIDE DE DÉPLOIEMENT**
