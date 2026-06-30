"""
Configuration Example for Local Testing
Copiez ce fichier en 'config.py' et adaptez-le pour les tests locaux
"""

# ===== WEBHOOK CONFIGURATION (Optionnel pour tests) =====
# Laissez vide ou faux pour tester sans notifications

WEBHOOK_URL = ""  # Discord: https://discord.com/api/webhooks/...
NOTIFICATION_ENABLED = False

# ===== REQUEST CONFIGURATION =====
REQUEST_TIMEOUT = 10  # secondes
RATE_LIMIT_DELAY = 1  # secondes entre requêtes

# ===== MOTS-CLÉS PERSONNALISÉS =====
CUSTOM_KEYWORDS = [
    # Ajoutez vos mots-clés personnalisés ici
    # 'exemple_mot_cle',
]

# ===== FILTRAGE PAR RÉGION =====
ENABLED_REGIONS = [
    # Laissez vide pour scraper tous les pays
    # Exemple: ['Africa Francophone', 'Africa Anglophone']
]

# ===== DEBUG MODE =====
DEBUG = True  # Affiche plus de logs
SAVE_HTML = False  # Sauvegarde le HTML parsé pour debug

print("ℹ️  Configuration chargée depuis config.py")
