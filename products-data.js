// products-data.js
// Centralized product database for Yellow Farmhouse Treats
// This is the single source of truth for all product information

const PRODUCTS = [
    // Cookies - Regular Tier
    {
        id: 'chocolate-chip-cookies',
        name: 'Chocolate Chip Cookies',
        tier: 'Regular',
        category: 'cookies',
        description: 'Classic cookies loaded with chocolate chips. Soft and chewy.',
        image: 'images/cookies-chocolate-chip.jpg',
        sizes: [
            { name: '1/2 dozen', price: 12 },
            { name: 'dozen', price: 20 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },
    {
        id: 'peanut-butter-cookies',
        name: 'Peanut Butter Cookies',
        tier: 'Regular',
        category: 'cookies',
        description: 'Rich peanut butter flavor, soft and crumbly. A classic favorite.',
        image: 'images/cookies-peanut-butter.jpg',
        sizes: [
            { name: '1/2 dozen', price: 12 },
            { name: 'dozen', price: 20 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },
    {
        id: 'sugar-cookies',
        name: 'Sugar Cookies',
        tier: 'Regular',
        category: 'cookies',
        description: 'Sweet, buttery cookies with a soft texture. Perfect for any occasion.',
        image: 'images/cookies-sugar.jpg',
        sizes: [
            { name: '1/2 dozen', price: 12 },
            { name: 'dozen', price: 20 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },
    {
        id: 'oatmeal-raisin-cookies',
        name: 'Oatmeal Raisin Cookies',
        tier: 'Regular',
        category: 'cookies',
        description: 'Hearty oatmeal cookies with plump raisins. Chewy and satisfying.',
        image: 'images/cookies-oatmeal-raisin.jpg',
        sizes: [
            { name: '1/2 dozen', price: 12 },
            { name: 'dozen', price: 20 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },

    // Cookies - Fancy Tier
    {
        id: 'mint-fudge-cookies',
        name: 'Mint Fudge Cookies',
        tier: 'Fancy',
        category: 'cookies',
        description: 'Rich mint and fudge combination. Decadent and elegant.',
        image: 'images/cookies-mint-fudge.jpg',
        sizes: [
            { name: '1/2 dozen', price: 15 },
            { name: 'dozen', price: 26 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },
    {
        id: 'salted-caramel-swirl-cookies',
        name: 'Salted Caramel Swirl Cookies',
        tier: 'Fancy',
        category: 'cookies',
        description: 'Buttery cookies with sweet and salty caramel swirl.',
        image: 'images/cookies-salted-caramel.jpg',
        sizes: [
            { name: '1/2 dozen', price: 15 },
            { name: 'dozen', price: 26 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },
    {
        id: 'strawberry-bliss-cookies',
        name: 'Strawberry Bliss Cookies',
        tier: 'Fancy',
        category: 'cookies',
        description: 'Fresh strawberry filling with white chocolate chunks.',
        image: 'images/cookies-strawberry-bliss.jpg',
        sizes: [
            { name: '1/2 dozen', price: 15 },
            { name: 'dozen', price: 26 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },

    // Cookies - Complex Tier
    {
        id: 'matcha-cheesecake-cookies',
        name: 'Matcha Cheesecake Cookies',
        tier: 'Complex',
        category: 'cookies',
        description: 'Sophisticated matcha with creamy cheesecake center.',
        image: 'images/cookies-matcha-cheesecake.jpg',
        sizes: [
            { name: '1/2 dozen', price: 18 },
            { name: 'dozen', price: 32 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },
    {
        id: 'lavender-blueberry-cookies',
        name: 'Lavender Blueberry Cookies',
        tier: 'Complex',
        category: 'cookies',
        description: 'Delicate lavender with tart blueberries.',
        image: 'images/cookies-lavender-blueberry.jpg',
        sizes: [
            { name: '1/2 dozen', price: 18 },
            { name: 'dozen', price: 32 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },
    {
        id: 'triple-layer-cookies',
        name: 'Triple Layer Cookies',
        tier: 'Complex',
        category: 'cookies',
        description: 'Three distinct layers of flavor and texture.',
        image: 'images/cookies-triple-layer.jpg',
        sizes: [
            { name: '1/2 dozen', price: 18 },
            { name: 'dozen', price: 32 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },
    {
        id: 'pecan-english-toffee',
        name: 'Pecan English Toffee',
        emoji: '🍬',
        category: 'cookies',
        description: 'Buttery toffee with crunchy pecans, covered in rich chocolate.',
        image: 'images/toffee-pecan.jpg',
        sizes: [
            { name: '1/2 lb', price: 15 },
            { name: '1 lb', price: 28 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: false,
            vegan: false
        },
        shippable: true // Only item that can be shipped
    },

    // Pies
    {
        id: 'apple-pie',
        name: 'Apple Pie',
        emoji: '🥧',
        category: 'pies',
        description: 'Classic apple pie with a flaky crust and cinnamon apples.',
        image: 'images/pie-apple.jpg',
        sizes: [
            { name: '9 inch pie', price: 25 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },
    {
        id: 'pumpkin-pie',
        name: 'Pumpkin Pie',
        emoji: '🥧',
        category: 'pies',
        description: 'Spiced pumpkin filling in a buttery crust. A holiday favorite.',
        image: 'images/pie-pumpkin.jpg',
        sizes: [
            { name: '9 inch pie', price: 25 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },
    {
        id: 'peach-pie',
        name: 'Peach Pie',
        emoji: '🍑',
        category: 'pies',
        description: 'Sweet peaches baked in a golden crust.',
        image: 'images/pie-peach.jpg',
        sizes: [
            { name: '9 inch pie', price: 25 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: true,
            vegan: false
        },
        shippable: false
    },

    // Breads
    {
        id: 'milk-bread',
        name: 'Milk Bread',
        emoji: '🍞',
        category: 'breads',
        description: 'Soft, fluffy bread made with fresh milk. Perfect for sandwiches.',
        image: 'images/bread-milk.jpg',
        sizes: [
            { name: 'loaf', price: 12 }
        ],
        dietary: {
            glutenFree: true,
            sugarFree: false,
            vegan: false
        },
        shippable: false
    }
];

// Dietary pricing adjustments
const DIETARY_PRICING = {
    glutenFree: 3,
    sugarFree: 3,
    vegan: 2
};

// Payment methods
const PAYMENT_METHODS = {
    cash: { name: 'Cash', instructions: 'Payment due at pickup' },
    cashapp: { name: 'Cash App', instructions: 'Send payment to $YellowFarmhouse' },
    venmo: { name: 'Venmo', instructions: 'Send payment to @YellowFarmhouse' },
    paypal: { name: 'PayPal', instructions: 'Send payment to yellowfarmhouse@email.com' },
    zelle: { name: 'Zelle', instructions: 'Send payment to (555) 123-4567' }
};

// Shipping ZIP codes and costs
const SHIPPING_ZONES = {
    '12345': 5.00,
    '12346': 5.00,
    '12347': 7.50,
    '12348': 7.50,
    '12349': 10.00
};

// Make data available globally
window.PRODUCTS = PRODUCTS;
window.DIETARY_PRICING = DIETARY_PRICING;
window.PAYMENT_METHODS = PAYMENT_METHODS;
window.SHIPPING_ZONES = SHIPPING_ZONES;

// Apply site configuration overrides
(function applyConfigOverrides() {
    // Only run if site-config is available
    if (window.siteConfig && typeof window.siteConfig.get === 'function') {
        const config = window.siteConfig.get();
        
        // Apply soldOut flags to products
        if (config.soldOutProducts && Array.isArray(config.soldOutProducts)) {
            window.PRODUCTS.forEach(product => {
                product.soldOut = config.soldOutProducts.includes(product.id);
            });
        }
        
        // Store orders paused state globally
        window.ORDERS_PAUSED = config.ordersPaused || false;
        
        console.log('Site config applied:', {
            soldOutCount: config.soldOutProducts.length,
            ordersPaused: config.ordersPaused,
            lastUpdated: config.lastUpdated
        });
    } else {
        // Fallback when site-config not available
        window.ORDERS_PAUSED = false;
        console.log('Site config not available - using defaults');
    }
})();