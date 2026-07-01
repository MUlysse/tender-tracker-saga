@echo off
REM 🚀 Setup Automatisé - Tender-Tracker SAGA (Windows)
REM Exécutez: setup.bat

setlocal enabledelayedexpansion

echo.
echo ════════════════════════════════════════════════════
echo 🚀 Tender-Tracker SAGA - Setup Automatisé (Windows)
echo ════════════════════════════════════════════════════

REM Vérifier les dépendances
echo.
echo 📦 Vérification des dépendances...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python non trouvé. Installez Python 3.8+:
    echo    https://www.python.org/downloads/
    pause
    exit /b 1
)

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git non trouvé. Installez Git:
    echo    https://git-scm.com/download
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✅ %PYTHON_VERSION%
echo ✅ Git installed

REM Créer l'environnement virtuel
echo.
echo 🔧 Création de l'environnement virtuel...

if not exist "venv" (
    python -m venv venv
    echo ✅ Environnement créé
) else (
    echo ⏳ Environnement existant trouvé
)

REM Activer l'environnement
call venv\Scripts\activate.bat
echo ✅ Environnement activé

REM Installer les dépendances
echo.
echo 📥 Installation des dépendances Python...
python -m pip install --upgrade pip
pip install -r scripts\requirements.txt
echo ✅ Dépendances installées

REM Créer les répertoires
echo.
echo 📁 Création des répertoires...
if not exist "docs" mkdir docs
if not exist "scripts" mkdir scripts
echo ✅ Répertoires créés

REM Initialiser Git si nécessaire
if not exist ".git" (
    echo.
    echo 🔗 Initialisation du dépôt Git...
    git init
    git add .
    git commit -m "Initial commit: Tender-Tracker SAGA setup"
    echo ✅ Dépôt Git initialisé
    echo.
    echo ⚠️  PROCHAINES ÉTAPES:
    echo    1. Allez sur https://github.com/new
    echo    2. Créez un dépôt nommé 'tender-tracker-saga'
    echo    3. Exécutez:
    echo       git remote add origin https://github.com/YOUR_USERNAME/tender-tracker-saga.git
    echo       git push -u origin main
) else (
    echo ⏳ Dépôt Git déjà initialisé
)

REM Générer le hash du mot de passe
echo.
echo ════════════════════════════════════════════════════
echo 🔐 Configuration du Mot de Passe
echo ════════════════════════════════════════════════════
echo.
echo Générez votre hash SHA-256 pour sécuriser l'accès.
echo.

python scripts\generate_password_hash.py

REM Afficher les prochaines étapes
echo.
echo ════════════════════════════════════════════════════
echo ✅ Installation Complétée!
echo ════════════════════════════════════════════════════
echo.
echo 📝 PROCHAINES ÉTAPES:
echo.
echo 1. ✏️  Mettre à jour le hash SHA-256 dans docs\index.html
echo    Cherchez la ligne: const PASSWORD_HASH = '...'
echo.
echo 2. 🔗 Pousser le code sur GitHub:
echo    git remote add origin https://github.com/YOUR_USERNAME/tender-tracker-saga
echo    git push -u origin main
echo.
echo 3. ⚙️  Configurer GitHub Pages:
echo    - Allez sur votre dépôt GitHub
echo    - Settings ^> Pages
echo    - Source: main branch, /docs folder
echo    - Save
echo.
echo 4. 📬 [Optionnel] Configurer les Webhooks:
echo    Lisez: WEBHOOK_SETUP.md
echo.
echo 5. 🧪 Tester le scraper:
echo    python scripts\scraper.py
echo.
echo 📖 Documentation complète dans README.md
echo.
echo ════════════════════════════════════════════════════
echo 🎉 Prêt à déployer!
echo ════════════════════════════════════════════════════
echo.

pause
