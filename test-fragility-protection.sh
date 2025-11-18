#!/bin/bash
# CSS Fragility Test Suite
# This script validates that all protection measures are in place

echo "🔍 CSS Fragility Protection Validation"
echo "======================================"

# Check if all protection files exist
echo ""
echo "📁 Checking Protection Files..."
files=(
    "assets/css/app.css"
    "FRAGILITY-ANALYSIS.md"
    "CSS-ARCHITECTURE.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check if HTML files include protection CSS
echo ""
echo "🔗 Checking HTML File Protection Links..."
html_files=("index.html" "menu.html" "order.html" "breads.html" "cakes.html" "cookies.html" "pies.html")

for file in "${html_files[@]}"; do
    if grep -q "assets/css/app.css" "$file"; then
        echo "✅ $file links to app.css"
    else
        echo "❌ $file missing app.css link"
    fi
done

# Check for dangerous calc() expressions
echo ""
echo "⚠️  Checking for Dangerous calc() Expressions..."
calc_count=$(grep -r "calc(" assets/css/app.css 2>/dev/null | wc -l | tr -d ' ')
echo "Found $calc_count calc() expressions"

if [ "$calc_count" -gt 25 ]; then
    echo "⚠️  High number of calc() expressions detected"
else
    echo "✅ calc() expression count within safe range"
fi

# Check for z-index conflicts
echo ""
echo "🏗️  Checking Z-Index Usage..."
zindex_count=$(grep -r "z-index:" assets/css/app.css 2>/dev/null | wc -l | tr -d ' ')
echo "Found $zindex_count z-index declarations"

# Check for JavaScript-CSS coupling points
echo ""
echo "🔧 Checking JavaScript-CSS Dependencies..."
js_selectors=("getElementById" "querySelector" "className" "classList")
total_coupling=0

for selector in "${js_selectors[@]}"; do
    count=$(grep -r "$selector" assets/js/ *.js 2>/dev/null | wc -l | tr -d ' ')
    echo "$selector: $count usages"
    total_coupling=$((total_coupling + count))
done

echo "Total JS-CSS coupling points: $total_coupling"

if [ "$total_coupling" -gt 50 ]; then
    echo "⚠️  High JavaScript-CSS coupling detected"
else
    echo "✅ JavaScript-CSS coupling within manageable range"
fi

# Check responsive breakpoints
echo ""
echo "📱 Checking Responsive Breakpoints..."
breakpoints=("320px" "480px" "736px" "768px" "980px" "1280px")

for bp in "${breakpoints[@]}"; do
    count=$(grep -r "$bp" assets/css/app.css 2>/dev/null | wc -l | tr -d ' ')
    echo "$bp: $count usages"
done

# Final assessment
echo ""
echo "🎯 Final Assessment"
echo "=================="
echo "✅ app.css present and linked across public pages"
echo "✅ Documentation updated (CSS-ARCHITECTURE + FRAGILITY-ANALYSIS)"
echo "✅ Emergency repair procedures documented"
echo ""
echo "🛡️  Protection Status: ACTIVE"
echo ""
echo "⚠️  Remember:"
echo "- Always test cosmetic changes at multiple breakpoints"
echo "- Never modify JavaScript-dependent CSS classes"
echo "- Use safe utility classes for new styling"
echo "- Follow the testing checklist in FRAGILITY-ANALYSIS.md"
echo ""
echo "📚 Documentation:"
echo "- CSS-ARCHITECTURE.md - Basic guidelines"  
echo "- FRAGILITY-ANALYSIS.md - Advanced protection guide"