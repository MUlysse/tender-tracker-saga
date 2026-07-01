// ==UserScript==
// @name         Tender Tracker - Auto Search Keywords
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Cherche automatiquement les mots-clés détectés par Tender Tracker SAGA avec Ctrl+F
// @author       Tender Tracker SAGA
// @match        *://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACw=
// @grant        GM_openInTab
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Vérifier le fragment URL pour Tender Tracker
    const hash = window.location.hash;
    const tendertrackerMatch = hash.match(/tender-tracker-search:(.+?)(?:$|&)/);

    if (tendertrackerMatch) {
        const keyword = decodeURIComponent(tendertrackerMatch[1]);

        // Lancer la recherche avec Ctrl+F
        setTimeout(() => {
            launchSearch(keyword);
        }, 500);
    }

    function launchSearch(keyword) {
        // Méthode 1 : Utiliser window.find() (fonctionnalité native mais limitée)
        window.find(keyword, false, false, true);

        // Méthode 2 : Simuler Ctrl+F pour ouvrir le Find Bar du navigateur
        const event = new KeyboardEvent('keydown', {
            key: 'f',
            code: 'KeyF',
            keyCode: 70,
            which: 70,
            ctrlKey: true,
            metaKey: true,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);

        // Attendre un peu et essayer de remplir le champ de recherche s'il est accessible
        setTimeout(() => {
            tryAutoFillSearch(keyword);
        }, 100);
    }

    function tryAutoFillSearch(keyword) {
        // Essayer de trouver et remplir le champ de recherche du navigateur
        // Cela varie selon les navigateurs mais on peut essayer
        const searchInput = document.querySelector('[role="searchbox"]') ||
                           document.querySelector('input[type="search"]') ||
                           document.querySelector('input[placeholder*="Search"]') ||
                           document.querySelector('input[placeholder*="Chercher"]');

        if (searchInput) {
            searchInput.value = keyword;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Aussi surligner le mot-clé si possible
        try {
            highlightKeywordInPage(keyword);
        } catch (e) {
            console.log('Highlight non disponible:', e.message);
        }
    }

    function highlightKeywordInPage(keyword) {
        // Surligner les occurrences du mot-clé
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const nodesToReplace = [];
        let node;

        while (node = walker.nextNode()) {
            const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
            if (regex.test(node.nodeValue)) {
                nodesToReplace.push(node);
            }
        }

        nodesToReplace.forEach(node => {
            let html = node.nodeValue;
            const regex = new RegExp(`(\\b${keyword.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b)`, 'gi');
            html = html.replace(regex, '<mark style="background-color: #FFFF00; color: black; font-weight: bold; padding: 2px; border-radius: 2px; border: 1px solid #FFA500;">$1</mark>');

            const span = document.createElement('span');
            span.innerHTML = html;
            node.parentNode.replaceChild(span, node);
        });

        // Afficher badge
        addSearchBadge(keyword);
    }

    function addSearchBadge(keyword) {
        const badge = document.createElement('div');
        badge.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #FFFF00;
            border: 2px solid #FFA500;
            border-radius: 8px;
            padding: 12px 16px;
            z-index: 99999;
            font-family: Arial, sans-serif;
            font-size: 12px;
            font-weight: bold;
            color: black;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            cursor: pointer;
        `;
        badge.innerHTML = `🔍 Cherchant :<br>"${keyword}"`;
        badge.onclick = () => badge.remove();
        document.body.appendChild(badge);

        setTimeout(() => {
            if (badge.parentNode) {
                badge.style.opacity = '0.6';
            }
        }, 3000);
    }

    // Ancienne méthode (localStorage) - toujours supportée
    const highlightFlag = localStorage.getItem('tenderTrackerHighlight');
    const keywordsJson = localStorage.getItem('tenderTrackerKeywords');

    if (highlightFlag && keywordsJson) {
        try {
            const keywords = JSON.parse(keywordsJson);

            if (Array.isArray(keywords) && keywords.length > 0) {
                // Nettoyer le flag pour la prochaine page
                localStorage.removeItem('tenderTrackerHighlight');
                localStorage.removeItem('tenderTrackerKeywords');

                // Couleurs de surlignage
                const highlightColor = '#FFFF00';
                const backgroundColor = '#FFD700';
                const borderColor = '#FFA500';

                // Fonction pour surligner le texte
                function highlightText() {
                    const walker = document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                    );

                    const nodesToReplace = [];

                    let node;
                    while (node = walker.nextNode()) {
                        const text = node.nodeValue;
                        let hasKeyword = false;

                        // Vérifier si ce node contient un mot-clé
                        keywords.forEach(keyword => {
                            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                            if (regex.test(text)) {
                                hasKeyword = true;
                            }
                        });

                        if (hasKeyword) {
                            nodesToReplace.push(node);
                        }
                    }

                    // Remplacer les nodes avec du texte surligné
                    nodesToReplace.forEach(node => {
                        let html = node.nodeValue;
                        keywords.forEach(keyword => {
                            const regex = new RegExp(`(\\b${keyword}\\b)`, 'gi');
                            html = html.replace(regex, `<mark style="background-color: ${highlightColor}; color: black; font-weight: bold; padding: 2px 4px; border-radius: 2px; border: 1px solid ${borderColor};">$1</mark>`);
                        });

                        const span = document.createElement('span');
                        span.innerHTML = html;
                        node.parentNode.replaceChild(span, node);
                    });

                    // Ajouter un badge en haut à droite
                    addHighlightBadge(keywords.length);
                }

                // Ajouter un badge qui montre le nombre de mots-clés surlignés
                function addHighlightBadge(count) {
                    const badge = document.createElement('div');
                    badge.id = 'tender-tracker-badge';
                    badge.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background-color: #FFD700;
                        border: 2px solid #FFA500;
                        border-radius: 8px;
                        padding: 12px 16px;
                        z-index: 9999;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        font-weight: bold;
                        color: black;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                        cursor: pointer;
                        text-align: center;
                    `;
                    badge.innerHTML = `🔍 Tender Tracker<br>${count} mot(s)-clé(s)`;
                    badge.title = 'Mots-clés surlignés par Tender Tracker SAGA';
                    badge.onclick = () => {
                        badge.style.display = badge.style.display === 'none' ? 'block' : 'none';
                    };

                    document.body.appendChild(badge);

                    // Auto-hide après 10 secondes
                    setTimeout(() => {
                        badge.style.opacity = '0.6';
                    }, 10000);
                }

                // Exécuter le surlignage
                highlightText();
            }
        } catch (e) {
            console.error('Erreur Tender Tracker localStorage:', e);
        }
    }
})();
