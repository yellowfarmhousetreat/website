const legacyScripts = [
	'assets/js/perf.js',
	'assets/js/jquery.min.js',
	'assets/js/jquery.scrollex.min.js',
	'assets/js/jquery.scrolly.min.js',
	'assets/js/browser.min.js',
	'assets/js/breakpoints.min.js',
	'assets/js/util.js',
	'assets/js/main.js',
	'assets/js/overlay-menu.js'
];

const defaultScriptAttributes = {
	async: false,
	defer: false
};

const ensureLegacyScript = (src) => new Promise((resolve, reject) => {
	if (document.querySelector(`script[data-legacy-script="${src}"]`)) {
		resolve();
		return;
	}

	const script = document.createElement('script');
	script.src = src;
	script.async = defaultScriptAttributes.async;
	script.defer = defaultScriptAttributes.defer;
	script.dataset.legacyScript = src;
	script.addEventListener('load', () => resolve());
	script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
	document.head.appendChild(script);
});

async function bootSiteShell() {
	for (const script of legacyScripts) {
		try {
			await ensureLegacyScript(script);
		} catch (error) {
			console.error(error);
		}
	}

	await import('../../site-config.js');
	await import('../../cart.js');
	await import('../../product-loader.js');
}

export const siteShellReady = bootSiteShell();
