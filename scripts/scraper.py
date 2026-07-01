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
    'finances publiques',
    'budgétisation',
    'mobilisation de ressources',
    'impôts',
    'collecte des impôts',
    'ressources fiscales',
    'administration fiscale',
    'modernisation fiscale',
    'expertise fiscale',
    'gestion des ressources publiques',
    'pilier 1 ocde',
    'beps 2.0',
    'montant a',
    'montant b',
    'taxe sur les services numériques',
    'tsn',
    'juridiction du marché',
    'droits d\'imposition',
    'seuil de chiffre d\'affaires',
    'chiffre d\'affaires mondial',
    'règle de lien économique',
    'nexus',

    # Anglais
    'domestic resource mobilization',
    'drm',
    'tax reform',
    'fiscal policy',
    'public financial management',
    'pfm',
    'sovereign debt',
    'debt restructuring',
    'tax administration',
    'revenue mobilization',
    'tax expertise',
    'public resource management',
    'beps',
    'customs modernization',
    'revenue authority',
    'tax modernisation',
    'tax modernization',
    'oecd pillar 1',
    'beps 2.0',
    'amount a',
    'amount b',
    'digital services tax',
    'dst',
    'market jurisdiction',
    'taxing rights',
    'revenue threshold',
    'global turnover',
    'nexus rules',
    'profit reallocation',

    # Espagnol
    'movilización de recursos internos',
    'fiscalidad',
    'reforma fiscal',
    'gestión de finanzas públicas',
    'deuda soberana',
    'reestructuración de deuda',
    'administración tributaria',
    'movilización de recursos',
    'modernización tributaria',
    'experticia fiscal',
    'gestión de recursos públicos',
    'pilar 1 ocde',
    'beps 2.0',
    'monto a',
    'monto b',
    'impuesto sobre los servicios digitales',
    'isd',
    'jurisdicción del mercado',
    'derechos de imposición',
    'umbral de ingresos',
    'facturación global',
    'reglas de nexo',
    'reasignación de beneficios',

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
    'modernização tributária',
    'expertise fiscal',
    'gestão de recursos públicos',
    'pilar 1 ocde',
    'beps 2.0',
    'montante a',
    'montante b',
    'imposto sobre os serviços digitais',
    'isd',
    'jurisdição de mercado',
    'direitos de tributação',
    'limiar de receita',
    'faturação global',
    'regras de nexo',
    'realocação de lucros',

    # Arabe
    'تعبئة الموارد',
    'الضرائب',
    'الإصلاح الضريبي',
    'إدارة المالية العامة',
    'الدين العام',
    'التعاقدات العمومية',
    'الموارد المحلية',
    'الإيرادات الضريبية',
    'إدارة الضرائب',
    'تحديث النظام الضريبي',
    'خبرة ضريبية',
    'إدارة الموارد العامة',
    'الركيزة الأولى',
    'beps 2.0',
    'المبلغ أ',
    'المبلغ ب',
    'ضريبة الخدمات الرقمية',
    'dst',
    'الولاية القضائية للسوق',
    'حقوق فرض الضرائب',
    'حد الإيرادات',
    'العائدات العالمية',
    'قواعد الارتباط',
    'النيكسوس',
    'إعادة تخصيص الأرباح'
]

# Messages d'erreur 404 multilingues
ERROR_404_MESSAGES = [
    # Français
    'page n\'existe plus',
    'cette page n\'existe plus',
    'page not found',
    'erreur 404',
    'page non trouvée',
    'ressource non disponible',
    'lien cassé',
    # Anglais
    'page not found',
    'this page no longer exists',
    'error 404',
    '404 error',
    'not found',
    'resource not available',
    'broken link',
    'the page you requested could not be found',
    # Español
    'página no encontrada',
    'esta página ya no existe',
    'recurso no disponible',
    'enlace roto',
    # Português
    'página não encontrada',
    'esta página não existe mais',
    'recurso não disponível',
    'link quebrado',
    # Arabe
    'لم يتم العثور على الصفحة',
    'هذه الصفحة لا تعد موجودة',
    'مورد غير متاح'
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

def is_element_visible(tag):
    """
    Vérifie si un élément est réellement visible (pas caché par CSS/HTML).
    Retourne False si l'élément est clairement caché.
    """
    # Ignorer les éléments cachés
    style = tag.get('style', '')
    if 'display' in style and 'none' in style:
        return False
    if 'visibility' in style and 'hidden' in style:
        return False
    if 'display' in style and 'none' in style.lower():
        return False

    # Ignorer les éléments avec data-hidden ou aria-hidden
    if tag.get('data-hidden') or tag.get('aria-hidden') == 'true':
        return False

    # Ignorer les éléments dans noscript
    if tag.name == 'noscript':
        return False

    # Vérifier que le parent n'est pas caché
    parent = tag.parent
    while parent and parent.name != 'html':
        parent_style = parent.get('style', '')
        if 'display' in parent_style and 'none' in parent_style.lower():
            return False
        if parent.get('aria-hidden') == 'true':
            return False
        parent = parent.parent

    return True

def extract_tender_info(url, html_content, country, source_keywords):
    """
    ÉQUILIBRÉ : Scanne le texte visible sans être trop strict.
    Cherche dans : titre, en-têtes, contenu principal visible.
    Retourne une liste de tenders détectés.
    """
    tenders = []
    soup = BeautifulSoup(html_content, 'html.parser')

    try:
        # Enlever le code non-visible
        for element in soup(['script', 'style', 'noscript', 'meta', 'link', 'nav', 'footer']):
            element.decompose()

        # Recherche des éléments contenant les mots-clés
        relevant_texts = []

        # 1. Chercher dans le titre de la page
        title_tag = soup.find('title')
        if title_tag:
            text = title_tag.get_text(strip=True)
            if text and len(text) > 5:
                matched_kw = contains_target_keywords(text)
                if matched_kw:
                    relevant_texts.append((text, matched_kw))

        # 2. Chercher dans h1, h2, h3 (en-têtes visibles)
        if not relevant_texts:
            for heading_tag in soup.find_all(['h1', 'h2', 'h3']):
                if not is_element_visible(heading_tag):
                    continue
                text = heading_tag.get_text(strip=True)
                if text and len(text) > 5:
                    matched_kw = contains_target_keywords(text)
                    if matched_kw:
                        relevant_texts.append((text, matched_kw))
                        break

        # 3. Si toujours rien, chercher dans le contenu principal visible
        if not relevant_texts:
            # Chercher dans les sections principales
            main_content = soup.find('main') or soup.find('article') or soup.find('body')
            if main_content:
                # Scanner les premiers paragraphes visibles
                p_count = 0
                for p_tag in main_content.find_all('p'):
                    if not is_element_visible(p_tag):
                        continue
                    text = p_tag.get_text(strip=True)
                    if text and len(text) > 15:  # Min 15 caractères
                        matched_kw = contains_target_keywords(text)
                        if matched_kw:
                            relevant_texts.append((text, matched_kw))
                            break
                    p_count += 1
                    if p_count >= 5:  # Max 5 paragraphes
                        break

        # 4. Si encore rien, chercher dans les divs de contenu
        if not relevant_texts:
            div_count = 0
            for div_tag in soup.find_all('div'):
                if not is_element_visible(div_tag):
                    continue
                text = div_tag.get_text(strip=True)
                if text and len(text) > 30:  # Min 30 caractères pour les divs
                    matched_kw = contains_target_keywords(text)
                    if matched_kw:
                        relevant_texts.append((text, matched_kw))
                        break
                div_count += 1
                if div_count >= 10:  # Max 10 divs
                    break

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
    Scrape un portail individuel avec détection multilingue et gestion d'erreur 404.
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
        response.encoding = 'utf-8'

        # Détection d'erreur 404
        if response.status_code == 404:
            tender_hash = hashlib.md5(f"{url}404".encode()).hexdigest()
            tenders.append({
                'id': tender_hash,
                'country': country,
                'title': 'Page inactive - Erreur 404',
                'url': url,
                'detected_at': datetime.now().isoformat(),
                'matched_keywords': ['404'],
                'status': '404'
            })
            print(f"   {country}: Page inactive (404)")
            time.sleep(RATE_LIMIT_DELAY)
            return tenders

        response.raise_for_status()

        if response.status_code == 200:
            # Vérifier aussi si le contenu contient des messages d'erreur 404
            content_lower = response.text.lower()
            has_404_message = any(msg.lower() in content_lower for msg in ERROR_404_MESSAGES)

            if has_404_message:
                tender_hash = hashlib.md5(f"{url}404_content".encode()).hexdigest()
                tenders.append({
                    'id': tender_hash,
                    'country': country,
                    'title': 'Page inactive - Ressource indisponible',
                    'url': url,
                    'detected_at': datetime.now().isoformat(),
                    'matched_keywords': ['404'],
                    'status': '404'
                })
                print(f"   {country}: Page inactive (contenu 404)")
            else:
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
