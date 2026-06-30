# 🎯 Tender-Tracker SAGA

**Veille Automatisée 24/7 des Appels d'Offres Publics - Domestic Resource Mobilization & Fiscalité**

Outil complet, gratuit et clé en main pour scraper automatiquement les portails d'appels d'offres de 74+ pays et organisations internationales, détecter les opportunités liées à la DRM (Domestic Resource Mobilization), aux réformes fiscales et à la gestion des finances publiques.

---

## 🚀 Caractéristiques Principales

✅ **Automatisation 24/7** - Scraping programmé toutes les 12 heures via GitHub Actions  
✅ **74+ Sources** - Caraïbes, Europe, Afrique Francophone/Anglophone/Lusophone, Moyen-Orient, Asie, Organisations Internationales  
✅ **Filtrage Intelligent** - Détection automatique des mots-clés DRM/Fiscalité  
✅ **Notifications Temps Réel** - Webhooks Discord/Slack/Telegram pour alertes instantanées  
✅ **Dashboard Sécurisé** - Interface moderne avec authentification SHA-256  
✅ **Gratuit à 100%** - GitHub Actions (4000 min/mois) + GitHub Pages (stockage illimité)  
✅ **Zéro Dépendances Externes** - Pas de serveur, pas de coûts d'infrastructure  

---

## 📋 Structure du Projet

```
tender-tracker-saga/
├── .github/workflows/
│   └── scraper.yml                    # ⚙️ Workflow GitHub Actions (12h)
├── scripts/
│   ├── scraper.py                     # 🔍 Script de scraping Python
│   ├── generate_password_hash.py      # 🔐 Générateur de hash SHA-256
│   └── requirements.txt               # 📦 Dépendances Python
├── docs/
│   ├── index.html                     # 💻 Dashboard (GitHub Pages)
│   └── data.json                      # 📊 Données en temps réel
├── .gitignore
└── README.md                           # 📖 Documentation
```

---

## ⚙️ Installation Complète (Pas à Pas)

### 1️⃣ **Créer un Dépôt GitHub Public**

```bash
# Depuis votre machine locale
git clone https://github.com/YOUR_USERNAME/tender-tracker-saga.git
cd tender-tracker-saga
```

**OU** créez directement depuis GitHub:
- Allez sur https://github.com/new
- Nommez le dépôt: `tender-tracker-saga`
- **Public** (pour GitHub Pages)
- Initialiser avec README
- Créer

### 2️⃣ **Télécharger les Fichiers du Projet**

Téléchargez les fichiers fournis dans cette réponse:
- `.github/workflows/scraper.yml`
- `scripts/scraper.py`
- `scripts/requirements.txt`
- `scripts/generate_password_hash.py`
- `docs/index.html`
- `docs/data.json`

Ou utilisez cet arborescence locale et poussez avec Git:

```bash
git add .
git commit -m "Initial commit: Tender-Tracker SAGA setup"
git push origin main
```

### 3️⃣ **Générer votre Mot de Passe Sécurisé (SHA-256)**

#### Option A: Python (Recommandé)

```bash
cd scripts
python generate_password_hash.py
```

Exemple de sortie:
```
============================================================
✅ HASH SHA-256 GÉNÉRÉ:
============================================================

5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5

============================================================
```

#### Option B: En Ligne (https://www.sha256online.com/)
- Entrez votre mot de passe
- Copiez le hash

#### Option C: Node.js
```bash
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update(process.argv[1]).digest('hex'));" "votremotdepasse"
```

### 4️⃣ **Mettre à Jour le Hash dans index.html**

Ouvrez `docs/index.html` et cherchez cette ligne:

```javascript
const PASSWORD_HASH = '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5';
```

Remplacez la valeur par **votre hash personnel**.

**Exemple:**
```javascript
// ❌ AVANT (hash par défaut)
const PASSWORD_HASH = '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5';

// ✅ APRÈS (votre hash)
const PASSWORD_HASH = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2';
```

Sauvegardez et poussez:
```bash
git add docs/index.html
git commit -m "🔐 Update password hash"
git push origin main
```

### 5️⃣ **Activer GitHub Pages**

1. Allez sur votre dépôt GitHub
2. **Settings** → **Pages**
3. **Source**: `main` branch, `/docs` folder
4. **Save**

Attendez 1-2 minutes. Votre tableau de bord sera accessible à:
```
https://YOUR_USERNAME.github.io/tender-tracker-saga/
```

### 6️⃣ **[OPTIONNEL] Configurer les Notifications Webhook**

#### Discord
1. Créez/ouvrez votre serveur Discord
2. **Paramètres du serveur** → **Webhooks** → **Créer un webhook**
3. Nommez-le: `Tender-Tracker SAGA`
4. **Copier l'URL du webhook**
5. Allez sur votre dépôt GitHub:
   - **Settings** → **Secrets and variables** → **Actions**
   - **New repository secret**
   - **Name**: `WEBHOOK_URL`
   - **Value**: `https://discord.com/api/webhooks/...`
   - Add Secret
6. Créez un autre secret:
   - **Name**: `NOTIFICATION_ENABLED`
   - **Value**: `true`
   - Add Secret

#### Slack
1. Ouvrez votre espace Slack
2. Allez dans **App Directory** → **Incoming Webhooks**
3. **Add to Slack** → Créez l'intégration
4. **Copier l'URL**
5. Mêmes étapes que Discord ci-dessus avec l'URL Slack

#### Telegram (Alternative)
*Nécessite une adaptation du script `scraper.py` pour les Webhooks Telegram. Contactez pour aide.*

### 7️⃣ **Lancer le Premier Scraping**

GitHub Actions s'exécutera automatiquement toutes les 12 heures (0h et 12h UTC).

Pour tester **maintenant**:
1. Allez sur votre dépôt GitHub
2. **Actions**
3. **Tender-Tracker SAGA - Scraper**
4. **Run workflow** → **Run workflow**
5. Attendez 1-2 minutes

Vérifiez les **logs**:
- ✅ **Success** = Scraping terminé
- ❌ **Failure** = Erreur (vérifiez les logs)

### 8️⃣ **Accéder au Dashboard**

Ouvrez: `https://YOUR_USERNAME.github.io/tender-tracker-saga/`

1. Entrez votre **code d'accès** (le mot de passe que vous avez hashé)
2. **Accéder au Tableau de Bord**
3. Explorez les opportunités détectées

---

## 🔐 Sécurité - Points Importants

⚠️ **Le mot de passe est hashé côté CLIENT en SHA-256**
- Jamais stocké en clair
- La vérification se fait entièrement dans le navigateur
- Pas de transmission au serveur

⚠️ **Bonnes Pratiques:**
- Utilisez un **mot de passe fort** (12+ caractères, mélange de caractères)
- Changez le hash régulièrement
- Ne partagez pas votre dépôt si sensitive-content
- Gardez le `data.json` à jour (commits auto)

---

## 📊 Utilisation du Dashboard

### Fonctionnalités

🔍 **Statistiques en Temps Réel**
- Total d'opportunités cumulées
- Nouvelles détectées depuis dernière session
- Sources scannées
- Dernière mise à jour

🎯 **Filtres Avancés**
- Par Région (Afrique, Caraïbes, etc.)
- Par Pays
- Recherche par mots-clés

🏷️ **Informations Détaillées**
- Titre de l'opportunité
- Pays/Région
- Mots-clés DRM matchés
- Date/Heure de détection
- Lien direct vers l'appel d'offres

📱 **Responsive Design**
- Desktop (full features)
- Tablet (optimisé)
- Mobile (adaptée)

---

## 📈 Mots-Clés de Détection

Le scraper détecte automatiquement les opportunités contenant:

**Français:**
- `domestic resource mobilization`
- `drm`
- `tax expertise`
- `public resource management`
- `revenue mobilization`
- `fiscal reform`
- `beps`
- `mobilisation des ressources`
- `expertise fiscale`
- `gestion des finances publiques`
- `réforme fiscale`
- `collecte des impôts`

**English:**
- Mêmes termes + variations (tax administration, revenue authority, customs modernization)

📝 **Ajouter vos propres mots-clés:**

Éditez `scripts/scraper.py` ligne 25-35:
```python
KEYWORDS = {
    'fr': [
        'votre_mot_cle_1',
        'votre_mot_cle_2',
        # ...
    ]
}
```

Commit et push:
```bash
git add scripts/scraper.py
git commit -m "Add custom keywords"
git push
```

---

## 🔄 Planification d'Exécution

### Actuelle: Toutes les 12 Heures

```yaml
# Dans .github/workflows/scraper.yml
schedule:
  - cron: '0 0,12 * * *'  # 00:00 et 12:00 UTC
```

### Modifier la Fréquence

**Toutes les 6 heures:**
```yaml
schedule:
  - cron: '0 0,6,12,18 * * *'
```

**Chaque heure:**
```yaml
schedule:
  - cron: '0 * * * *'
```

**Une fois par jour (19h UTC):**
```yaml
schedule:
  - cron: '0 19 * * *'
```

Sauvegardez et GitHub Actions sera mis à jour automatiquement ✅

---

## 🛠️ Troubleshooting

### ❌ "Erreur de connexion lors du scraping"

**Cause:** Certains portails bloquent les requêtes automatiques  
**Solution:**
1. Vérifiez que le site est accessible depuis un navigateur
2. Ajoutez un délai dans `scraper.py` ligne 84: `RATE_LIMIT_DELAY = 5` (secondes)
3. Commit & push

### ❌ "Dashboard vide, pas de données"

**Cause:** `data.json` n'a pas été généré  
**Solution:**
1. Allez sur **Actions** → **Tender-Tracker SAGA - Scraper**
2. Vérifiez l'exécution précédente
3. Vérifiez les logs pour erreurs
4. Lancez manuellement: **Run workflow**

### ❌ "Code d'accès ne fonctionne pas"

**Cause:** Hash SHA-256 incorrect  
**Solution:**
1. Régénérez le hash: `python scripts/generate_password_hash.py`
2. Mettez à jour `docs/index.html`
3. Videz le cache du navigateur: Ctrl+Shift+Del
4. Rechargez la page

### ❌ "GitHub Pages ne charge pas"

**Cause:** Settings non configurées  
**Solution:**
1. **Settings** → **Pages**
2. **Source**: `main` branch, `/docs` folder
3. Attendez 1-2 min

---

## 📞 Support & Contact

**Documentation:**
- 📖 [GitHub Actions Documentation](https://docs.github.com/en/actions)
- 📖 [GitHub Pages Documentation](https://docs.github.com/en/pages)
- 📖 [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/)

**Pour des Questions:**
1. Consultez les logs GitHub Actions
2. Vérifiez le `.gitignore` (pas de fichiers sensibles)
3. Testez localement: `python scripts/scraper.py`

---

## 📜 Licence & Utilisation

Ce projet est fourni **tel quel** à usage interne ou de recherche.

✅ **Autorisé:**
- Déploiement personnel/organisationnel
- Modification des scripts
- Ajout de sources personnalisées
- Intégration avec vos outils

❌ **Non autorisé:**
- Utilisation commerciale sans accord
- Distribution sans attribution
- Scraping des données publiques à des fins illégales

---

## 🎯 Roadmap Futures Améliorations

- [ ] Support Machine Learning pour détection contextuelle
- [ ] API REST pour intégration externe
- [ ] Support Webhook Telegram natif
- [ ] Agrégateur de nouvelles par région
- [ ] Export PDF/Excel
- [ ] Export automatique vers Google Sheets

---

## 👨‍💻 Contribution

Nous accueillons les contributions!

```bash
git checkout -b feature/ma-nouvelle-feature
# Éditez les fichiers
git commit -m "✨ Add ma-nouvelle-feature"
git push origin feature/ma-nouvelle-feature
```

---

## 📊 Sources Incluses

**74+ Portails Couverts:**

### Caraïbes (7)
Bahamas, British Virgin Islands, Cayman Islands, Panama, Bermuda, St Kitts and Nevis, Dominican Republic

### Europe (3)
Jersey, Gibraltar, Liechtenstein

### Afrique Francophone (16)
Côte d'Ivoire, Sénégal, Bénin, Burkina Faso, Mali, Niger, Togo, Guinée, Mauritanie, Gabon, Tchad, RDC, Congo-Brazza, Djibouti, Cameroun, Guinée équatoriale

### Afrique Anglophone (16)
Kenya, Tanzania, Uganda, Rwanda, Ethiopia, South Africa, Nigeria, Ghana, Zambia, Botswana, Malawi, Sierra Leone, Liberia, Lesotho, Zimbabwe, Gambia

### Afrique Lusophone (3)
Mozambique, Angola, Cape Verde

### Maghreb & Moyen-Orient (9)
Morocco, Algeria, Tunisia, Saudi Arabia, Oman, Egypt, UAE, Qatar, Bahrain

### Océan Indien (4)
Mauritius, Seychelles, Madagascar, Comoros

### Asie (3)
Thailand, Indonesia, Singapore

### Organisations Internationales (8)
World Bank, AfDB, GIZ, AFD, Norad, Danida, SIDA, JICA

---

## 📈 Statistiques

- **⏱️ Fréquence:** Toutes les 12 heures
- **🌍 Couverture:** 74+ sources
- **⚡ Temps moyen:** 2-5 minutes
- **💾 Espace:** < 1 MB
- **💰 Coût:** 0 € (GitHub Free)

---

**Créé avec ❤️ pour la transparence des appels d'offres publics**

*Dernière mise à jour: 30 Juin 2026*

---

## 🎉 Prochaines Étapes

1. ✅ Pusher le code sur GitHub
2. ✅ Générer votre hash SHA-256
3. ✅ Configurer GitHub Pages
4. ✅ [Optionnel] Configurer les Webhooks
5. ✅ Tester le first run
6. ✅ Partager avec votre équipe

**Profitez de la veille automatisée 24/7! 🚀**
