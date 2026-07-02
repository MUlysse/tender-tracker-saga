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
import re
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.chrome.service import Service
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

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
REQUEST_TIMEOUT = 30  # Augmenté pour les sites lents
REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
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
                     'footer', 'svg', 'canvas', 'iframe', 'embed', 'object',
                     'head', 'table', 'tbody', 'thead', 'tr', 'td', 'th']:
        return False

    # Balises de tableau (données structurées non-visibles)
    if tag.name in ['table', 'tbody', 'thead', 'tr', 'td', 'th', 'col', 'colgroup']:
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

def get_visible_text_only(soup):
    """
    Extrait UNIQUEMENT le texte visible (équivalent Ctrl+F).
    Enlève tout contenu caché, tableaux, scripts, etc.
    C'est la vraie source de vérité pour la recherche de mots-clés.
    """
    # Faire une copie pour ne pas modifier l'original
    soup_copy = BeautifulSoup(str(soup), 'html.parser')

    # Enlever TOUT contenu invisible/structuré
    for invisible in soup_copy(['script', 'style', 'noscript', 'meta', 'link',
                               'svg', 'canvas', 'iframe', 'embed', 'object',
                               'nav', 'footer', 'table', 'thead', 'tbody', 'tr', 'td', 'th']):
        invisible.decompose()

    # Enlever les éléments avec display:none, visibility:hidden, etc.
    for element in soup_copy.find_all(True):
        if element.name and element.get('hidden'):
            element.decompose()
            continue
        if element.get('aria-hidden') == 'true':
            element.decompose()
            continue

        style = element.get('style', '').lower()
        if any(x in style for x in ['display:none', 'visibility:hidden', 'visibility:collapse',
                                     'opacity:0', 'height:0', 'width:0']):
            element.decompose()

    # Extraire le texte visible avec normalisation
    visible_text = soup_copy.get_text(separator=' ', strip=True)
    # Normaliser les espaces
    visible_text = ' '.join(visible_text.split())
    return visible_text

def is_text_truly_visible(text, visible_text):
    """
    Vérifie que le texte existe VRAIMENT dans le contenu visible (Ctrl+F).
    Prend le texte et la source visible en paramètres.
    """
    if not text or len(text) < 5 or not visible_text:
        return True

    # Normaliser
    text_norm = ' '.join(text.split()).lower()
    visible_norm = visible_text.lower()

    # Chercher le texte COMPLET dans le visible (au minimum 30 chars)
    if len(text_norm) > 30:
        # Chercher une partie significative (les 30 premiers chars)
        search_text = text_norm[:30]
        return search_text in visible_norm
    else:
        # Texte court: chercher le texte complet
        return text_norm in visible_norm

def scrape_portal_with_selenium(country, url):
    """
    Scrape un portail avec Selenium pour exécuter le JavaScript.
    Utilisé pour les sites dynamiques (comme Onoris).
    """
    if not SELENIUM_AVAILABLE:
        return None

    driver = None
    try:
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_argument(f'user-agent={REQUEST_HEADERS["User-Agent"]}')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-web-resources')
        options.add_argument('--disable-default-apps')

        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
        except Exception as e_driver:
            try:
                driver = webdriver.Chrome(options=options)
            except Exception:
                return None

        driver.set_page_load_timeout(30)
        driver.set_script_timeout(30)

        try:
            driver.get(url)

            # Attendre le chargement du DOM
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )

            # Attendre que le document soit complètement chargé
            try:
                WebDriverWait(driver, 10).until(
                    lambda d: d.execute_script("return document.readyState") == "complete"
                )
            except:
                pass

            # Attendre les animations
            time.sleep(3)

            # EXTRAIRE LE TEXTE VISIBLE VIA JAVASCRIPT
            # C'est le texte que l'utilisateur voit RÉELLEMENT
            visible_text = driver.execute_script("""
                // Enlever les éléments cachés
                const hidden = document.querySelectorAll('script, style, noscript, meta, link, head');
                hidden.forEach(el => el.remove());

                // Obtenir le texte du BODY seulement
                const body = document.body;
                if (!body) return '';

                // Extraire le texte visible (innerText évalue le CSS)
                return body.innerText || body.textContent || '';
            """)

            if visible_text and len(visible_text.strip()) > 100:
                # Retourner le texte directement (pas l'HTML)
                return visible_text
            else:
                return None

        except Exception as e:
            return None

    except Exception as e:
        return None

    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass

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

    # REJET: Contenu HTML mal parsé (beaucoup de majuscules sans espaces)
    # Ex: "NomAutoritéContractanteNomServiceLibellé" = parsé du tableau
    words = text.split()
    if len(words) > 0:
        # Vérifier si c'est du texte normal (50% minimum de minuscules)
        lowercase_ratio = sum(1 for c in text if c.islower()) / len(text)
        if lowercase_ratio < 0.3:  # Moins de 30% de minuscules = suspect
            score -= 45

        # Vérifier la longueur moyenne des mots (texte normal = 4-7 chars/mot)
        avg_word_len = len(text.replace(' ', '')) / len(words)
        if avg_word_len > 12:  # Mots très longs = contenu mal parsé
            score -= 30

    # Cap à 100, min à 0
    final_score = max(0, min(score, 100))
    return final_score

def extract_tender_info(url, html_or_text, country, source_keywords):
    """
    ULTRA-SIMPLE ET FIABLE:
    1. Si c'est du HTML (requests), parser avec BeautifulSoup
    2. Si c'est du texte brut (Selenium), utiliser directement
    3. Chercher les mots-clés
    4. Créer la détection si trouvés
    """
    tenders = []

    try:
        # Déterminer si c'est du HTML ou du texte brut
        is_html = '<' in html_or_text and '>' in html_or_text

        if is_html:
            # C'est du HTML (de requests)
            soup = BeautifulSoup(html_or_text, 'html.parser')

            # Enlever HEAD et autres éléments invisibles
            for tag in soup(['head', 'script', 'style', 'noscript', 'meta', 'link']):
                tag.decompose()

            # Extraire le texte du BODY
            body = soup.find('body') or soup
            visible_text = body.get_text(separator=' ', strip=True)
        else:
            # C'est du texte brut (de Selenium JavaScript)
            visible_text = html_or_text

        # Normaliser les espaces
        visible_text = ' '.join(visible_text.split())

        # Validation minimale
        if not visible_text or len(visible_text) < 100:
            return tenders

        # Chercher les mots-clés
        matched_keywords = contains_target_keywords(visible_text)

        if not matched_keywords:
            return tenders

        # Créer la détection
        tender_hash = hashlib.md5(f"{url}{datetime.utcnow().isoformat()}".encode()).hexdigest()

        tenders.append({
            'id': tender_hash,
            'country': country,
            'title': visible_text[:150],
            'url': url,
            'detected_at': datetime.utcnow().isoformat(),
            'matched_keywords': list(set(matched_keywords[:5])),
            'confidence': 85.0
        })

    except Exception as e:
        print(f"⚠️  Erreur lors du parsing de {country}: {e}")

    return tenders

def scrape_portal(country, url):
    """
    Approche pragmatique:
    1. Requests d'abord (RAPIDE)
    2. Selenium SEULEMENT en fallback (si requests échoue)
    """
    tenders = []
    html_content = None

    try:
        # ÉTAPE 1: Essayer requests (rapide)
        try:
            response = requests.get(
                url,
                headers=REQUEST_HEADERS,
                timeout=REQUEST_TIMEOUT,
                verify=True,
                allow_redirects=True
            )
            response.encoding = 'utf-8'

            if response.status_code == 404:
                print(f"   {country}: 404 - ignoré")
                time.sleep(RATE_LIMIT_DELAY)
                return tenders

            if response.status_code == 200:
                html_content = response.text

        except requests.exceptions.Timeout:
            print(f"   {country}: Timeout (requests) - Selenium fallback...")
        except requests.exceptions.ConnectionError:
            print(f"   {country}: Erreur connexion - Selenium fallback...")
        except requests.exceptions.HTTPError:
            print(f"   {country}: HTTPError - Selenium fallback...")

        # ÉTAPE 2: Fallback à Selenium si requests échoue
        if not html_content and SELENIUM_AVAILABLE:
            html_content = scrape_portal_with_selenium(country, url)
            if html_content:
                print(f"   {country}: ✓ Contenu Selenium récupéré")

        # ÉTAPE 3: Scraper si on a du contenu
        if html_content:
            extracted = extract_tender_info(url, html_content, country, TARGET_KEYWORDS)
            tenders.extend(extracted)

            if extracted:
                keywords_found = ', '.join(extracted[0]['matched_keywords'][:3])
                confidence = extracted[0].get('confidence', 'N/A')
                print(f"   {country}: ✓ {len(extracted)} détection(s) - Score: {confidence}% - Mots-clés: {keywords_found}")
            else:
                print(f"   {country}: − Aucune détection")
        else:
            print(f"   {country}: ❌ Impossible de scraper")

    except Exception as e:
        print(f"   {country}: ❌ Erreur - {type(e).__name__}")

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
                    'footer': {'text': f"Détecté: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC"}
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
    print(f"  Selenium disponible: {'✅ OUI' if SELENIUM_AVAILABLE else '❌ NON'}")

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
        'last_updated': datetime.utcnow().isoformat(),
        'new_tenders_count': len(new_tenders)
    }

    save_data(updated_data)
    print("\n" + "=" * 70)
    print("Scraping terminé avec succès")
    print("=" * 70)

if __name__ == '__main__':
    main()
