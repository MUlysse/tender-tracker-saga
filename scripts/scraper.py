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
    'الولاية القضائية للسوق',
    'حقوق فرض الضرائب',
    'حد الإيرادات',
    'العائدات العالمية',
    'قواعد الارتباط',
    'النيكسوس',
    'إعادة تخصيص الأرباح'
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
    ULTRA-STRICT: Vérifie qu'un élément est VRAIMENT visible à l'écran.
    Retourne False si caché par CSS, HTML, ou structure.
    ⚠️ ZÉRO contenu template/caché/dynamique.
    """
    if not tag or not hasattr(tag, 'name'):
        return False

    # ===== EXCLUSIONS ABSOLUES =====
    # Balises de structure/métadonnées
    if tag.name in ['script', 'style', 'noscript', 'meta', 'link', 'nav',
                     'footer', 'svg', 'canvas', 'iframe', 'embed', 'object']:
        return False

    # Attributs de dissimulation
    if tag.get('hidden') or tag.get('aria-hidden') == 'true':
        return False
    if tag.get('data-hidden') or tag.get('v-show') == 'false':
        return False

    # ===== STYLES CACHÉS (ULTRA-COMPLET) =====
    style = tag.get('style', '')
    if style:
        style_normalized = style.lower().replace(' ', '')

        # Visibility
        if 'visibility:hidden' in style_normalized or 'visibility:collapse' in style_normalized:
            return False

        # Display
        if 'display:none' in style_normalized:
            return False

        # Dimensions zéro
        if 'height:0' in style_normalized or 'width:0' in style_normalized:
            return False
        if 'max-height:0' in style_normalized or 'max-width:0' in style_normalized:
            return False

        # Opacity zéro
        if 'opacity:0' in style_normalized:
            return False

        # Clip/overflow
        if 'clip:rect(0' in style_normalized or 'clip-path:inset(100%)' in style_normalized:
            return False

        # Position absolue en dehors
        if 'position:absolute' in style_normalized and \
           ('left:-' in style_normalized or 'top:-' in style_normalized or 'right:-' in style_normalized):
            return False

        # Transform translate très loin
        if 'transform:translate' in style_normalized and '-9999' in style_normalized:
            return False

    # ===== CONTENU VIDE =====
    text = tag.get_text(strip=True)
    if not text or len(text) < 3:
        return False

    # ===== VÉRIFIER LES PARENTS =====
    parent = tag.parent
    depth = 0
    while parent and hasattr(parent, 'name') and parent.name and parent.name != 'html' and depth < 15:
        # Parent caché par display
        parent_style = parent.get('style', '')
        if parent_style:
            parent_style_norm = parent_style.lower().replace(' ', '')
            if 'display:none' in parent_style_norm or 'visibility:hidden' in parent_style_norm:
                return False
            if 'height:0' in parent_style_norm or 'opacity:0' in parent_style_norm:
                return False

        # Parent avec aria-hidden
        if parent.get('aria-hidden') == 'true':
            return False

        parent = parent.parent
        depth += 1

    return True

def calculate_confidence_score(text, matched_keywords, element_type, keyword_count):
    """
    Score ULTRA-STRICT (0-100):
    Seulement du contenu VRAIMENT visible et pertinent.
    SEUIL: 75% minimum (quasi-impossible pour div)
    """
    # 1. SCORE PAR TYPE SEULEMENT (base stricte)
    # Div et span = quasi rejeté d'emblée
    element_scores = {
        'title':  100,  # Titre = certain
        'h1':     95,   # H1 = très certain
        'h2':     90,   # H2 = certain
        'h3':     85,   # H3 = certain
        'h4':     80,
        'p':      75,   # Paragraphe = seuil minimum
        'li':     70,   # Liste = juste en dessous
        'span':   40,   # Span = probablement caché
        'div':    35,   # Div = très suspect
    }
    score = element_scores.get(element_type, 30)

    # 2. BONUS MOTS-CLÉS SÉVÈRE
    # Doit absolument avoir ≥2 mots-clés pour avoir une chance
    if keyword_count >= 4:
        score += 10
    elif keyword_count >= 3:
        score += 8
    elif keyword_count == 2:
        score += 5
    else:
        # 1 seul mot-clé = grande pénalité
        score -= 15

    # 3. BONUS LONGUEUR SÉVÈRE
    # Texte court = rejeté
    text_len = len(text.strip())
    if text_len > 300:
        score += 8
    elif text_len > 150:
        score += 5
    elif text_len > 80:
        score += 2
    elif text_len < 30:
        score -= 20  # Pénalité forte si trop court

    # 4. PÉNALITÉS SÉVÈRES
    # Tout ce qui semble suspect = rejeté
    text_lower = text.lower()

    # Contenu template/dynamique
    if '<?php' in text or '{%' in text or '{{' in text or '<%' in text or '?>' in text:
        score -= 50

    # Code
    if 'function(' in text or 'var ' in text or 'const ' in text or 'return ' in text:
        score -= 40

    # URLs, chemins, IDs
    if text.startswith('http') or text.startswith('www.') or text.startswith('/'):
        score -= 35

    # Données structurées suspectes
    if text.startswith('{') or text.startswith('[') or text.startswith('<'):
        score -= 40

    # Seul du vide
    if not any(c.isalpha() for c in text):
        score -= 50

    # Cap à 100, min à 0
    final_score = max(0, min(score, 100))
    return final_score

def extract_tender_info(url, html_content, country, source_keywords):
    """
    VALIDÉ : Scanne le contenu visible avec scoring de confiance.
    Retourne SEULEMENT les détections de haute confiance (≥60%).
    """
    tenders = []
    soup = BeautifulSoup(html_content, 'html.parser')

    try:
        # Enlever le code non-visible
        for element in soup(['script', 'style', 'noscript', 'meta', 'link', 'nav', 'footer']):
            element.decompose()

        best_detection = None
        best_score = 0

        # 1. TITRE (confiance max: 95)
        title_tag = soup.find('title')
        if title_tag and is_element_visible(title_tag):
            text = title_tag.get_text(strip=True)
            if text and len(text) > 5:
                matched_kw = contains_target_keywords(text)
                if matched_kw:
                    score = calculate_confidence_score(text, matched_kw, 'title', len(matched_kw))
                    if score > best_score:
                        best_score = score
                        best_detection = (text, matched_kw, score)

        # 2. H1 (très haute priorité)
        if best_score < 85:
            for h1_tag in soup.find_all('h1'):
                if not is_element_visible(h1_tag):
                    continue
                text = h1_tag.get_text(strip=True)
                if text and len(text) > 5:
                    matched_kw = contains_target_keywords(text)
                    if matched_kw:
                        score = calculate_confidence_score(text, matched_kw, 'h1', len(matched_kw))
                        if score > best_score:
                            best_score = score
                            best_detection = (text, matched_kw, score)
                        if score >= 85:
                            break

        # 3. H2, H3 (haute priorité)
        if best_score < 75:
            for h_tag in soup.find_all(['h2', 'h3']):
                if not is_element_visible(h_tag):
                    continue
                text = h_tag.get_text(strip=True)
                if text and len(text) > 5:
                    matched_kw = contains_target_keywords(text)
                    if matched_kw:
                        score = calculate_confidence_score(text, matched_kw, h_tag.name, len(matched_kw))
                        if score > best_score:
                            best_score = score
                            best_detection = (text, matched_kw, score)

        # 4. PARAGRAPHES (contenu principal)
        if best_score < 75:
            main_content = soup.find('main') or soup.find('article') or soup.find('body')
            if main_content:
                p_count = 0
                for p_tag in main_content.find_all('p'):
                    if not is_element_visible(p_tag):
                        continue
                    text = p_tag.get_text(strip=True)
                    if text and len(text) > 30:  # Min 30 cars (était 20)
                        matched_kw = contains_target_keywords(text)
                        if matched_kw:
                            score = calculate_confidence_score(text, matched_kw, 'p', len(matched_kw))
                            if score > best_score:
                                best_score = score
                                best_detection = (text, matched_kw, score)
                            if score >= 85:
                                break
                    p_count += 1
                    if p_count >= 15:
                        break

        # 5. LISTES (li) - seulement si vraiment bon
        if best_score < 75:
            li_count = 0
            for li_tag in soup.find_all('li'):
                if not is_element_visible(li_tag):
                    continue
                text = li_tag.get_text(strip=True)
                if text and len(text) > 40:  # Min 40 cars (était 20)
                    matched_kw = contains_target_keywords(text)
                    if matched_kw and len(matched_kw) >= 2:  # OBLIGATOIREMENT 2+ mots-clés
                        score = calculate_confidence_score(text, matched_kw, 'li', len(matched_kw))
                        if score > best_score:
                            best_score = score
                            best_detection = (text, matched_kw, score)
                li_count += 1
                if li_count >= 15:
                    break

        # 6. DIVS (quasi-impossible de passer - dernier recours EXTRÊME)
        # ⚠️ ULTRA-STRICT: doit être ÉNORME et avoir 3+ mots-clés
        if best_score < 75:
            div_count = 0
            for div_tag in soup.find_all('div'):
                if not is_element_visible(div_tag):
                    continue
                text = div_tag.get_text(strip=True)
                # Divs: min 80 cars et obligatoirement 3+ mots-clés
                if text and len(text) > 80:
                    matched_kw = contains_target_keywords(text)
                    if matched_kw and len(matched_kw) >= 3:  # OBLIGATOIREMENT 3+ mots-clés
                        score = calculate_confidence_score(text, matched_kw, 'div', len(matched_kw))
                        if score > best_score:
                            best_score = score
                            best_detection = (text, matched_kw, score)
                div_count += 1
                if div_count >= 20:
                    break

        # CRÉATION : seulement si confiance ≥ 75%
        # ⚠️ ULTRA-STRICT: Zéro faux positif, seulement du contenu VRAIMENT visible
        if best_detection and best_score >= 75:
            text, matched_kw, score = best_detection

            tender_hash = hashlib.md5(f"{url}{datetime.now().isoformat()}".encode()).hexdigest()
            tenders.append({
                'id': tender_hash,
                'country': country,
                'title': text[:150] if text else 'Opportunité détectée',
                'url': url,
                'detected_at': datetime.now().isoformat(),
                'matched_keywords': list(set(matched_kw[:5])),
                'confidence': round(score, 1)
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

        # Pages 404 = ne pas inclure (elles ne sont pas des tenders)
        if response.status_code == 404:
            print(f"   {country}: 404 - ignoré")
            time.sleep(RATE_LIMIT_DELAY)
            return tenders

        response.raise_for_status()

        if response.status_code == 200:
            # Scraper le contenu (pas de détection 404)
            extracted = extract_tender_info(url, response.text, country, TARGET_KEYWORDS)
            tenders.extend(extracted)

            if extracted:
                keywords_found = ', '.join(extracted[0]['matched_keywords'][:3])
                confidence = extracted[0].get('confidence', 'N/A')
                print(f"   {country}: ✓ {len(extracted)} détection(s) - Score: {confidence}% - Mots-clés: {keywords_found}")
            else:
                print(f"   {country}: − Aucune détection")

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
