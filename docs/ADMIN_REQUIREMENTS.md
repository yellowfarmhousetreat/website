# Yellow Farmhouse Admin Tool Requirements

## Core Functionality (What was working)

- ✅ Login with password `FarmhouseBaker2024!`
- ✅ Load existing products from data/products-data.json (15 products)
- ✅ Edit product details (name, description, prices, categories)
- ✅ **Ingredients text box** - Large textarea for listing ingredients in order of quantity
- ✅ **Size/order management** - Multiple size options per product (1/2 dozen, dozen, etc.) with individual pricing
- ✅ **Individual product save buttons** - Save each product separately for granular updates
- ✅ **Photo upload with iOS integration** - Direct access to iPhone Photos app, camera, and file system
- ✅ Manage product sizes and pricing tiers (Regular/Fancy/Complex cookie tiers)
- ✅ Save individual products or all products at once
- ✅ Export/download updated data/products-data.json file
- ✅ Allergen management (wheat, eggs, milk, nuts, peanuts, soy checkboxes)
- ✅ Shipping eligibility settings with cost calculations
- ✅ Dietary options (Gluten Free, Sugar Free, Vegan) with custom pricing adjustments
- ✅ Security warnings about client-side nature

## User Interface Issues to Fix

- ⚠️ **PRIMARY ISSUE**: Allergen checkbox alignment - checkboxes don't align with text labels on mobile (especially iPhone 6)
- ⚠️ **Ingredients textarea** - Needs proper sizing and mobile-friendly input
- ⚠️ **Size/order controls** - Add/remove size options with proper mobile layout  
- ⚠️ **Photo upload buttons** - Three separate buttons (Photos, Camera, Files) that work on iOS
- ⚠️ **Save buttons** - Individual save button per product + global save all
- ⚠️ Form elements should be properly aligned and touch-friendly
- ⚠️ **iPhone 6 ready** - All controls must work properly on 375px width screens

## Technical Requirements
- Must use existing data/products-data.json structure
- Must maintain compatibility with existing product loader
- Security warnings about client-side authentication
- Download mechanism for updated files
- Photo handling for product images

## Mobile Compatibility (iPhone 6 Ready)

- **iPhone 6 (375px width) and larger screen support**
- **Proper touch targets** - 44px minimum for all buttons and inputs
- **Checkbox/radio button alignment** with labels - no misalignment issues
- **Responsive form layouts** that work in portrait mode
- **Photo upload** - Must work with iOS Photos app, camera, and file picker
- **Ingredient textarea** - Properly sized for mobile editing
- **Size management** - Add/remove buttons accessible on small screens

## What Broke
- Admin panel appears after login but content disappears
- "Loaded 15 products successfully" message shows then interface goes blank
- CSS class conflicts between .hidden and inline styles
- Complex async loading causing rendering failures

## Simple Fix Needed
Just fix the checkbox alignment CSS without breaking the core functionality.

## Build Strategy
1. Start with minimal working admin interface
2. Add product loading that definitely works
3. Add form fields with proper mobile alignment
4. Test each piece before adding the next
5. NO complex error handling that breaks basic functionality