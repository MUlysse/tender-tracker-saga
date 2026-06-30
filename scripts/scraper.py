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
# Liste multilingue de mots-clés étendue (FR, EN, ES, PT, AR)
TARGET_KEYWORDS = [
    # Français
    'mobilisation des ressources',
    'fiscalité',
    'réforme fiscale',
    'gestion des finances publiques',
    'dette souveraine',
    'restructuration de dette',
    'marchés publics',
    'finances publiques',
    'budgétisation',
    'mobilisation de ressources',
    'impôts',
    'collecte des impôts',
    'ressources fiscales',

    # Anglais
    'domestic resource mobilization',
    'drm',
    'tax reform',
    'fiscal policy',
    'public financial management',
    'pfm',
    'sovereign debt',
    'debt restructuring',
    'public procurement',
    'tax administration',
    'revenue mobilization',
    'tax expertise',
    'public resource management',
    'beps',
    'customs modernization',
    'revenue authority',

    # Espagnol
    'movilización de recursos internos',
    'fiscalidad',
    'reforma fiscal',
    'gestión de finanzas públicas',
    'deuda soberana',
    'reestructuración de deuda',
    'contratación pública',
    'administración tributaria',
    'movilización de recursos',

    # Portugais
    'mobilização de recursos internos',
    'fiscalidade',
    'reforma fiscal',
    'gestão das finanças públicas',
    'dívida soberana',
    'reestruturação da dívida',
    'contratação pública',
    'administração tributária',
    'mobilização de recursos',

    # Arabe
    'تعبئة الموارد',
    'الضرائب',
    'الإصلاح الضريبي',
    'إدارة المالية العامة',
    'الدين العام',
    'التعاقدات العمومية',
    'الموارد المحلية',
    'الإيرادات الضريبية'
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
    """Normalise le texte pour la recherche (case-insensitive)"""
    return text.lower().strip() if text else ''

def contains_target_keywords(text):
    """
    Détecte les mots-clés cibles (multilingue, case-insensitive).
    Retourne la liste des mots-clés matchés.
    """
    if not text or len(text) < 5:
        return []

    text_normalized = normalize_text(text)
    matched = []

    for keyword in TARGET_KEYWORDS:
        keyword_normalized = normalize_text(keyword)
        # Vérifier si le mot-clé est présent dans le texte
        if keyword_normalized in text_normalized:
            # Éviter les doublons
            if keyword not in matched:
                matched.append(keyword)

    return matched

def extract_tender_info(url, html_content, country, source_keywords):
    """
    Extrait les informations de tender du HTML avec détection multilingue.
    Recherche dans tous les éléments textuels pour détecter les mots-clés.
    Retourne une liste de tenders détectés.
    """
    tenders = []
    soup = BeautifulSoup(html_content, 'html.parser')

    try:
        # Enlever les scripts et styles pour ne pas les parser
        for script in soup(['script', 'style']):
            script.decompose()

        # Recherche des éléments contenant les mots-clés
        relevant_texts = []

        # Parcourt le contenu du body - chercher dans tous les tags textuels
        for tag in soup.find_all(['p', 'td', 'li', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'strong', 'em']):
            text = tag.get_text(strip=True)
            if text and len(text) > 5:
                matched_kw = contains_target_keywords(text)
                if matched_kw:
                    relevant_texts.append((text, matched_kw))

        # Également chercher dans le titre de la page
        title_tag = soup.find('title')
        if title_tag:
            title_text = title_tag.get_text(strip=True)
            if title_text:
                matched_kw = contains_target_keywords(title_text)
                if matched_kw:
                    relevant_texts.append((title_text, matched_kw))

        # Créer un tender si au moins UN mot-clé est détecté sur la page
        if relevant_texts:
            # Prendre le résultat avec le plus de mots-clés
            text, matched_kw = max(relevant_texts, key=lambda x: len(x[1]))

            tender_hash = hashlib.md5(f"{url}{datetime.now().isoformat()}".encode()).hexdigest()
            tenders.append({
                'id': tender_hash,
                'country': country,
                'title': text[:150] if text else 'Opportunité détectée',
                'url': url,
                'detected_at': datetime.now().isoformat(),
                'matched_keywords': list(set(matched_kw[:5]))  # Dédupliquer et limiter à 5
            })

    except Exception as e:
        print(f"⚠️  Erreur lors du parsing de {country}: {e}")

    return tenders

def scrape_portal(country, url):
    """
    Scrape un portail individuel avec détection multilingue.
    Retourne une liste de tenders trouvés (une ligne = une détection).
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
                keywords_found = ', '.join(extracted[0]['matched_keywords'][:3])
                print(f"   {country}: {len(extracted)} détection(s) - Mots-clés: {keywords_found}")
            else:
                print(f"   {country}: Aucune détection")

    except requests.exceptions.Timeout:
        print(f"   {country}: Timeout")
    except requests.exceptions.ConnectionError:
        print(f"   {country}: Erreur de connexion")
    except Exception as e:
        print(f"   {country}: Erreur - {type(e).__name__}")

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
    print("=" * 70)
    print("TENDER-TRACKER SAGA - Scraper Multilingue Automatisé")
    print("=" * 70)

    # Charger les données existantes
    data = load_data()
    sources = data.get('sources', [])
    previous_tenders = data.get('tenders', [])

    print(f"\nConfiguration:")
    print(f"  Sources: {len(sources)}")
    print(f"  Tenders antérieurs: {len(previous_tenders)}")
    print(f"  Mots-clés détection: {len(TARGET_KEYWORDS)} (FR, EN, ES, PT, AR)")

    # Scraper tous les portails
    all_tenders = []
    print(f"\nScraping des portails (détection case-insensitive):")
    print("-" * 70)

    for i, source in enumerate(sources, 1):
        country = source.get('country')
        url = source.get('url')
        tenders = scrape_portal(country, url)
        all_tenders.extend(tenders)

    # Identifier les nouvelles opportunités
    new_tenders = identify_new_tenders(all_tenders, previous_tenders)

    print("-" * 70)
    print(f"\nRÉSULTATS:")
    print(f"  Total détections: {len(all_tenders)}")
    print(f"  Nouvelles opportunités: {len(new_tenders)}")
    print(f"  Portails avec détections: {len(set(t['country'] for t in all_tenders))}")

    # Envoyer notifications
    if new_tenders:
        print(f"\nEnvoi des notifications...")
        send_webhook_notification(new_tenders)

    # Sauvegarder les données (conserver sources + ajouter tenders)
    updated_data = {
        'sources': sources,
        'tenders': all_tenders,
        'last_updated': datetime.now().isoformat(),
        'new_tenders_count': len(new_tenders)
    }

    save_data(updated_data)
    print("\n" + "=" * 70)
    print("Scraping terminé avec succès")
    print("=" * 70)

if __name__ == '__main__':
    main()
