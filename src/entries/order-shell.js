import { siteShellReady } from './site-shell.js';

(async () => {
	await siteShellReady;
	await import('../../assets/js/order.js');
})();
