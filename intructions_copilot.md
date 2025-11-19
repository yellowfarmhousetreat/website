# Yellow Farmhouse Treats - Website Modernization Project

## PROJECT OVERVIEW
Modernize yellowfarmhousetreats.com bakery e-commerce site using Massively HTML5 UP template. Brand alignment: domain matches baker's Gmail (yellowfarmhousetreats@gmail.com).

## CRITICAL REQUIREMENTS - READ FIRST

### Absolute Rules (NEVER violate):
1. **NO EMOJIS** anywhere in code - user explicitly stated "we don't need the emoji stuff"
2. **PayPal ONLY** for payments - no credit cards except through PayPal
3. **Mobile-first design** - compact, top-focused layout to reduce scrolling on phones
4. **Separate HTML pages** per category - NOT single-page tabs (user rejected that approach)
5. **Modular structure** - baker needs to easily edit menu as new recipes are developed

### Reference Material:
- Use `reference_document.md` for working cart logic, payment methods, dietary options from yellowfarmhousestand.com
- Port all functional code but adapt to new template structure

## SITE ARCHITECTURE

### Navigation Structure:
**Main Navigation (on all pages):** Home | Menu | Order

### Page Hierarchy:
```
index.html (HOME)
  ├── Instagram feed (SnapWidget embed)
  ├── Quick Menu Tabs (linking to menu.html sections)
  └── Social links and contact info
menu.html (UNIFIED MENU/ORDER SYSTEM)
  ├── Tab-based navigation for user experience
  ├── Cookie Tiers: Simple | Fancy | Complex
  ├── Categories: Cookies | Cakes | Pies & Crisps | Breads & More | All Items
  └── Integrated cart and ordering system
order.html (CART/CHECKOUT)

BACKEND MAINTENANCE PAGES (for easy product editing):
  ├── cookies.html (individual cookie products)
  ├── cakes.html (individual cake products) 
  ├── pies.html (individual pie products)
  └── breads.html (individual bread products)
```

### Files to Create/Update:

#### 1. index.html (Homepage) - CURRENT IMPLEMENTATION ✓
**Current Features (as implemented):**
- Hero section: "YELLOW FARMHOUSE TREATS" with continue button
- Instagram showcase section with SnapWidget embed (widget ID: 1112051)
- Quick Menu Tabs navigation linking to menu.html sections:
  - Cookies → menu.html#cookies
  - Cakes → menu.html#cakes  
  - Pies & Crisps → menu.html#pies
  - Breads & More → menu.html#breads
  - All Items → menu.html#all
- Contact section in footer with:
  - Address: 22659 Farmway Road, Caldwell, ID 83646
  - Phone: (805) 709-4686
  - Email: yellowfarmhousetreats@gmail.com
  - Social: Facebook & Instagram icons
- Proper template CSS links and no cart.js (correct)
- **NOTE:** No separate category preview cards - uses integrated Quick Menu Tabs instead

#### 2. menu.html (Unified Menu/Order System) - CURRENT IMPLEMENTATION ✓
**Current Features (as implemented):**
- **Dual Architecture:** Single-page tab interface for user experience + separate backend pages for maintenance
- **Tab-based navigation:** Cookies | Cakes | Pies & Crisps | Breads & More | All Items
- **Cookie tier system:** Simple | Fancy | Complex (for different cookie complexity levels)
- **Integrated cart functionality:** Real-time cart updates with cart.js
- **Responsive design:** Works across desktop, tablet, mobile
- **JavaScript switching:** Uses data-category attributes for seamless user experience
- **Backend connection:** Links to individual product pages for maintenance ease

#### 3. Backend Product Pages (cookies.html, cakes.html, pies.html, breads.html)
**Purpose:** Individual maintenance pages for easy product editing (NOT primary user interface)

**Current Implementation:**
- **Simplified navigation:** Home | Menu | Order (consistent with main site)
- **Product grid layout:** Clean, maintainable structure
- **Each product card contains:**
  - Product name and description
  - Price display
  - Image references (linked to images/ folder)
  - Dietary option checkboxes (GF/SF)
  - Quantity input controls
  - "Add to Cart" functionality
- **Integration:** Links cart.js for functionality testing
- **Usage:** Primarily for backend maintenance, secondary user access

**Product Data (from reference_document.md):**

**Cookies:**
- Chocolate Chip Cookies - $12/dozen
- Peanut Butter Cookies - $12/dozen
- Sugar Cookies - $10/dozen
- Oatmeal Raisin Cookies - $12/dozen
- Snickerdoodles - $12/dozen

**Cakes:**
- Chocolate Cake (8-inch) - $35
- Vanilla Cake (8-inch) - $32
- Carrot Cake (8-inch) - $38
- Red Velvet Cake (8-inch) - $40
- Custom Cake - Contact for pricing

**Pies:**
- Apple Pie (9-inch) - $25
- Pumpkin Pie (9-inch) - $22
- Pecan Pie (9-inch) - $28
- Cherry Pie (9-inch) - $26
- Berry Pie (9-inch) - $24

**Breads:**
- Sourdough Loaf - $8
- Whole Wheat Bread - $7
- Cinnamon Swirl Bread - $9
- Banana Bread - $10
- Zucchini Bread - $10

#### 4. order.html (Shopping Cart & Checkout) - CURRENT FILENAME ✓
**Current Implementation:** 
*Note: Site uses `order.html` instead of `cart.html` - navigation reflects this*

**Features (as implemented):**
- **Cart display:** Table format with product details, quantities, dietary options
- **Interactive controls:** Editable quantities, remove buttons, real-time updates  
- **Cart summary:** Subtotal, shipping (if applicable), total calculations
- **Checkout integration:** Customer info forms, delivery/pickup options
- **Payment processing:** PayPal integration (no credit cards)
- **Navigation:** "Continue Shopping" links back to menu.html
- **Cart management:** Empty cart functionality, persistent storage
- **JavaScript integration:** Full cart.js integration for real-time updates

#### 5. cart.js (Shopping Cart Logic)
**Core Functions Required:**

```javascript
// localStorage structure
{
  cart: [
    {
      id: unique_id,
      name: "Product Name",
      price: 12.00,
      quantity: 2,
      gf: false,  // gluten free
      sf: false   // sugar free
    }
  ]
}

// Required functions:
- addToCart(product) - Add item with dietary options
- removeFromCart(id) - Remove specific item
- updateQuantity(id, newQty) - Update item quantity
- getCart() - Retrieve cart from localStorage
- saveCart(cart) - Save cart to localStorage
- calculateTotal() - Sum all items
- updateCartCount() - Update badge in nav (all pages)
- clearCart() - Empty entire cart
```

**Important:**
- Use `localStorage.setItem()` and `localStorage.getItem()` for persistence
- Cart must work across all pages (cookies.html, cakes.html, etc.)
- Update cart count badge on page load
- Handle dietary option price modifiers (e.g., +$2 for GF)

## STYLING REQUIREMENTS

### Design Philosophy:
- **Mobile-first:** Elements compact and near top of screen
- **Clean & minimal:** Let products shine, no clutter
- **Fast loading:** Optimize images, minimize JS

### CSS Framework:
- Use the custom dark-mode stylesheet `assets/css/app.css` as the single source of truth
- Avoid adding inline `<style>` overrides or new CSS files; consolidate everything into `app.css`
- Responsive breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### Color Scheme:
- Keep Massively template defaults
- Ensure good contrast for accessibility

## INSTAGRAM INTEGRATION

SnapWidget embed code (for index.html):
```html
<!-- SnapWidget -->
<div class="instagram-feed">
  <h2>Check Out Our Latest Creations!</h2>
  <p>Posts from Instagram</p>
  <script src="https://snapwidget.com/js/snapwidget.js"></script>
  <iframe src="https://snapwidget.com/embed/WIDGET_ID" class="snapwidget-widget" allowtransparency="true" frameborder="0" scrolling="no" style="border:none; overflow:hidden; width:100%; "></iframe>
  <p>Follow <a href="https://instagram.com/yellowfarmhousestand" target="_blank">@yellowfarmhousestand</a> for daily updates!</p>
</div>
```

## PAYMENT PROCESSING

### PayPal Integration:
- Use PayPal button/form (user will provide merchant ID)
- Pass cart data to PayPal
- No Stripe, Square, or credit card forms

### Order Flow:
1. Customer adds items to cart
2. Reviews cart at cart.html
3. Fills out contact/delivery info
4. Clicks PayPal button
5. Completes payment on PayPal
6. Returns to confirmation page

## TECHNICAL SPECIFICATIONS

### Browser Support:
- Chrome, Firefox, Safari, Edge (modern versions)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

### Performance:
- Lazy load images where possible
- Minimize JavaScript bundle
- Keep cart.js < 10KB

### Accessibility:
- Semantic HTML5 elements
- Alt text for all images
- ARIA labels where needed
- Keyboard navigation support

## DEPLOYMENT

### Hosting:
- GitHub Pages: yellowfarmhousetreat.github.io
- Custom domain: www.yellowfarmhousetreats.com
- CNAME file already configured

### DNS (Already Set Up):
- GoDaddy CNAME: www → yellowfarmhousetreat.github.io
- Propagation time: 10 mins - 48 hrs

## FILE STRUCTURE

```
website/
├── index.html              (Homepage with Instagram feed)
├── menu.html               (Category landing page)
├── cookies.html            (Cookies products)
├── cakes.html              (Cakes products)
├── pies.html               (Pies products)  
├── breads.html             (Breads products)
├── cart.html               (Shopping cart & checkout)
├── assets/
│   ├── css/
│   │   ├── app.css
│   │   └── fontawesome-all.min.css
│   └── js/
│       └── cart.js         (Shopping cart logic)
├── images/                 (Product photos)
├── CNAME                   (www.yellowfarmhousetreats.com)
└── reference_document.md   (Working code from old site)
```

## MAINTENANCE & EDITING

### For Baker to Update Menu:
1. Open relevant product page (e.g., cookies.html)
2. Find product grid section
3. Copy existing product card HTML
4. Paste and edit:
   - Product name
   - Description  
   - Price
   - Image src
5. Save and push to GitHub
6. Site updates automatically

### Adding New Products:
- Follow same card structure
- Ensure unique product ID for cart.js
- Test "Add to Cart" functionality

## TESTING CHECKLIST

Before marking complete, verify:

- [ ] All pages load without errors
- [ ] Navigation works across all pages
- [ ] Instagram feed displays correctly
- [ ] Add to Cart works on all product pages
- [ ] Cart count updates in real-time
- [ ] Cart persists across page navigation
- [ ] Quantity updates work
- [ ] Remove from cart works
- [ ] Dietary options (GF/SF) can be selected
- [ ] Total calculates correctly
- [ ] PayPal button present on cart.html
- [ ] Mobile responsive (test on phone)
- [ ] No emojis anywhere in code
- [ ] All links work (no 404s)
- [ ] Images load (or placeholders shown)

## KNOWN ISSUES & FIXES

### Issue 1: Broken index.html (Fixed)
**Problem:** index.html showed only git commit message  
**Solution:** Restored from commit 0f8eb93 with proper HTML structure

### Issue 2: DNS Configuration
**Status:** RESOLVED - www.yellowfarmhousetreats.com is live
**Setup:** CNAME points to yellowfarmhousetreat.github.io

### Issue 3: Optimization Disaster (2025-11-17)
**Problem:** Aggressive performance optimization broke site functionality  
**What Happened:** Attempted to optimize by:
- Removing "unused" JavaScript libraries (broke template functionality)
- Creating minified CSS versions (lost custom styling) 
- Modifying font loading (broke design)
- Removing template images (some were needed)
**Resolution:** Used `git reset --hard ccf1124` to restore to working state before optimization attempts
**Lesson Learned:** NEVER optimize without creating separate branch first; template dependencies are complex

## CRITICAL WORKFLOW RULES - LESSONS LEARNED

### For Future AI Assistants:
1. **NEVER remove files without explicit approval** - "unused" files may be template dependencies
2. **Create branches for experimentation** - use `git checkout -b optimization` before major changes
3. **Test incrementally** - make one change at a time, test, commit
4. **Ask before optimizing** - user's custom work takes absolute priority over performance
5. **Template libraries matter** - jQuery, scrolling effects, breakpoints.min.js are all required
6. **When in doubt, don't** - preservation > optimization

### Current Working State (2025-11-17):
- **Status:** MODERNIZED with centralized product management system
- **Architecture:** Option A implementation - minimal individual HTML files with dynamic product loading
- **New System:**
  - `products-data.js` - Single source of truth for all product data
  - `product-loader.js` - Dynamic rendering system for all product displays
  - Individual pages: Streamlined HTML with consistent template structure
  - Security: XSS vulnerabilities patched with input sanitization
- **Benefits Achieved:**
  - Easy product updates: Edit one file (`products-data.js`) to update entire site
  - SEO-friendly: Individual pages maintained for direct category access
  - Security: Protected against XSS attacks via localStorage manipulation
  - Maintainable: Clean separation of data and presentation logic

## CURRENT IMPLEMENTATION - OPTION A (2025-11-17)

### ✅ COMPLETED:
- **Dynamic Product System:** All products now load from centralized `products-data.js`
- **Streamlined Individual Pages:** Minimal HTML structure with consistent template design
- **Security Hardening:** XSS vulnerabilities patched with input sanitization
- **Navigation Consistency:** All individual pages include complete navigation with cakes.html
- **Maintainable Architecture:** Single data file controls all product displays

### 🔄 HOW TO UPDATE PRODUCTS:
**To add/edit products:** Only edit `products-data.js` file
**Result:** Changes appear automatically across ALL pages (menu.html, cookies.html, pies.html, etc.)
**Example:** Add new cookie → Edit PRODUCTS array → New product shows everywhere instantly

## NEXT STEPS

1. Add product images to `/images/` folder (when provided)
2. Test dynamic system on all browsers (if issues reported)  
3. Verify cart integration with new product loader (if problems found)
4. Test PayPal integration (when ready for production)
5. Mobile testing on real devices (when requested)

## SUPPORT RESOURCES

- Massively Template: https://html5up.net/massively
- GitHub Pages Docs: https://docs.github.com/pages
- SnapWidget: https://snapwidget.com
- PayPal Developer: https://developer.paypal.com
- **Git Recovery:** Always available via `git log` and `git reset --hard [commit]`

---

**Last Updated:** 2025-11-17  
**Site Status:** WORKING - restored to stable state after optimization disaster  
**Current Priority:** Stability and functionality preservation over performance
**WARNING:** Do not attempt optimizations without separate branch and explicit user approval
