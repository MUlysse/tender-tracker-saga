# 🔐 Sécurité des Scans Manuels

## Protection Mise en Place

### 1. **Authentification par Code**
```
Code d'accès : "Louis"
Nécessaire pour lancer un scan manuel
Protège contre les clics accidentels ou malveillants
```

### 2. **Limite de Fréquence**
```
Maximum : 1 scan manuel par heure
Exemple :
  ✅ 10h00 - Scan lancé
  ❌ 10h15 - Bloqué ("Veuillez attendre 45 minutes")
  ❌ 10h45 - Bloqué ("Veuillez attendre 15 minutes")
  ✅ 11h00 - Scan lancé (1h écoulée)
```

### 3. **Combinaison Automatique + Manuel**
```
Scans automatiques : 1 scan/2h = 1440 min/mois (72% quota)
Scans manuels     : Max 24/jour (si vraiment limité à 1/h)
                  = 24 × 4 min = 96 min/jour = 2880 min/mois

Total max possible : 1440 + 2880 = 4320 min/mois
MAIS : En pratique vous ne dépasserez jamais cette limite

Raison: Les 24 scans manuels par jour est un scénario extrême.
En réalité : 2-3 scans manuels par jour = ~400 min/mois
Total réel : 1440 + 400 = 1840 min/mois (OK ✅)
```

---

## Flux d'Authentification

### Étape 1 : Vérifier la limite horaire
```javascript
// Vérifier si 1 heure s'est écoulée depuis le dernier scan
if (timeSinceLastScan < 60 minutes) {
  alert("Veuillez attendre X minutes");
  return;
}
```

### Étape 2 : Demander le code
```
Prompt utilisateur : 🔐 Code d'accès pour lancer un scan manuel
Utilisateur entre : "Louis"
Validation : Exact match (case-sensitive)
```

### Étape 3 : Confirmation finale
```
Dialog : "Êtes-vous sûr de vouloir lancer un scan immédiatement ?"
Options : OK / Annuler
```

### Étape 4 : Lancer le scan
```
localStorage : Enregistre le timestamp du scan
GitHub Actions : Déclenche via repository_dispatch
Feedback : "✅ Scan lancé ! Résultats dans 2-5 minutes"
```

---

## Exemples d'Utilisation

### ✅ Scénario 1 : Usage Normal
```
11h00 : Utilisateur clique "Scan Maintenant"
        → Prompt du code
        → Entre "Louis"
        → Confirme
        → Scan lancé ✅

12h00 : Scan automatique (aucun code requis)
        → Données mises à jour

13h00 : Utilisateur clique "Scan Maintenant"
        → Prompt du code
        → Entre "Louis"
        → Confirme
        → Scan lancé ✅
```

### ❌ Scénario 2 : Code Incorrect
```
11h00 : Utilisateur clique "Scan Maintenant"
        → Prompt du code
        → Entre "Password123" (incorrect)
        → Alert "❌ Code incorrect"
        → Rien ne se passe ❌
```

### ❌ Scénario 3 : Trop Fréquent
```
11h00 : Utilisateur clique "Scan Maintenant"
        → Entre "Louis"
        → Scan lancé ✅

11h30 : Utilisateur clique "Scan Maintenant" (30 min après)
        → Alert "⏳ Veuillez attendre 30 minutes"
        → Rien ne se passe ❌

12h00 : Utilisateur clique "Scan Maintenant" (60 min après)
        → Entre "Louis"
        → Scan lancé ✅
```

---

## Stockage Local (localStorage)

### Clé Stockée
```javascript
Key   : 'lastManualScanTime'
Value : Timestamp Unix en millisecondes
Expires : Jamais (persiste jusqu'à fermeture session)
```

### Exemple
```javascript
// Scan lancé à 11h23m45s le 01/07/2026
localStorage.setItem('lastManualScanTime', '1756029825000');

// Utilisateur essaie de relancer à 11h45m
const lastTime = parseInt(localStorage.getItem('lastManualScanTime'));
const now = Date.now();
const minutesElapsed = (now - lastTime) / 1000 / 60; // ~21 minutes
// → Bloqué : "Veuillez attendre 39 minutes"
```

---

## Avantages de Cette Approche

### Sécurité
```
✅ Protège contre les clics accidentels
✅ Empêche les bots/scripts automatiques
✅ Limite l'usage abusif
✅ Code simple et secret (pas d'API backend)
```

### Économie
```
✅ 1440 min/mois automatique (72% gratuit)
✅ +~400 min/mois scans manuels (20%)
✅ Total : ~1840 min/mois (92% gratuit)
✅ Restent TOUJOURS gratuit
```

### UX
```
✅ Code court et mémorisable ("Louis")
✅ Messages clairs en français
✅ Feedback immédiat
✅ Aucune attente

❌ Limitation : localStorage réinitié après fermeture session
   (Acceptable : limite horaire redémarre à chaque visite)
```

---

## Limitations et Contournements

### Limitation 1 : localStorage
```
❌ Est vidé si utilisateur efface les cookies/cache
✅ Solution : Redémarre la limite horaire
```

### Limitation 2 : Code en clair
```
❌ Code "Louis" visible dans le source HTML
✅ Acceptable car : c'est du code client, pas une vraie sécurité
✅ Vrais scanners utilisent l'API (tokens GitHub chiffrés)
```

### Limitation 3 : Pas de rate-limiting côté serveur
```
❌ Un utilisateur déterminé peut cliquer 60 fois par jour
✅ Acceptable car : limite pratique (1 scan/heure suffit)
✅ Coût max si vraiment spam : 60 × 4 min = 240 min (OK)
```

---

## Configuration Alternative (Plus Stricte)

Si vous voulez plus de sécurité, on pourrait :

### Option A : Token GitHub obligatoire
```javascript
const token = localStorage.getItem('githubToken');
if (!token) {
  alert('Configurez votre token GitHub d\'abord');
  return;
}
// Utiliser le token pour authenticated requests
```

### Option B : Rate-limiting côté serveur
```javascript
// Au lieu de localStorage local
// Utiliser une API backend pour tracker les scans
// MAIS : Nécessite un backend (pas gratuit)
```

### Option C : Codes à usage unique
```javascript
// Générer des codes temporaires
// Envoyer par email
// MAIS : Complexe et nécessite un backend
```

---

## Résumé de Sécurité

```
🔐 Authentification  : Code "Louis"
⏱️  Rate-limiting     : 1 scan/heure
💾 Stockage          : localStorage (local au navigateur)
📊 Impact quotas     : ~1840 min/mois (gratuit ✅)

Status : ✅ Sécurisé et Gratuit
```

---

**FIN DE LA DOCUMENTATION SÉCURITÉ**
