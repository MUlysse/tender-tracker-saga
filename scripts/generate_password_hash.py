#!/usr/bin/env python3
"""
Utilitaire pour générer le hash SHA-256 d'un mot de passe
À exécuter localement pour obtenir le hash à mettre dans index.html
"""

import hashlib
import getpass

def generate_hash(password):
    """Génère le hash SHA-256 d'un mot de passe"""
    return hashlib.sha256(password.encode()).hexdigest()

if __name__ == '__main__':
    print("=" * 60)
    print("🔐 Générateur de Hash SHA-256 - Tender-Tracker SAGA")
    print("=" * 60)

    # Option 1: Entrée manuelle
    print("\nOption 1: Entrez votre mot de passe")
    password = getpass.getpass("Mot de passe: ")

    if not password:
        print("Erreur: mot de passe vide")
        exit(1)

    hash_value = generate_hash(password)

    print("\n" + "=" * 60)
    print("✅ HASH SHA-256 GÉNÉRÉ:")
    print("=" * 60)
    print(f"\n{hash_value}\n")
    print("=" * 60)
    print("📝 INSTRUCTIONS:")
    print("=" * 60)
    print("1. Copiez le hash ci-dessus")
    print("2. Ouvrez le fichier docs/index.html")
    print("3. Cherchez la ligne: const PASSWORD_HASH = '...'")
    print("4. Remplacez la valeur par votre hash")
    print("5. Sauvegardez et poussez vers GitHub")
    print("\n⚠️  SÉCURITÉ: Gardez ce hash secret!")
    print("=" * 60)
