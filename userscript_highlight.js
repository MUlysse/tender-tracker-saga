// ==UserScript==
// @name         Tender Tracker - Keyword Highlighter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Surligne les mots-clés détectés par Tender Tracker SAGA
// @author       Tender Tracker SAGA
// @match        *://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACw=
// @grant        GM_openInTab
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Récupérer les mots-clés depuis localStorage
    const highlightFlag = localStorage.getItem('tenderTrackerHighlight');
    const keywordsJson = localStorage.getItem('tenderTrackerKeywords');

    if (!highlightFlag || !keywordsJson) {
        return; // Pas de mots-clés à surligner
    }

    try {
        const keywords = JSON.parse(keywordsJson);

        if (!Array.isArray(keywords) || keywords.length === 0) {
            return;
        }

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

    } catch (e) {
        console.error('Erreur Tender Tracker:', e);
    }
})();
