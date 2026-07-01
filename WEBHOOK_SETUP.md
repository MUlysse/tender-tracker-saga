# 🔔 Configuration des Webhooks - Guide Complet

Recevez des notifications **instantanées** quand une nouvelle opportunité est détectée!

---

## 🎯 Avant de Commencer

- ✅ Dépôt GitHub configuré
- ✅ `scraper.py` et workflow actifs
- ✅ Accès Discord/Slack/Telegram (selon choix)

---

## 🔗 Option 1: Discord Webhook

### Étape 1: Créer un Serveur Discord (si nécessaire)

1. Allez sur [discord.com](https://discord.com)
2. **+ Créer un serveur** (onglet gauche)
3. Nommez: "Tender-Tracker SAGA" (exemple)
4. Créer

### Étape 2: Créer un Webhook Discord

1. **Paramètres du serveur** (engrenage) → **Intégrations**
2. **Webhooks** → **Créer un Webhook**
3. Remplissez:
   - **Nom**: `Tender-Tracker SAGA`
   - **Canal**: Créez un nouveau canal `#tenders` ou choisissez un existant
   - **Avatar**: (optionnel) Importez un logo
4. **Copier l'URL du Webhook**

**URL Exemple:**
```
https://discord.com/api/webhooks/123456789/XXXXXXXXXXXXXXXXXXXXX
```

### Étape 3: Ajouter le Secret à GitHub

1. Allez sur votre dépôt: `https://github.com/YOUR_USERNAME/tender-tracker-saga`
2. **Settings** → **Secrets and variables** → **Actions** (dans la barre latérale gauche)
3. **New repository secret**

Ajoutez **2 secrets**:

#### Secret #1: WEBHOOK_URL
- **Name**: `WEBHOOK_URL`
- **Value**: Collez l'URL Discord complète
- **Add secret**

#### Secret #2: NOTIFICATION_ENABLED
- **Name**: `NOTIFICATION_ENABLED`
- **Value**: `true`
- **Add secret**

### Étape 4: Test

1. Allez à **Actions** → **Tender-Tracker SAGA - Scraper**
2. **Run workflow** → **Run workflow**
3. Attendez 1-2 minutes
4. Allez sur votre canal Discord `#tenders`
5. Vérifiez que les notifications arrivent ✅

**Message Discord Attendu:**
```
🎯 1 NOUVELLE OPPORTUNITÉ DÉTECTÉE

📌 Kenya - Public Resource Management Initiative
🔗 https://www.treasury.go.ke/...
Mots-clés détectés: domestic resource mobilization, drm
Détecté le 30/06/2026 12:45:30 UTC
```

### Personnalisation Discord

**Modifier le format du message:**

Éditez `scripts/scraper.py` ligne 270-290:

```python
# Discord Embed Colors:
# 3066993 = Vert ✅
# 15158332 = Rouge ❌
# 15105570 = Orange ⚠️
# 3447003 = Bleu 💙

'color': 3066993,  # Vert
```

---

## 🔗 Option 2: Slack Webhook

### Étape 1: Créer une Appli Slack

1. Allez sur [api.slack.com/apps](https://api.slack.com/apps)
2. **Create New App** → **From scratch**
3. **App Name**: `Tender-Tracker SAGA`
4. **Workspace**: Sélectionnez votre workspace Slack
5. **Create App**

### Étape 2: Activer les Webhooks Entrants

1. Allez à **Incoming Webhooks** (gauche)
2. **Activate Incoming Webhooks** → Toggle ON
3. **Add New Webhook to Workspace**
4. Sélectionnez le canal: `#tenders` (ou créez-le)
5. **Allow**
6. **Copier l'URL du Webhook**

**URL Exemple:**
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

### Étape 3: Ajouter le Secret à GitHub

Identique à Discord:
1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
   - **Name**: `WEBHOOK_URL`
   - **Value**: URL Slack complète
3. **Add secret**
4. Créez un second secret:
   - **Name**: `NOTIFICATION_ENABLED`
   - **Value**: `true`

### Étape 4: Test

Même procédure que Discord.

**Message Slack Attendu:**
```
🎯 1 NOUVELLE OPPORTUNITÉ DÉTECTÉE

📌 Ethiopia - GIZ Tax Expertise RFP
🔗 https://www.giz.de/...
Mots-clés détectés: tax expertise, fiscal reform
Détecté le 30/06/2026 12:45:30 UTC
```

---

## 🚀 Option 3: Telegram Webhook (Avancé)

Telegram nécessite une approche légèrement différente (bot + webhook).

### Étape 1: Créer un Bot Telegram

1. Ouvrez Telegram
2. Cherchez: `@BotFather`
3. Envoyez: `/newbot`
4. Suivez les instructions
5. **Copiez le Token**: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

### Étape 2: Modifier scraper.py

Ajoutez cette fonction à la fin du fichier `scraper.py`:

```python
def send_telegram_notification(new_tenders):
    """Envoie des notifications Telegram"""
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    
    if not token or not chat_id:
        return
    
    for tender in new_tenders:
        message = f"""
🎯 NOUVELLE OPPORTUNITÉ
🏙️ {tender['country']}
📌 {tender['title'][:100]}
🔗 {tender['url']}
⏰ {tender['detected_at']}
        """
        
        requests.post(
            f'https://api.telegram.org/bot{token}/sendMessage',
            json={
                'chat_id': chat_id,
                'text': message,
                'disable_web_page_preview': False
            }
        )
```

### Étape 3: Ajouter les Secrets GitHub

1. **Settings** → **Secrets and variables**
2. Ajoutez:
   - `TELEGRAM_BOT_TOKEN`: Votre token BotFather
   - `TELEGRAM_CHAT_ID`: Votre chat ID Telegram
   - `NOTIFICATION_ENABLED`: `true`

---

## 🔍 Debugging Webhooks

### Le webhook ne fonctionne pas?

1. **Vérifiez les logs GitHub Actions**:
   - Allez à **Actions** → dernier run
   - Scroll down jusqu'à "Run Scraper"
   - Cherchez: `📬 notification(s) envoyée(s)`

2. **Vérifiez les secrets**:
   ```bash
   # Dans GitHub Actions logs:
   # ✅ Si webhook configuré
   # ⏳ Si disabled (NOTIFICATION_ENABLED = false)
   # ❌ Si URL invalide
   ```

3. **Test manuel local**:
   ```bash
   export WEBHOOK_URL="https://discord.com/api/webhooks/..."
   export NOTIFICATION_ENABLED="true"
   python scripts/scraper.py
   ```

4. **Vérifiez l'URL du Webhook**:
   - Discord: Commence par `https://discord.com/api/webhooks/`
   - Slack: Commence par `https://hooks.slack.com/services/`
   - Pas d'espace ou caractères spéciaux

---

## 🛡️ Sécurité des Webhooks

⚠️ **Bonnes Pratiques:**

- ✅ Gardez les URLs **privées** (secrets GitHub)
- ✅ Régénérez les webhooks tous les **6 mois**
- ✅ Limitez les **permissions du canal** (read-only si possible)
- ✅ N'envoyez pas de données **sensibles** dans les notifications
- ✅ Utilisez des **canaux privés** pour les données confidentielles

---

## 📊 Exemples de Notifications

### Notification Discord
```
🎯 **2 NOUVELLES OPPORTUNITÉS DÉTECTÉES**

📌 World Bank - DRM Modernization Support (Laos)
🔗 [Link](https://worldbank.org/...)
Mots-clés: domestic resource mobilization, drm

📌 GIZ Germany - Tax Expertise RFP (Ethiopia)
🔗 [Link](https://giz.de/...)
Mots-clés: tax expertise, fiscal reform
```

### Notification Slack
```
🎯 1 NOUVELLE OPPORTUNITÉ DÉTECTÉE
📌 Kenya - Revenue Authority Modernization
🔗 https://treasury.go.ke/...
⏰ Détecté le 30/06/2026 12:45:30 UTC
```

---

## 🔄 Modifier la Fréquence des Webhooks

Par défaut, les notifications ne s'envoient que s'il y a **nouvelles opportunités**.

Vous pouvez modifier `scraper.py` pour:

1. **Toujours notifier** (même sans nouveauté):
```python
# Ligne 290
# Avant:
if new_tenders:
    send_webhook_notification(new_tenders)

# Après:
send_webhook_notification(all_tenders)  # Envoie tout
```

2. **Notifier si changement de count**:
```python
if len(all_tenders) != len(previous_data['tenders']):
    send_webhook_notification(new_tenders)
```

3. **Notifier une fois par jour** (dernier run du jour):
Ajoutez dans le cron du workflow:
```yaml
schedule:
  - cron: '0 23 * * *'  # 23:00 UTC seulement
```

---

## 📞 Support

**Problèmes Courants:**

| Problème | Solution |
|----------|----------|
| Webhook URL invalide | Copiez-la complètement depuis Discord/Slack |
| Notification n'arrive pas | Vérifiez NOTIFICATION_ENABLED = true |
| Trop de notifications | Augmentez le délai ou filtrez par régions |
| Format invalide | Utilisez le JSON exact du guide |

---

**Félicitations! 🎉 Vous recevez maintenant des alertes en temps réel!**

*Pour toute question, consultez les logs GitHub Actions ou relancez le scraper manuellement.*
