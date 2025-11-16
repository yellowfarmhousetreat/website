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
**Main Navigation (on all pages):** Home | Menu | Cart & Checkout

### Page Hierarchy:
```
index.html (HOME)
  ├── Instagram feed (SnapWidget embed)
  └── Category preview cards linking to:
menu.html (MENU/ORDER)
  ├── Cookies → cookies.html
  ├── Cakes → cakes.html  
  ├── Pies → pies.html
  └── Breads → breads.html
cart.html (CART/CHECKOUT)
```

### Files to Create/Update:

#### 1. index.html (Homepage)
**Requirements:**
- Hero section: "YELLOW FARMHOUSE TREATS" with intro/tagline
- Instagram feed section with SnapWidget embed code
- Four category preview cards with images:
  - Cookies (link to cookies.html)
  - Cakes (link to cakes.html)
  - Pies (link to pies.html)
  - Breads (link to breads.html)
- Contact section with:
  - Address: 22659 Farmway Road, Caldwell, ID 83646
  - Phone: (805) 709-4686
  - Email: yellowfarmhousetreats@gmail.com
  - Social: Facebook & Instagram icons
- Link to assets/css/main.css and assets/css/noscript.css
- No cart.js needed on homepage

#### 2. menu.html (Category Landing)
**Requirements:**
- Brief intro text about the bakery
- Four category cards with descriptions:
  - Cookies: "Homemade cookies baked fresh daily"
  - Cakes: "Custom cakes for any occasion"
  - Pies: "Traditional pies made from scratch"
  - Breads: "Artisan breads and sweet loaves"
- Each card links to respective product page
- Maintain consistent header/footer

#### 3. Product Pages (cookies.html, cakes.html, pies.html, breads.html)
**Shared Requirements:**
- Product grid layout (responsive: 3 cols desktop, 2 cols tablet, 1 col mobile)
- Each product card contains:
  - Product name
  - Description
  - Price
  - Image placeholder or actual image
  - Dietary option checkboxes:
    - ☐ Gluten Free (GF) - may affect price
    - ☐ Sugar Free (SF) - may affect price
  - Quantity input (default: 1, min: 1)
  - "Add to Cart" button
- **MUST link cart.js:** `<script src="assets/js/cart.js"></script>` before `</body>`
- Cart count badge in navigation showing total items
- Link back to menu.html

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

#### 4. cart.html (Shopping Cart & Checkout)
**Requirements:**
- Display cart items in table/list format:
  - Product name
  - Dietary options (if selected)
  - Quantity (editable)
  - Unit price
  - Line total
  - Remove button
- Cart summary:
  - Subtotal
  - Tax (if applicable)
  - **Total**
- Checkout section:
  - Customer info form (name, email, phone)
  - Delivery/pickup selection
  - Special instructions textarea
  - **PayPal button ONLY** (no credit card fields)
- "Continue Shopping" button linking to menu.html
- "Empty Cart" button
- **MUST link cart.js**

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
- Use existing Massively template CSS: `assets/css/main.css`
- Add custom overrides in `<style>` tags if needed
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
│   │   ├── main.css
│   │   └── noscript.css
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

## NEXT STEPS

1. Review all product pages for consistency
2. Test cart.js across all pages
3. Verify dietary options pricing
4. Add product images to /images/ folder
5. Test PayPal integration
6. Mobile testing on real devices
7. SEO optimization (meta tags, descriptions)
8. Performance audit (PageSpeed Insights)

## SUPPORT RESOURCES

- Massively Template: https://html5up.net/massively
- GitHub Pages Docs: https://docs.github.com/pages
- SnapWidget: https://snapwidget.com
- PayPal Developer: https://developer.paypal.com

---

**Last Updated:** 2025-11-16  
**Site Status:** Product pages created, cart system implemented, index.html restored, DNS configured  
**Next Priority:** Test full checkout flow
