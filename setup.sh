#!/bin/bash
# 🚀 Setup Automatisé - Tender-Tracker SAGA
# Exécutez: bash setup.sh

set -e

echo "════════════════════════════════════════════════════"
echo "🚀 Tender-Tracker SAGA - Setup Automatisé"
echo "════════════════════════════════════════════════════"

# Vérifier les dépendances
echo ""
echo "📦 Vérification des dépendances..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 non trouvé. Installez Python 3.8+:"
    echo "   https://www.python.org/downloads/"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git non trouvé. Installez Git:"
    echo "   https://git-scm.com/download"
    exit 1
fi

echo "✅ Python $(python3 --version | awk '{print $2}')"
echo "✅ Git $(git --version | awk '{print $3}')"

# Créer l'environnement virtuel
echo ""
echo "🔧 Création de l'environnement virtuel..."

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Environnement créé"
else
    echo "⏳ Environnement existant trouvé"
fi

# Activer l'environnement
source venv/bin/activate
echo "✅ Environnement activé"

# Installer les dépendances
echo ""
echo "📥 Installation des dépendances Python..."
pip install --upgrade pip
pip install -r scripts/requirements.txt
echo "✅ Dépendances installées"

# Créer les répertoires nécessaires
echo ""
echo "📁 Création des répertoires..."
mkdir -p docs
mkdir -p scripts
echo "✅ Répertoires créés"

# Initialiser Git si nécessaire
if [ ! -d ".git" ]; then
    echo ""
    echo "🔗 Initialisation du dépôt Git..."
    git init
    git add .
    git commit -m "Initial commit: Tender-Tracker SAGA setup"
    echo "✅ Dépôt Git initialisé"
    echo ""
    echo "⚠️  PROCHAINES ÉTAPES:"
    echo "   1. Allez sur https://github.com/new"
    echo "   2. Créez un dépôt nommé 'tender-tracker-saga'"
    echo "   3. Exécutez:"
    echo "      git remote add origin https://github.com/YOUR_USERNAME/tender-tracker-saga.git"
    echo "      git push -u origin main"
else
    echo "⏳ Dépôt Git déjà initialisé"
fi

# Générer le hash du mot de passe
echo ""
echo "════════════════════════════════════════════════════"
echo "🔐 Configuration du Mot de Passe"
echo "════════════════════════════════════════════════════"
echo ""
echo "Générez votre hash SHA-256 pour sécuriser l'accès."
echo ""

python3 scripts/generate_password_hash.py

# Afficher les prochaines étapes
echo ""
echo "════════════════════════════════════════════════════"
echo "✅ Installation Complétée!"
echo "════════════════════════════════════════════════════"
echo ""
echo "📝 PROCHAINES ÉTAPES:"
echo ""
echo "1. ✏️  Mettre à jour le hash SHA-256 dans docs/index.html"
echo "   Cherchez la ligne: const PASSWORD_HASH = '...'"
echo ""
echo "2. 🔗 Pousser le code sur GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/tender-tracker-saga"
echo "   git push -u origin main"
echo ""
echo "3. ⚙️  Configurer GitHub Pages:"
echo "   • Allez sur votre dépôt GitHub"
echo "   • Settings → Pages"
echo "   • Source: main branch, /docs folder"
echo "   • Save"
echo ""
echo "4. 📬 [Optionnel] Configurer les Webhooks:"
echo "   Lisez: WEBHOOK_SETUP.md"
echo ""
echo "5. 🧪 Tester le scraper:"
echo "   python3 scripts/scraper.py"
echo ""
echo "📖 Documentation complète dans README.md"
echo ""
echo "════════════════════════════════════════════════════"
echo "🎉 Prêt à déployer!"
echo "════════════════════════════════════════════════════"
