# ⚡ Quick Start - 5 Minutes pour Déployer

**Version express sans détails - Pour les experts!**

---

## 1️⃣ Clone ou Créez le Dépôt

```bash
# Option A: Créez nouveau dépôt
mkdir tender-tracker-saga
cd tender-tracker-saga
git init

# Option B: Clonez
git clone https://github.com/YOUR_USERNAME/tender-tracker-saga.git
cd tender-tracker-saga
```

---

## 2️⃣ Ajoutez les Fichiers

Copiez ces fichiers dans votre répertoire:

```
.github/workflows/scraper.yml
scripts/scraper.py
scripts/requirements.txt
scripts/generate_password_hash.py
docs/index.html
docs/data.json
.gitignore
README.md
```

---

## 3️⃣ Générez votre Hash SHA-256

```bash
python scripts/generate_password_hash.py
# Copiez le hash généré
```

---

## 4️⃣ Mettez à Jour index.html

Ligne 363:
```javascript
const PASSWORD_HASH = 'VOTRE_HASH_ICI';
```

Remplacez par votre hash copié à l'étape 3.

---

## 5️⃣ Poussez sur GitHub

```bash
git add .
git commit -m "Initial: Tender-Tracker SAGA"
git remote add origin https://github.com/YOUR_USERNAME/tender-tracker-saga.git
git push -u origin main
```

---

## 6️⃣ Activez GitHub Pages

1. **Settings** → **Pages**
2. **Source**: `main` branch, `/docs` folder
3. **Save**
4. Attendez 1-2 min

Accédez à: `https://YOUR_USERNAME.github.io/tender-tracker-saga/`

---

## 7️⃣ Test Login

- URL: `https://YOUR_USERNAME.github.io/tender-tracker-saga/`
- Mot de passe: Celui que vous avez hashé
- ✅ Vous êtes dedans!

---

## 8️⃣ [OPTIONNEL] Webhooks

### Discord
1. Serveur Discord → Webhooks → Créer
2. Copier l'URL
3. GitHub: **Settings** → **Secrets** → **Actions**
4. Ajouter:
   - `WEBHOOK_URL`: `https://discord.com/api/webhooks/...`
   - `NOTIFICATION_ENABLED`: `true`

### Slack
Même processus avec URL Slack

---

## 9️⃣ Test Scraper

**GitHub Actions:**
1. **Actions** → **Tender-Tracker SAGA - Scraper**
2. **Run workflow** → **Run workflow**
3. Attendez 2-5 min
4. ✅ Check mark vert = Success

**Ou local:**
```bash
python scripts/scraper.py
```

---

## 🔟 C'est Tout!

✅ **Tender-Tracker SAGA est LIVE!**

- Dashboard: `https://YOUR_USERNAME.github.io/tender-tracker-saga/`
- Scraping: Automatique toutes les 12h
- Notifications: Si webhook configuré
- Données: Sauvegardées dans `data.json`

---

## 🛠️ Personnalisations Rapides

### Changer Mots-Clés
Éditez `scripts/scraper.py` ligne 25-35:
```python
KEYWORDS = {
    'fr': ['votre_mot', 'autres_mots'],
}
```

### Changer Fréquence
Éditez `.github/workflows/scraper.yml`:
```yaml
# Toutes les 6 heures
- cron: '0 0,6,12,18 * * *'
```

### Ajouter Pays
Éditez `scripts/scraper.py`, dictionnaire `PROCUREMENT_SOURCES`

---

## 🆘 Problèmes Rapides

| Problème | Fix |
|----------|-----|
| Dashboard vide | Relancez scraper dans Actions |
| Login échoue | Vérifiez hash SHA-256 |
| GitHub Pages 404 | Settings → Pages: main, /docs |
| Scraper échoue | Vérifiez logs Actions |
| Pas de notif | `NOTIFICATION_ENABLED` = `true` |

---

## 📚 Docs Complètes

- **README.md** - Documentation détaillée
- **WEBHOOK_SETUP.md** - Webhooks expliqués
- **DEPLOYMENT_CHECKLIST.md** - Checklist complète

---

**Prêt? Lancez-vous! 🚀**

---

*Pour aide détaillée: Lisez README.md*
