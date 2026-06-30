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
KEYWORDS = {
    'fr': [
        'domestic resource mobilization', 'drm', 'tax expertise',
        'public resource management', 'revenue mobilization', 'fiscal reform',
        'beps', 'mobilisation des ressources', 'expertise fiscale',
        'gestion des finances publiques', 'réforme fiscale', 'collecte des impôts'
    ],
    'en': [
        'domestic resource mobilization', 'drm', 'tax expertise',
        'public resource management', 'revenue mobilization', 'fiscal reform',
        'beps', 'tax administration', 'revenue authority', 'customs modernization'
    ]
}

# Configuration réseau
REQUEST_TIMEOUT = 10
REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
RATE_LIMIT_DELAY = 1  # secondes entre chaque requête

# ==================== DONNÉES DES PORTAILS ====================
PROCUREMENT_SOURCES = {
    'Caribbean': [
        {'country': 'Bahamas', 'url': 'https://www.bahamas.gov.bs/wps/portal/public/'},
        {'country': 'British Virgin Islands', 'url': 'https://bvi.gov.vg/'},
        {'country': 'Cayman Islands', 'url': 'https://www.caymanislands.ky/'},
        {'country': 'Panama', 'url': 'https://www.panamacompra.gob.pa/'},
        {'country': 'Bermuda', 'url': 'https://www.gov.bm/'},
        {'country': 'St Kitts and Nevis', 'url': 'https://www.sknvibes.com/'},
        {'country': 'Dominican Republic', 'url': 'https://www.comprasdominicana.gob.do/'},
    ],
    'Europe': [
        {'country': 'Jersey', 'url': 'https://www.gov.je/'},
        {'country': 'Gibraltar', 'url': 'https://www.gibraltar.gov.gi/'},
        {'country': 'Liechtenstein', 'url': 'https://www.liechtenstein.li/'},
    ],
    'Africa Francophone': [
        {'country': 'Côte d\'Ivoire', 'url': 'https://www.marchespublics.ci/'},
        {'country': 'Sénégal', 'url': 'https://www.marchespublics.sn/'},
        {'country': 'Bénin', 'url': 'https://www.marchespublics.bj/'},
        {'country': 'Burkina Faso', 'url': 'https://www.marchespublics.bf/'},
        {'country': 'Mali', 'url': 'https://www.marchespublics.ml/'},
        {'country': 'Niger', 'url': 'https://www.marchespublics.ne/'},
        {'country': 'Togo', 'url': 'https://www.marchespublics.tg/'},
        {'country': 'Guinée', 'url': 'https://www.marchespublics.gn/'},
        {'country': 'Mauritanie', 'url': 'https://www.marchespublics.mr/'},
        {'country': 'Gabon', 'url': 'https://www.marchespublics.ga/'},
        {'country': 'Tchad', 'url': 'https://www.marchespublics.td/'},
        {'country': 'RDC', 'url': 'https://www.marchespublics.cd/'},
        {'country': 'Congo-Brazza', 'url': 'https://www.marchespublics.cg/'},
        {'country': 'Djibouti', 'url': 'https://www.marchespublics.dj/'},
        {'country': 'Cameroun', 'url': 'https://www.marchespublics.cm/'},
        {'country': 'Guinée équatoriale', 'url': 'https://www.marchespublics.gq/'},
    ],
    'Africa Anglophone': [
        {'country': 'Kenya', 'url': 'https://www.treasury.go.ke/'},
        {'country': 'Tanzania', 'url': 'https://www.mof.go.tz/'},
        {'country': 'Uganda', 'url': 'https://gpp.ppda.go.ug/'},
        {'country': 'Rwanda', 'url': 'https://www.rgb.rw/'},
        {'country': 'Ethiopia', 'url': 'https://www.mofed.gov.et/'},
        {'country': 'South Africa', 'url': 'https://www.gpwonline.co.za/'},
        {'country': 'Nigeria', 'url': 'https://www.bpp.gov.ng/'},
        {'country': 'Ghana', 'url': 'https://www.mofep.gov.gh/'},
        {'country': 'Zambia', 'url': 'https://www.mof.gov.zm/'},
        {'country': 'Botswana', 'url': 'https://www.gov.bw/'},
        {'country': 'Malawi', 'url': 'https://www.mof.gov.mw/'},
        {'country': 'Sierra Leone', 'url': 'https://www.statehouse.gov.sl/'},
        {'country': 'Liberia', 'url': 'https://www.mof.gov.lr/'},
        {'country': 'Lesotho', 'url': 'https://www.gov.ls/'},
        {'country': 'Zimbabwe', 'url': 'https://www.zimtreasury.gov.zw/'},
        {'country': 'Gambia', 'url': 'https://www.treasury.gm/'},
    ],
    'Africa Lusophone': [
        {'country': 'Mozambique', 'url': 'https://www.mof.gov.mz/'},
        {'country': 'Angola', 'url': 'https://www.minfin.gov.ao/'},
        {'country': 'Cape Verde', 'url': 'https://www.gov.cv/'},
    ],
    'Maghreb & Middle East': [
        {'country': 'Morocco', 'url': 'https://www.maroc.ma/'},
        {'country': 'Algeria', 'url': 'https://www.mf.gov.dz/'},
        {'country': 'Tunisia', 'url': 'https://www.finances.gov.tn/'},
        {'country': 'Saudi Arabia', 'url': 'https://www.saudia.gov.sa/'},
        {'country': 'Oman', 'url': 'https://www.mof.gov.om/'},
        {'country': 'Egypt', 'url': 'https://www.mof.gov.eg/'},
        {'country': 'UAE', 'url': 'https://www.mof.gov.ae/'},
        {'country': 'Qatar', 'url': 'https://www.mof.gov.qa/'},
        {'country': 'Bahrain', 'url': 'https://www.mof.gov.bh/'},
    ],
    'Indian Ocean': [
        {'country': 'Mauritius', 'url': 'https://www.mof.gov.mu/'},
        {'country': 'Seychelles', 'url': 'https://www.mof.gov.sc/'},
        {'country': 'Madagascar', 'url': 'https://www.mef.gov.mg/'},
        {'country': 'Comoros', 'url': 'https://www.mf.gov.km/'},
    ],
    'Asia': [
        {'country': 'Thailand', 'url': 'https://www.mpac.go.th/'},
        {'country': 'Indonesia', 'url': 'https://www.lkpp.go.id/'},
        {'country': 'Singapore', 'url': 'https://www.gebiz.gov.sg/'},
    ],
    'International Organizations': [
        {'country': 'World Bank', 'url': 'https://www.worldbank.org/en/projects-operations/products-and-services/brief/world-bank-procurement-notices'},
        {'country': 'AfDB', 'url': 'https://www.afdb.org/en/business/opportunities/procurement'},
        {'country': 'Development Aid', 'url': 'https://www.devaid.org/'},
        {'country': 'GIZ (Germany)', 'url': 'https://www.giz.de/en/'},
        {'country': 'AFD (France)', 'url': 'https://www.afd.fr/en'},
        {'country': 'Norad (Norway)', 'url': 'https://www.norad.no/'},
        {'country': 'Danida (Denmark)', 'url': 'https://um.dk/en/danida'},
        {'country': 'SIDA (Sweden)', 'url': 'https://www.sida.se/'},
        {'country': 'JICA (Japan)', 'url': 'https://www.jica.go.jp/'},
    ]
}

# ==================== FONCTIONS UTILITAIRES ====================

def load_previous_data():
    """Charge les données précédentes de scraping"""
    data_file = 'docs/data.json'
    if os.path.exists(data_file):
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            pass
    return {'last_updated': None, 'tenders': []}

def normalize_text(text):
    """Normalise le texte pour la recherche"""
    return text.lower().strip() if text else ''

def contains_keywords(text):
    """Vérifie si le texte contient des mots-clés DRM"""
    text_normalized = normalize_text(text)
    for keyword_list in KEYWORDS.values():
        for keyword in keyword_list:
            if keyword.lower() in text_normalized:
                return True
    return False

def extract_tender_info(url, html_content, country):
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
        for tag in soup.find_all(['p', 'td', 'li', 'div', 'span', 'h1', 'h2', 'h3', 'h4']):
            text = tag.get_text(strip=True)
            if text and contains_keywords(text) and len(text) > 10:
                relevant_texts.append(text)

        # Crée un tender pour chaque contenu pertinent trouvé
        if relevant_texts:
            for text in relevant_texts[:3]:  # Limite à 3 par page
                tender_hash = hashlib.md5(f"{url}{text}".encode()).hexdigest()
                tenders.append({
                    'id': tender_hash,
                    'country': country,
                    'title': text[:100],
                    'url': url,
                    'detected_at': datetime.now().isoformat(),
                    'matched_keywords': [kw for kw in KEYWORDS['en'] if kw in text.lower()]
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
            extracted = extract_tender_info(url, response.text, country)
            tenders.extend(extracted)

            if extracted:
                print(f"✅ {country}: {len(extracted)} opportunité(s) détectée(s)")
            else:
                print(f"⏳ {country}: Aucune opportunité DRM détectée")

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
            'content': f"🎯 **{len(new_tenders)} NOUVELLE(S) OPPORTUNITÉ(S) DÉTECTÉE(S)**",
            'embeds': [
                {
                    'title': f"📌 {tender['country']} - {tender['title'][:80]}",
                    'description': f"🔗 [{tender['url']}]({tender['url']})\n\n**Mots-clés détectés:** {', '.join(tender.get('matched_keywords', [])[:3])}",
                    'color': 3066993,  # Vert
                    'footer': {'text': f"Détecté le {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC"}
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
    """Sauvegarde les données dans docs/data.json"""
    os.makedirs('docs', exist_ok=True)
    with open('docs/data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"💾 Données sauvegardées: {len(data['tenders'])} tenders")

# ==================== MAIN ====================

def main():
    print("=" * 60)
    print("🚀 Tender-Tracker SAGA - Scraper Automatisé")
    print("=" * 60)

    # Charger les données précédentes
    previous_data = load_previous_data()
    print(f"📊 Données précédentes: {len(previous_data['tenders'])} tenders")

    # Scraper tous les portails
    all_tenders = []
    total_sources = sum(len(v) for v in PROCUREMENT_SOURCES.values())
    print(f"\n🌍 Scraping de {total_sources} sources...")
    print("-" * 60)

    for region, sources in PROCUREMENT_SOURCES.items():
        print(f"\n📍 Région: {region}")
        for source in sources:
            tenders = scrape_portal(source['country'], source['url'])
            all_tenders.extend(tenders)

    # Identifier les nouvelles opportunités
    new_tenders = identify_new_tenders(all_tenders, previous_data['tenders'])
    print(f"\n\n✨ RÉSUMÉ:")
    print(f"  • Tenders trouvés cette session: {len(all_tenders)}")
    print(f"  • Nouvelles opportunités: {len(new_tenders)}")
    print(f"  • Total cumulé: {len(all_tenders)}")

    # Envoyer notifications
    if new_tenders:
        print(f"\n📢 Envoi des notifications...")
        send_webhook_notification(new_tenders)

    # Sauvegarder les données
    updated_data = {
        'last_updated': datetime.now().isoformat(),
        'run_number': os.getenv('GITHUB_RUN_NUMBER', 'N/A'),
        'total_sources_scanned': total_sources,
        'new_tenders_count': len(new_tenders),
        'tenders': all_tenders
    }

    save_data(updated_data)
    print("\n" + "=" * 60)
    print("✅ Scraping terminé avec succès")
    print("=" * 60)

if __name__ == '__main__':
    main()
