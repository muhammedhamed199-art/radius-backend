import { useEffect } from 'react';
import translations from '../autoTranslation.json';

const dict: Record<string, string> = translations;

function translateText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return text;
  
  if (dict[trimmed]) {
    return text.replace(trimmed, dict[trimmed]);
  }
  
  // Also try to translate if it contains some known string
  // This can be slow so we just check direct match for now.
  return text;
}

export default function AutoTranslator({ currentLang }: { currentLang: string }) {
  useEffect(() => {
    if (currentLang !== 'en') return;

    let isTranslating = false;

    const translateNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentElement && (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE')) return;
        const orig = node.textContent || '';
        if (orig.trim().length > 0 && /[\u0600-\u06FF]/.test(orig)) {
          const translated = translateText(orig);
          if (translated !== orig) {
            node.textContent = translated;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          const input = el as HTMLInputElement;
          if (input.placeholder && /[\u0600-\u06FF]/.test(input.placeholder)) {
            const translated = translateText(input.placeholder);
            if (translated !== input.placeholder) {
              input.placeholder = translated;
            }
          }
        }
        node.childNodes.forEach(translateNode);
      }
    };

    // Initial translation
    isTranslating = true;
    translateNode(document.body);
    isTranslating = false;

    // Observe mutations
    const observer = new MutationObserver((mutations) => {
      if (isTranslating) return;
      isTranslating = true;
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => translateNode(node));
        } else if (mutation.type === 'characterData') {
          translateNode(mutation.target);
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'placeholder') {
          translateNode(mutation.target);
        }
      });
      isTranslating = false;
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder']
    });

    return () => observer.disconnect();
  }, [currentLang]);

  return null;
}
