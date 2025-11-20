(() => {
  const PRODUCT_FACTS = {
    'Peanut Butter Cookies': {
      ingredients: [
        'Fresh-ground peanut butter',
        'Brown + cane sugar blend',
        'European butter',
        'Farm eggs',
        'Vanilla bean paste',
        'Unbleached flour',
        'Baking soda and sea salt'
      ],
      allergens: ['Peanuts', 'Wheat (gluten)', 'Eggs', 'Dairy'],
      nutrition: 'Approx. 240 calories per cookie • 3g protein • 14g fat • 24g carbs.'
    },
    'Biscoff Cookies': {
      ingredients: [
        'Browned butter dough',
        'Cane sugar + brown sugar',
        'Eggs',
        'Unbleached flour',
        'Cookie butter swirl',
        'Biscoff crumbs',
        'Baking powder and salt'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy', 'Soy'],
      nutrition: 'Approx. 260 calories per cookie • 16g sugar.'
    },
    'Oreo Cookies': {
      ingredients: [
        'Dark cocoa dough',
        'Butter',
        'Sugar',
        'Farm eggs',
        'Oreo cookie pieces',
        'Vanilla',
        'Unbleached flour'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy', 'Soy (cookies)'],
      nutrition: 'Approx. 250 calories per cookie with 15g sugar.'
    },
    'Twix Cookies': {
      ingredients: [
        'Buttery shortbread dough',
        'Caramel layer',
        'Milk chocolate drizzle',
        'Sugar',
        'Eggs',
        'Vanilla',
        'Unbleached flour'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy', 'Soy'],
      nutrition: 'Approx. 270 calories per cookie • 18g sugar.'
    },
    'Red Velvet Cookies': {
      ingredients: [
        'Cocoa + buttermilk dough',
        'Cream cheese filling',
        'Butter',
        'Sugar',
        'Farm eggs',
        'Unbleached flour'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy'],
      nutrition: 'Approx. 260 calories per cookie.'
    },
    'Chocolate Chip Cookies': {
      ingredients: [
        'Brown butter base',
        'Dark + milk chocolate chips',
        'Cane + brown sugar',
        'Farm eggs',
        'Vanilla',
        'Unbleached flour',
        'Sea salt'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy', 'Soy (chocolate)'],
      nutrition: 'Approx. 240 calories per cookie.'
    },
    'Espresso Cookies': {
      ingredients: [
        'Freshly ground espresso',
        'Dark chocolate chips',
        'Butter',
        'Sugar',
        'Eggs',
        'Unbleached flour'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy', 'Soy'],
      nutrition: 'Approx. 230 calories per cookie • ~35mg caffeine.'
    },
    'Cinnamon Roll Cookies': {
      ingredients: [
        'Brown sugar dough',
        'Cinnamon swirl filling',
        'Butter',
        'Farm eggs',
        'Cream cheese icing',
        'Unbleached flour'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy'],
      nutrition: 'Approx. 250 calories per cookie.'
    },
    'Pumpkin Cookies': {
      ingredients: [
        'Pumpkin purée',
        'Brown sugar',
        'Butter',
        'Warm spices',
        'Farm eggs',
        'Cream cheese glaze',
        'Unbleached flour'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy'],
      nutrition: 'Approx. 245 calories per cookie.'
    },
    'Holiday Specials': {
      ingredients: [
        'Rotating seasonal doughs',
        'House-made fillings and icings',
        'Butter',
        'Sugar',
        'Farm eggs',
        'Unbleached flour'
      ],
      allergens: ['Commonly wheat, eggs, dairy; nuts noted per flavor'],
      nutrition: 'Ranges 220–320 calories per cookie depending on flavor.'
    },
    "S'more Cookies": {
      ingredients: [
        'Graham cracker dough',
        'Brown sugar',
        'Butter',
        'Mini marshmallows',
        'Chocolate chunks',
        'Farm eggs',
        'Unbleached flour'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy', 'Soy (chocolate)', 'Gelatin (marshmallow)'],
      nutrition: 'Approx. 280 calories per cookie.'
    },
    'Monster Cookies': {
      ingredients: [
        'Peanut butter oat dough',
        'Brown sugar',
        'Butter',
        'Farm eggs',
        'Chocolate chips',
        'Candy-coated chocolates',
        'Rolled oats'
      ],
      allergens: ['Peanuts', 'Wheat (gluten)', 'Eggs', 'Dairy', 'Soy; produced near tree nuts'],
      nutrition: 'Approx. 290 calories per cookie with 4g protein.'
    },
    'Peanut Butter Cup Stuffed': {
      ingredients: [
        'Soft peanut butter dough',
        'Reese\'s cups',
        'Brown sugar',
        'Butter',
        'Eggs',
        'Unbleached flour'
      ],
      allergens: ['Peanuts', 'Wheat (gluten)', 'Eggs', 'Dairy', 'Soy'],
      nutrition: 'Approx. 300 calories per cookie.'
    },
    'Caramel Apple Pie': {
      ingredients: [
        'Spiced apple filling',
        'Chewy cookie dough',
        'Caramel drizzle',
        'Butter',
        'Eggs',
        'Unbleached flour'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy'],
      nutrition: 'Approx. 275 calories per cookie.'
    },
    'Mini Cakes (Cream Cheese Frosting)': {
      ingredients: [
        'Buttermilk cake batter',
        'Cane sugar',
        'Soft wheat flour',
        'Farm eggs',
        'European butter',
        'Cream cheese frosting'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy'],
      nutrition: 'Approx. 320 calories per mini cake.'
    },
    'Chocolate Lava Cupcakes': {
      ingredients: [
        'Dark cocoa batter',
        'Molten chocolate ganache',
        'Butter',
        'Sugar',
        'Eggs',
        'Pastry flour'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy', 'Soy (chocolate)'],
      nutrition: 'Approx. 285 calories per cupcake.'
    },
    'Ding Dong Cupcakes': {
      ingredients: [
        'Chocolate sponge cake',
        'Vanilla creme filling',
        'Chocolate glaze',
        'Butter',
        'Sugar',
        'Eggs'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy', 'Soy'],
      nutrition: 'Approx. 270 calories per cupcake.'
    },
    'Holiday Special Cupcakes': {
      ingredients: [
        'Rotating seasonal batter',
        'House-made jams or ganache',
        'Buttercream frosting',
        'Sugar',
        'Eggs',
        'Flour'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy; nuts vary by flavor'],
      nutrition: 'Approx. 260–320 calories per cupcake.'
    },
    'Apple Pie': {
      ingredients: [
        'Hand-laminated pie crust',
        'Idaho apples',
        'Brown sugar + cane sugar',
        'Butter',
        'Cinnamon',
        'Lemon juice'
      ],
      allergens: ['Wheat (gluten)', 'Dairy'],
      nutrition: 'Approx. 360 calories per slice (1/8 pie).'
    },
    'Pumpkin Pie': {
      ingredients: [
        'Buttery pie crust',
        'Pumpkin purée',
        'Brown sugar',
        'Cream + evaporated milk',
        'Farm eggs',
        'Spice blend'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy'],
      nutrition: 'Approx. 340 calories per slice (1/8 pie).'
    },
    'Peach Pie': {
      ingredients: [
        'Buttery double crust',
        'Sun-ripened peaches',
        'Cane sugar',
        'Lemon juice',
        'Butter',
        'Tapioca starch'
      ],
      allergens: ['Wheat (gluten)', 'Dairy'],
      nutrition: 'Approx. 350 calories per slice (1/8 pie).'
    },
    'Lemon Meringue Pie': {
      ingredients: [
        'Buttery pastry shell',
        'Lemon curd (lemons, sugar, eggs)',
        'Italian meringue',
        'Butter',
        'Cornstarch'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy'],
      nutrition: 'Approx. 330 calories per slice (1/8 pie).'
    },
    'Apple Crisp': {
      ingredients: [
        'Baked apples',
        'Brown sugar',
        'Butter',
        'Rolled oats',
        'Flour (gluten-free on request)',
        'Cinnamon'
      ],
      allergens: ['Wheat (gluten) unless GF requested', 'Dairy'],
      nutrition: 'Approx. 310 calories per serving (1 cup).'
    },
    'Pumpkin Crisp': {
      ingredients: [
        'Pumpkin custard base',
        'Brown sugar streusel',
        'Butter',
        'Rolled oats',
        'Warm spices',
        'Vanilla'
      ],
      allergens: ['Wheat (gluten) unless GF requested', 'Dairy', 'Eggs'],
      nutrition: 'Approx. 320 calories per serving.'
    },
    'Peach Cobbler': {
      ingredients: [
        'Spiced peaches',
        'Buttermilk biscuit topping',
        'Butter',
        'Sugar',
        'Unbleached flour'
      ],
      allergens: ['Wheat (gluten)', 'Dairy'],
      nutrition: 'Approx. 330 calories per serving (1 cup).'
    },
    'Milk Bread': {
      ingredients: [
        'Bread flour',
        'Tangzhong starter',
        'Whole milk',
        'Butter',
        'Sugar',
        'Yeast',
        'Eggs'
      ],
      allergens: ['Wheat (gluten)', 'Dairy', 'Eggs'],
      nutrition: 'Approx. 150 calories per slice (1/10 loaf).'
    },
    'Pumpkin Bread': {
      ingredients: [
        'Pumpkin purée',
        'Brown sugar',
        'Spice blend',
        'Flour',
        'Oil + butter',
        'Eggs'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy'],
      nutrition: 'Approx. 220 calories per slice.'
    },
    'Cinnamon Rolls': {
      ingredients: [
        'Enriched dough',
        'Brown sugar cinnamon filling',
        'Butter',
        'Cream cheese icing',
        'Whole milk',
        'Eggs'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy'],
      nutrition: 'Approx. 320 calories per roll (iced).'
    },
    'Pumpkin Muffins': {
      ingredients: [
        'Pumpkin purée',
        'Spiced batter',
        'Brown sugar',
        'Butter + oil',
        'Eggs',
        'Soft wheat flour'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy'],
      nutrition: 'Approx. 210 calories per muffin.'
    },
    'Oatmeal Muffins': {
      ingredients: [
        'Rolled oats',
        'Whole wheat + pastry flour',
        'Brown sugar',
        'Buttermilk',
        'Eggs',
        'Butter'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy'],
      nutrition: 'Approx. 205 calories per muffin with 4g fiber.'
    },
    'Chocolate Dipped Pretzel Rods': {
      ingredients: [
        'Pretzel rods',
        'Milk + dark chocolate coating',
        'Sprinkles or crushed candy',
        'Canola oil (for shine)'
      ],
      allergens: ['Wheat (gluten)', 'Dairy', 'Soy; may contain peanuts/tree nuts from toppings'],
      nutrition: 'Approx. 120 calories per rod.'
    },
    'Vanilla Dipped Pretzel Rods': {
      ingredients: [
        'Pretzel rods',
        'Vanilla confectionery coating',
        'Decorative sprinkles'
      ],
      allergens: ['Wheat (gluten)', 'Dairy', 'Soy; toppings may contact nuts'],
      nutrition: 'Approx. 115 calories per rod.'
    },
    'Candy Dipped Pretzel Rods': {
      ingredients: [
        'Pretzel rods',
        'Milk or white chocolate',
        'Candy bits + drizzle'
      ],
      allergens: ['Wheat (gluten)', 'Dairy', 'Soy', 'May contain peanuts/tree nuts'],
      nutrition: 'Approx. 125 calories per rod.'
    },
    'Brownies - Large': {
      ingredients: [
        'Belgian cocoa',
        'Butter',
        'Sugar',
        'Eggs',
        'Dark chocolate chunks',
        'Unbleached flour',
        'Vanilla'
      ],
      allergens: ['Wheat (gluten)', 'Eggs', 'Dairy', 'Soy (chocolate)', 'Tree nuts on request'],
      nutrition: 'Approx. 380 calories per large brownie.'
    },
    'Pecan English Toffee': {
      ingredients: [
        'European butter toffee',
        'Brown sugar',
        'Roasted pecans',
        'Milk chocolate',
        'Sea salt'
      ],
      allergens: ['Tree nuts (pecans)', 'Dairy', 'Soy (chocolate)'],
      nutrition: 'Approx. 150 calories per ounce (28g).'
    }
  };

  const DEFAULT_FACTS = {
    ingredients: ['Made-from-scratch doughs, seasonal fillings, and farm-fresh dairy or eggs.'],
    allergens: ['Contains wheat (gluten), eggs, and dairy; nuts used in the same kitchen.'],
    nutrition: 'Approx. 200–350 calories per serving; contact us for detailed macros.'
  };

  const ELEMENT_NODE = 1;
  const TEXT_NODE = 3;
  const PRODUCT_CARD_EVENT = 'yf:product-cards-rendered';
  const schedule = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (callback) => setTimeout(callback, 16);
  let backIdCounter = 0;
  let observerStarted = false;

  const enhanceProductCards = () => {
    const cards = Array.from(document.querySelectorAll('.product-card'));
    if (!cards.length) {
      return;
    }

    const closeCard = (card, { returnFocus } = { returnFocus: false }) => {
      if (!card.classList.contains('flipped')) {
        return;
      }
      card.classList.remove('flipped');
      const infoButton = card.querySelector('.info-toggle');
      if (infoButton) {
        infoButton.setAttribute('aria-expanded', 'false');
        if (returnFocus) {
          infoButton.focus();
        }
      }
    };

    const createInfoSection = (title, configure) => {
      const section = document.createElement('div');
      section.className = 'info-section';

      const header = document.createElement('h4');
      header.className = 'section-header';
      header.textContent = title;
      section.appendChild(header);

      const divider = document.createElement('div');
      divider.className = 'thick-divider';
      section.appendChild(divider);

      configure(section);
      return section;
    };

    cards.forEach((card) => {
      if (card.dataset.flipReady === 'true') {
        return;
      }

      const titleEl = card.querySelector('.product-title, h4, h3, h2');
      const title = titleEl ? titleEl.textContent.trim() : 'Yellow Farmhouse Treat';

      const inner = document.createElement('div');
      inner.className = 'product-card-inner';

      const front = document.createElement('div');
      front.className = 'product-card-front';

      while (card.firstChild) {
        front.appendChild(card.firstChild);
      }

      const body = document.createElement('div');
      body.className = 'product-card-front__body';
      const frontChildren = Array.from(front.childNodes);
      frontChildren.forEach((node) => {
        const isImage = node.nodeType === ELEMENT_NODE && node.tagName === 'IMG';
        if (isImage) {
          return;
        }
        if (node.nodeType === TEXT_NODE && !node.textContent.trim()) {
          front.removeChild(node);
          return;
        }
        body.appendChild(node);
      });
      front.appendChild(body);

      const back = document.createElement('div');
      back.className = 'product-card-back';
      const backId = `product-card-back-${++backIdCounter}`;
      back.id = backId;

      const infoButton = document.createElement('button');
      infoButton.type = 'button';
      infoButton.className = 'info-toggle';
      infoButton.setAttribute('aria-label', `View ingredient, allergen, and nutrition info for ${title}`);
      infoButton.setAttribute('aria-controls', backId);
      infoButton.setAttribute('aria-expanded', 'false');
      infoButton.textContent = 'ⓘ';
      front.appendChild(infoButton);

      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'close-info';
      closeButton.setAttribute('aria-label', `Close ingredient info for ${title}`);
      closeButton.textContent = '×';

      const factSet = PRODUCT_FACTS[title] || DEFAULT_FACTS;

      const infoLabel = document.createElement('div');
      infoLabel.className = 'info-label';
      const labelTitle = document.createElement('div');
      labelTitle.className = 'label-title';
      labelTitle.textContent = 'Product Information';
      const productNameBack = document.createElement('div');
      productNameBack.className = 'product-name-back';
      productNameBack.textContent = title;
      infoLabel.appendChild(labelTitle);
      infoLabel.appendChild(productNameBack);

      const ingredientsSection = createInfoSection('INGREDIENTS', (section) => {
        const ingredientText = Array.isArray(factSet.ingredients)
          ? factSet.ingredients.join(', ')
          : factSet.ingredients;
        const paragraph = document.createElement('p');
        paragraph.className = 'ingredient-list';
        paragraph.textContent = ingredientText;
        section.appendChild(paragraph);
      });

      const allergenSection = createInfoSection('ALLERGEN INFORMATION', (section) => {
        const allergenText = Array.isArray(factSet.allergens)
          ? factSet.allergens.join(', ')
          : factSet.allergens;
        const contains = document.createElement('p');
        contains.className = 'allergen-statement';
        const strong = document.createElement('strong');
        strong.textContent = 'Contains:';
        contains.appendChild(strong);
        contains.append(` ${allergenText}`);
        section.appendChild(contains);

        const facility = document.createElement('p');
        facility.className = 'facility-warning';
        facility.textContent = '⚠️ Produced in a facility that also processes tree nuts and soy.';
        section.appendChild(facility);
      });

      const nutritionSection = factSet.nutrition
        ? createInfoSection('NUTRITION NOTES', (section) => {
            const paragraph = document.createElement('p');
            paragraph.className = 'ingredient-list';
            paragraph.textContent = factSet.nutrition;
            section.appendChild(paragraph);
          })
        : null;

      const legalFooter = document.createElement('div');
      legalFooter.className = 'legal-footer';
      const legalCopy = document.createElement('p');
      legalCopy.textContent = 'Made in a home kitchen not inspected by a health department. This product may contain allergens.';
      legalFooter.appendChild(legalCopy);

      back.appendChild(closeButton);
      back.appendChild(infoLabel);
      back.appendChild(ingredientsSection);
      back.appendChild(allergenSection);
      if (nutritionSection) {
        back.appendChild(nutritionSection);
      }
      back.appendChild(legalFooter);

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);
      card.dataset.flipReady = 'true';

      const openCard = () => {
        card.classList.add('flipped');
        infoButton.setAttribute('aria-expanded', 'true');
        closeButton.focus();
      };

      infoButton.addEventListener('click', openCard);
      closeButton.addEventListener('click', () => closeCard(card, { returnFocus: true }));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        return;
      }
      document.querySelectorAll('.product-card.flipped').forEach((card) => {
        closeCard(card, { returnFocus: true });
      });
    });
  };

  const startProductCardObserver = () => {
    if (observerStarted || typeof MutationObserver === 'undefined') {
      return;
    }

    observerStarted = true;
    let pendingRefresh = false;

    const observer = new MutationObserver((mutations) => {
      const shouldRefresh = mutations.some((mutation) => {
        if (!mutation.addedNodes || !mutation.addedNodes.length) {
          return false;
        }

        return Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType !== ELEMENT_NODE) {
            return false;
          }
          if (node.classList && node.classList.contains('product-card')) {
            return true;
          }
          return typeof node.querySelector === 'function' && node.querySelector('.product-card');
        });
      });

      if (!shouldRefresh || pendingRefresh) {
        return;
      }

      pendingRefresh = true;
      schedule(() => {
        pendingRefresh = false;
        enhanceProductCards();
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  const bootProductCards = () => {
    enhanceProductCards();
    document.addEventListener(PRODUCT_CARD_EVENT, enhanceProductCards);
    startProductCardObserver();
    window.yellowFarmhouse = window.yellowFarmhouse || {};
    window.yellowFarmhouse.refreshProductCards = enhanceProductCards;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootProductCards, { once: true });
  } else {
    bootProductCards();
  }
})();
