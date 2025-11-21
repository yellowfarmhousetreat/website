/**
 * THEME LOADER
 * Applies design tokens and content from external JSON configuration.
 * Allows for "live" updates without code changes.
 */

class ThemeLoader {
    constructor(options = {}) {
        this.themeUrl = options.themeUrl || 'data/theme.json';
        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.themeUrl);
            if (!response.ok) throw new Error('Failed to load theme config');
            const theme = await response.json();
            
            this.applyColors(theme.colors);
            this.applyContent(theme.content);
            
            console.log('🎨 Theme & Content loaded successfully');
        } catch (error) {
            console.warn('Theme load failed, using CSS defaults:', error);
        }
    }

    applyColors(colors) {
        if (!colors) return;
        const root = document.documentElement;
        
        if (colors.bg) root.style.setProperty('--color-bg', colors.bg);
        if (colors.surface) root.style.setProperty('--color-surface', colors.surface);
        if (colors.panel) root.style.setProperty('--color-panel', colors.panel);
        if (colors.accent) {
            root.style.setProperty('--color-accent', colors.accent);
            root.style.setProperty('--color-link-inline', colors.accent);
        }
        if (colors.btnPrimary) root.style.setProperty('--color-btn-primary', colors.btnPrimary);
        if (colors.btnHover) root.style.setProperty('--color-btn-hover', colors.btnHover);
        if (colors.success) root.style.setProperty('--color-success', colors.success);
        if (colors.danger) root.style.setProperty('--color-danger', colors.danger);
    }

    applyContent(content) {
        if (!content) return;

        // Helper to safely set text content
        const setText = (selector, text) => {
            const els = document.querySelectorAll(selector);
            els.forEach(el => el.textContent = text);
        };

        // Helper to safely set HTML content (for addresses with <br>)
        const setHtml = (selector, html) => {
            const els = document.querySelectorAll(selector);
            els.forEach(el => el.innerHTML = html);
        };

        // Helper to set href attributes
        const setLink = (selector, url) => {
            const els = document.querySelectorAll(selector);
            els.forEach(el => el.href = url);
        };

        if (content.siteTitle) setText('title', content.siteTitle);
        if (content.siteTitle) setText('.logo', content.siteTitle);
        
        // Address & Contact
        if (content.address) setHtml('.contact .alt p', content.address);
        if (content.phone) {
            setText('.contact section:nth-child(2) p a', content.phone);
            setLink('.contact section:nth-child(2) p a', `tel:${content.phone.replace(/[^\d+]/g, '')}`);
        }
        if (content.email) {
            setText('.contact section:nth-child(3) p a', content.email);
            setLink('.contact section:nth-child(3) p a', `mailto:${content.email}`);
        }

        // Social Links
        if (content.facebook) setLink('a[aria-label="Facebook"]', content.facebook);
        if (content.instagram) setLink('a[aria-label="Instagram"]', content.instagram);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Check for override path (useful for admin preview)
    const path = window.THEME_CONFIG_URL || 'data/theme.json';
    new ThemeLoader({ themeUrl: path });
});
