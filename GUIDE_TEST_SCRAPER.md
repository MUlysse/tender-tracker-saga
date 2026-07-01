# 🧪 Guide de Test du Scraper - Tender-Tracker SAGA

## Problème à Diagnostiquer

**Question** : Pourquoi Onoris Journal n'a pas déclenché d'alerte ?

**Réponses possibles** :
1. Le scraper ne s'est pas exécuté depuis l'ajout d'Onoris
2. Onoris n'a pas les mots-clés recherchés (comportement NORMAL)
3. Erreur du scraper lors du scan d'Onoris

---

## 🔬 Test #1 : Exécuter le Scraper Manuellement (Recommandé)

### Via GitHub Actions (Easiest)

```
1. Allez sur : https://github.com/YOUR_USERNAME/tender-tracker-saga/actions
   
2. Cliquez sur "Tender-Tracker SAGA - Scraper" (dans la liste de gauche)
   
3. Cliquez sur "Run workflow" (bouton blanc à droite)
   
4. Sélectionnez "main" branch
   
5. Cliquez "Run workflow"
   
6. Attendez 2-3 minutes
   
7. Cliquez sur le run en cours pour voir les logs
```

**Que vérifier dans les logs** :
```
✅ "Configuration:" affiche "Sources: 84" (83 + Test Admin)
✅ Ligne "Onoris Journal:" affiche "Aucune détection" ou "Aucun détection"
❌ Erreur de connexion = Onoris est peut-être hors ligne
```

### Via Terminal Local (Plus de Contrôle)

```bash
cd /c/Users/louis/Desktop/HALL9000/tender-tracker-saga

# Vérifier que Onoris est bien dans data.json
grep -i "onoris" docs/data.json

# Exécuter le scraper
python scripts/scraper.py

# Vérifier les résultats
cat docs/data.json | python -m json.tool | grep -A 10 "onoris"
```

---

## 📋 Test #2 : Vérifier la Structure de data.json

```bash
# Compter les sources
python -c "
import json
with open('docs/data.json') as f:
    data = json.load(f)
    print(f'Total sources: {len(data[\"sources\"])}')
    print(f'Total tenders trouvés: {len(data[\"tenders\"])}')
    
    # Chercher Onoris
    for source in data['sources']:
        if 'onoris' in source.get('country', '').lower():
            print(f'Onoris trouvé: {source}')
"
```

**Résultat attendu** :
```
Total sources: 84
Total tenders trouvés: 0 (ou plus si des détections existaient)
Onoris trouvé: {'region': 'Test Admin', 'country': 'Onoris Journal', ...}
```

---

## 🔍 Test #3 : Tester Directement le Scraper sur Onoris

```bash
# Télécharger la page Onoris et tester la détection
python -c "
import requests
from bs4 import BeautifulSoup

url = 'https://onoris-journal.com/'
try:
    response = requests.get(url, timeout=10)
    print(f'Status code: {response.status_code}')
    
    # Vérifier le contenu
    if response.status_code == 404:
        print('❌ La page retourne 404 (page inactive)')
    elif response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.get_text().lower()
        
        # Chercher des mots-clés BEPS
        keywords = ['beps', 'tax', 'fiscal', 'digital services']
        found = [kw for kw in keywords if kw in text]
        
        if found:
            print(f'✅ Mots-clés trouvés: {found}')
        else:
            print(f'❌ Aucun mot-clé détecté (comportement NORMAL pour un journal)')
            
except Exception as e:
    print(f'❌ Erreur de connexion: {e}')
"
```

---

## 📊 Test #4 : Vérifier la Fréquence du Scraper

```bash
# Afficher le prochain scan prévu
python -c "
from datetime import datetime, timedelta

# Heures de scan GitHub Actions (0h et 12h UTC)
now = datetime.utcnow()
scan_hours = [0, 12]

for hour in scan_hours:
    next_scan = datetime.utcnow().replace(hour=hour, minute=0, second=0, microsecond=0)
    if next_scan <= now:
        next_scan += timedelta(days=1)
    
    diff = (next_scan - now).total_seconds() / 3600
    print(f'Prochain scan: {next_scan.strftime(\"%Y-%m-%d %H:%M:%S UTC\")} (dans {diff:.1f}h)')
"
```

**Résultat** :
```
Prochain scan: 2026-07-02 00:00:00 UTC (dans 8.5h)
```

---

## 🛠️ Test #5 : Checklist de Diagnostic

**Cochez chaque test** :

```
[ ] Test #1 : Scraper exécuté manuellement
    - Status : ✅ SUCCÈS / ❌ ERREUR
    - Logs affichent "Onoris Journal" ?
    
[ ] Test #2 : Onoris présent dans data.json
    - Status : ✅ OUI / ❌ NON
    - URL correcte ?
    
[ ] Test #3 : Connexion à Onoris
    - Status : ✅ 200 OK / ⚠️ 404 / ❌ Erreur
    - Contient des mots-clés BEPS ?
    
[ ] Test #4 : Fréquence du scraper
    - Status : ✅ Toutes les 12h / ❌ Autre
    - Prochain scan dans combien de temps ?
```

---

## 📝 Résultats Attendus

### Scénario A : Onoris ne contient PAS de mots-clés BEPS
```
✅ NORMAL ET ATTENDU
- Scraper retourne 0 détection pour Onoris
- Status dans le tableau : "-" (vide)
- Raison : Onoris est un journal, pas un portail d'appels d'offres
```

### Scénario B : Onoris page inactive (404)
```
✅ DÉTECTÉ ET AFFICHÉ
- Scraper retourne une détection "404"
- Status dans le tableau : "Page inactive" (rouge)
- Raison : Erreur 404 ou contenu indisponible
```

### Scénario C : Onoris contient des mots-clés
```
✅ ALERTE GÉNÉRÉE
- Scraper retourne une détection avec mots-clés
- Status dans le tableau : "Offre" (vert)
- Raison : Contenu pertinent trouvé
```

### Scénario D : Erreur du scraper
```
❌ PROBLÈME À RÉSOUDRE
- Scraper crash ou timeout
- Logs GitHub Actions : erreur visible
- Solution : Vérifier la connectivité, timeout, etc.
```

---

## 🚀 Prochaines Actions

**Après avoir exécuté les tests** :

1. **Si Onoris = Scénario A** (pas de mots-clés) :
   ```
   ✅ Le système fonctionne correctement
   Onoris est un journal, n'a pas de mots-clés BEPS/DRM
   Aucune action nécessaire
   ```

2. **Si Onoris = Scénario B** (404) :
   ```
   ✅ Le système fonctionne correctement
   L'alerte "Page inactive" s'affiche
   Aucune action nécessaire
   ```

3. **Si Onoris = Scénario C** (alerte générée) :
   ```
   ✅ Le système fonctionne correctement
   Vérifier les mots-clés détectés dans data.json
   ```

4. **Si Onoris = Scénario D** (erreur) :
   ```
   ❌ Problème détecté
   Vérifier les logs GitHub Actions
   Contacter le support
   ```

---

**FIN DU GUIDE DE TEST**
