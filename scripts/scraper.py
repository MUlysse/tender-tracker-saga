#!/usr/bin/env python3
"""
Tender-Tracker SAGA - Scraper Automatisé
Scrape les portails d'appels d'offres publics pour détecter les opportunités en DRM/Fiscalité
"""

import json
import os
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
from urllib.parse import urljoin
import hashlib

# ==================== CONFIGURATION ====================
TARGET_KEYWORDS = [
    'domestic resource mobilization',
    'drm',
    'tax',
    'fiscal reform',
    'public resource management',
    'beps'
]

# Configuration réseau
REQUEST_TIMEOUT = 10
REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
RATE_LIMIT_DELAY = 1  # secondes entre chaque requête

# ==================== FONCTIONS UTILITAIRES ====================

def load_data():
    """Charge les données depuis data.json"""
    data_file = 'docs/data.json'
    if os.path.exists(data_file):
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            pass
    return {'sources': [], 'tenders': [], 'last_updated': None, 'new_tenders_count': 0}

def normalize_text(text):
    """Normalise le texte pour la recherche"""
    return text.lower().strip() if text else ''

def contains_target_keywords(text):
    """Vérifie si le texte contient les mots-clés cibles"""
    text_normalized = normalize_text(text)
    matched = []
    for keyword in TARGET_KEYWORDS:
        if keyword.lower() in text_normalized:
            matched.append(keyword)
    return matched

def extract_tender_info(url, html_content, country, source_keywords):
    """
    Extrait les informations de tender du HTML
    Retourne une liste de tenders détectés
    """
    tenders = []
    soup = BeautifulSoup(html_content, 'html.parser')

    try:
        # Recherche des éléments contenant les mots-clés
        relevant_texts = []

        # Parcourt le contenu du body
        for tag in soup.find_all(['p', 'td', 'li', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'a']):
            text = tag.get_text(strip=True)
            if text and len(text) > 10:
                matched_kw = contains_target_keywords(text)
                if matched_kw:
                    relevant_texts.append((text, matched_kw))

        # Crée un tender pour chaque contenu pertinent trouvé (limite à 1 par page)
        if relevant_texts:
            text, matched_kw = relevant_texts[0]
            tender_hash = hashlib.md5(f"{url}{text}".encode()).hexdigest()
            tenders.append({
                'id': tender_hash,
                'country': country,
                'title': text[:120],
                'url': url,
                'detected_at': datetime.now().isoformat(),
                'matched_keywords': matched_kw[:3]
            })

    except Exception as e:
        print(f"⚠️  Erreur lors du parsing de {country}: {e}")

    return tenders

def scrape_portal(country, url):
    """
    Scrape un portail individuel
    Retourne une liste de tenders trouvés
    """
    tenders = []
    try:
        response = requests.get(
            url,
            headers=REQUEST_HEADERS,
            timeout=REQUEST_TIMEOUT,
            verify=True
        )
        response.raise_for_status()
        response.encoding = 'utf-8'

        if response.status_code == 200:
            extracted = extract_tender_info(url, response.text, country, TARGET_KEYWORDS)
            tenders.extend(extracted)

            if extracted:
                print(f"✅ {country}: {len(extracted)} opportunité(s) détectée(s)")
            else:
                print(f"⏳ {country}: Aucune détection DRM")

    except requests.exceptions.Timeout:
        print(f"⏱️  {country}: Timeout (URL inatteignable)")
    except requests.exceptions.ConnectionError:
        print(f"❌ {country}: Erreur de connexion")
    except Exception as e:
        print(f"⚠️  {country}: {type(e).__name__}")

    time.sleep(RATE_LIMIT_DELAY)
    return tenders

def identify_new_tenders(current_tenders, previous_tenders):
    """
    Identifie les NOUVEAUX tenders par rapport aux données précédentes
    """
    previous_ids = {t['id'] for t in previous_tenders}
    new_tenders = [t for t in current_tenders if t['id'] not in previous_ids]
    return new_tenders

def send_webhook_notification(new_tenders):
    """
    Envoie une notification Webhook pour les nouvelles opportunités
    Supporte Discord, Slack, et Telegram
    """
    webhook_url = os.getenv('WEBHOOK_URL')
    notification_enabled = os.getenv('NOTIFICATION_ENABLED', 'false').lower() == 'true'

    if not webhook_url or not notification_enabled or not new_tenders:
        return

    try:
        # Format Discord Webhook (compatible avec Slack et Telegram)
        payload = {
            'content': f"**{len(new_tenders)} NOUVELLE(S) OPPORTUNITÉ(S) DÉTECTÉE(S)**",
            'embeds': [
                {
                    'title': f"{tender['country']} - {tender['title'][:80]}",
                    'description': f"URL: {tender['url']}\n\nMots-clés: {', '.join(tender.get('matched_keywords', [])[:3])}",
                    'color': 0,
                    'footer': {'text': f"Détecté: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC"}
                }
                for tender in new_tenders
            ]
        }

        response = requests.post(
            webhook_url,
            json=payload,
            timeout=10
        )

        if response.status_code in [200, 204]:
            print(f"📬 {len(new_tenders)} notification(s) envoyée(s)")
        else:
            print(f"⚠️  Webhook retourné: {response.status_code}")

    except Exception as e:
        print(f"❌ Erreur Webhook: {e}")

def save_data(data):
    """Sauvegarde les données dans docs/data.json en conservant les sources"""
    os.makedirs('docs', exist_ok=True)
    with open('docs/data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"💾 Données sauvegardées: {len(data['tenders'])} détection(s)")

# ==================== MAIN ====================

def main():
    print("=" * 60)
    print("Tender-Tracker SAGA - Scraper Automatisé")
    print("=" * 60)

    # Charger les données existantes
    data = load_data()
    sources = data.get('sources', [])
    previous_tenders = data.get('tenders', [])

    print(f"\n Sources configurées: {len(sources)}")
    print(f"Tenders précédents: {len(previous_tenders)}")

    # Scraper tous les portails
    all_tenders = []
    print(f"\nScraping en cours...")
    print("-" * 60)

    for source in sources:
        country = source.get('country')
        url = source.get('url')
        tenders = scrape_portal(country, url)
        all_tenders.extend(tenders)

    # Identifier les nouvelles opportunités
    new_tenders = identify_new_tenders(all_tenders, previous_tenders)
    print(f"\n\nRÉSUMÉ:")
    print(f"  Détections cette session: {len(all_tenders)}")
    print(f"  Nouvelles: {len(new_tenders)}")

    # Envoyer notifications
    if new_tenders:
        print(f"\nNotifications...")
        send_webhook_notification(new_tenders)

    # Sauvegarder les données (conserver sources + ajouter tenders)
    updated_data = {
        'sources': sources,
        'tenders': all_tenders,
        'last_updated': datetime.now().isoformat(),
        'new_tenders_count': len(new_tenders)
    }

    save_data(updated_data)
    print("\n" + "=" * 60)
    print("Scraping terminé")
    print("=" * 60)

if __name__ == '__main__':
    main()
