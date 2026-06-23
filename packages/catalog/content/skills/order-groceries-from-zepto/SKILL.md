---
name: order-groceries-from-zepto
description: "Order groceries from Zepto in seconds. Just say what you need, get a payment link on WhatsApp, pay on your phone, done. Remembers your usual items. Works across India where Zepto delivers."
category: "Finance & Crypto"
author: community
version: "1.0.6"
icon: coins
---

# zepto

**Order groceries from Zepto in 30 seconds. From chat to checkout.**

Tell your AI what you need. It shops, generates a payment link, sends it to WhatsApp. You pay on your phone. Groceries arrive in 10 minutes.

## 💬 Examples

**Quick orders:**
```
"Order milk and bread from Zepto"
"Add vegetables - tomatoes, onions, potatoes"  
"Get me Amul butter and cheese"
```

**Your usuals:**
```
"Add my usual milk" → AI picks the brand you always order
"Order the usual groceries" → AI suggests your frequent items
```

**Full shopping list:**
```
"Add milk, bread, eggs, coriander, ginger, and tea bags"
→ AI adds everything, shows total: ₹X
→ Sends payment link to WhatsApp
→ You pay, groceries arrive
```

---

## 🔒 Security & Privacy

**What this skill does:**
- ✅ Browser automation on zepto.com (your local browser, your session)
- ✅ Stores order history locally in `~/.openclaw/skills/zepto/order-history.json` (local file, not shared)
- ✅ Sends payment links via WhatsApp (requires your consent for each order)
- ✅ All authentication happens through Zepto's official flow (Phone + OTP)

**What this skill does NOT do:**
- ❌ No automatic payments (you must click the link and pay manually)
- ❌ No data sent to external servers (except Zepto.com and WhatsApp via your channels)
- ❌ No persistent background jobs (optional one-time order status check only if you approve)
- ❌ No storage of payment info or OTPs
- ❌ No access to your banking/UPI apps

**Data Storage:**
- Order history: `~/.openclaw/skills/zepto/order-history.json` (local only, helps with "usuals" feature)
- Browser session: Managed by OpenClaw's browser (standard Chrome/Chromium profile)

**User Control:**
- You control when to order
- You approve each payment link
- You can delete order history file anytime
- All browser actions happen in your profile with your visibility

---

## 🚨 CRITICAL WORKFLOW RULES

**ALWAYS follow this order when building an order:**

### Rule 1: CHECK CART FIRST
```bash
# Before adding ANY items, ALWAYS check cart state
node zepto-agent.js get-cart
```

**Why:** Cart may have items from previous sessions. Adding duplicates is wasteful.

### Rule 2: Use smart-shop (RECOMMENDED)
```bash
# This handles everything: clears unwanted, checks duplicates, adds missing
node zepto-agent.js smart-shop "milk, bread, eggs"
```

**What it does:**
1. Checks current cart state
2. Clears existing items (if any)
3. For each item: checks if already in cart → skips if present → adds only if missing
4. Returns: `{ added: [], skipped: [], failed: [] }`

### Rule 3: NEVER take screenshots unless snapshot data is insufficient
- Snapshot shows all refs, buttons, text
- Screenshot is ONLY for visual debugging when snapshot is truncated or unclear
- **In 99% of cases, snapshot is enough**

### Rule 4: Detect "already in cart" signals
When you see in snapshot:
```
"Decrease quantity 1 Increase quantity"  → Item is IN CART
button "Remove" [ref=eXX]                 → Item is IN CART
```

**DO NOT** click "ADD" when you see these signals!

---

## Complete Flow
1. **Authentication** - Phone + OTP verification
2. **Address Confirmation** - Verify delivery location
3. **Shopping** - Search & add items (with YOUR usuals prioritized!)
4. **Payment Link** - Generate & send Juspay link via WhatsApp

---

## Step 0: Order History & Usuals

**Your order history is tracked in:** `{SKILL_DIR}/order-history.json`

(Where `{SKILL_DIR}` is your skill directory, typically `~/.openclaw/skills/zepto/`)

**Smart Selection Logic:**
1. When user requests an item (e.g., "add milk")
2. Check `order-history.json` for that category
3. **If ordered 2+ times** → Auto-add your most-ordered variant
4. **If ordered 0-1 times** → Show options and ask for selection

### Automated Order History Scraper

**When to run:** User says "update my zepto history" or "refresh order history"

**Process:**
1. Navigate to account page
2. Get all delivered order URLs
3. Visit each order sequentially
4. Extract items using DOM scraping
5. Build frequency map
6. Save to `order-history.json`

**Implementation:**
```bash
# Step 1: Navigate to account page
browser navigate url=https://www.zepto.com/account profile=openclaw

# Step 2: Extract order URLs
browser act profile=openclaw request='{"fn":"() => { const orders = []; document.querySelectorAll(\"a[href*=\\\"/order/\\\"]\").forEach(link => { if (link.href.includes(\"isArchived=false\") && link.textContent.includes(\"delivered\")) { orders.push(link.href); } }); return [...new Set(orders)]; }", "kind":"evaluate"}'
# Returns array of order URLs

# Step 3: For each order URL:
browser navigate url={order_url} profile=openclaw

# Step 4: Extract items from order page
browser act profile=openclaw request='{"fn":"() => { const items = []; document.querySelectorAll(\"*\").forEach(el => { const text = el.textContent; if (text.match(/\\d+\\s*unit/i)) { const parent = el.closest(\"div\"); if (parent) { const lines = parent.textContent.split(\"\\n\").map(l => l.trim()).filter(l => l && l.length > 5 && l.length < 100); if (lines[0]) { const qtyMatch = text.match(/(\\d+)\\s*unit/i); items.push({ name: lines[0], quantity: qtyMatch ? parseInt(qtyMatch[1]) : 1 }); } } } }); const uniqueItems = {}; items.forEach(item => { if (!uniqueItems[item.name]) uniqueItems[item.name] = item; }); return Object.values(uniqueItems); }", "kind":"evaluate"}'
# Returns array of {name, quantity}

# Step 5: Aggregate all items into frequency map
# Build JSON structure with counts

# Step 6: Write to file
write path={SKILL_DIR}/order-history.json content={json_data}
```

**Automated scraper advantages:**
- ✅ No manual screenshot review
- ✅ Faster (visits all orders programmatically)
- ✅ Always up-to-date
- ✅ Can re-run anytime

**Example:**
```
User: "Update my Zepto order history"

Response:
"🔍 Scanning your Zepto orders...
📦 Found 6 delivered orders
🔄 Extracting items...
✅ Updated! Found:
   - Coriander: 4 orders
   - Milk: 3 orders
   - Bread: 2 orders
   - Potato: 2 orders
   + 15 other items

Your usuals are ready!"
```

---

**Smart Selection Logic (Using History):**

**Example:**
```
User: "Add milk"

[Check order-history.json]
→ "Amul Taaza Toned Fresh Milk | Pouch (500ml)" ordered 3x

Response:
"🥛 Adding your usual milk!
Amul Taaza Toned Fresh Milk (500ml) - ₹29
📊 You've ordered this 3 times
✅ Added to cart"
```

**If only ordered once or never:**
```
User: "Add milk"

[Check order-history.json]
→ "Amul Taaza" ordered 1x only

Response:
"🥛 Found some milk options:
1. Amul Taaza Toned (500ml) - ₹29 ⭐ 4.8 (100k) - You've ordered this once
2. Amul Gold (1L) - ₹68 ⭐ 4.9 (80k) - Most popular
3. Mother Dairy (500ml) - ₹30 ⭐ 4.7 (60k)

Which one? (or tell me a number)"
```

**Update order history:** After each successful order, update the JSON file with new items.

---

## Step 1: Authentication (First Time Only)

**Check if already logged in:**
```bash
browser open url=https://www.zepto.com profile=openclaw
browser snapshot --interactive profile=openclaw
# Look for "login" button vs "profile" link
```

**If NOT logged in, start auth flow:**

### 1.1: Get Phone Number
Ask user: "What's your phone number for Zepto? (10 digits)"

### 1.2: Enter Phone & Request OTP
```bash
# Click login button
browser act profile=openclaw request='{"kind":"click","ref":"{login_button_ref}"}'

# Type phone number
browser act profile=openclaw request='{"kind":"type","ref":"{phone_input_ref}","text":"{phone}"}'

# Click Continue
browser act profile=openclaw request='{"kind":"click","ref":"{continue_button_ref}"}'
```

### 1.3: Get OTP from User
Ask user: "I've sent the OTP to {phone}. What's the OTP you received?"

### 1.4: Enter OTP
```bash
browser snapshot --interactive profile=openclaw  # Get OTP input refs
browser act profile=openclaw request='{"kind":"type","ref":"{otp_input_ref}","text":"{otp}"}'
# OTP auto-submits after 6 digits
```

**Result:** User is now logged in! Session persists across browser restarts.

---

## Step 2: Address Confirmation

**🚨 CRITICAL: ALWAYS CHECK ADDRESS BEFORE PROCEEDING WITH ANY SHOPPING!**

### Address Selection Rules

**Default behavior:**
1. Most users have multiple saved addresses (Home, Office, etc.)
2. **ALWAYS show current address and ASK for confirmation** - never assume
3. Check what was used in the last order (if order history exists)
4. Wait for explicit user confirmation before proceeding

**On homepage, address is visible in the header:**
```bash
browser snapshot --interactive profile=openclaw
# Look for button with heading level=3 containing the address
# Example ref: e16 with text like "Home - [Address Details]..."
# Delivery time shown nearby (e.g., "10 minutes")
```

**ALWAYS ask user to confirm before shopping:**
```
📍 I see your delivery address is set to:
{Address Name} - {Full Address}
⏱️ Delivery in ~{X} minutes

Is this correct? Should I proceed with this address?
```

### Programmatic Address Selection (NEW!)

**Use the `zepto-agent.js select-address` command:**

```bash
node zepto-agent.js select-address "Home"
node zepto-agent.js select-address "sanskar"     # Fuzzy matching works!
node zepto-agent.js select-address "kundu blr"
```

**How it works:**
1. **Fuzzy matching** - Case-insensitive, partial match supported
   - "sanskar" → "Sanskar Blr" ✅
   - "home" → "New Home" ✅
   - "kundu" → "Kundu Blr" ✅
2. **Already-selected detection** - Skips if you're already at that address
3. **Verification** - Confirms address change in header after click

**Example:**
```bash
# Current address: "Kundu Blr"
node zepto-agent.js select-address "sanskar"

# Output:
# ℹ️ Opening Zepto...
# ✅ Zepto opened
# ℹ️ 📍 Selecting address: "sanskar"
# ℹ️ Current: Kundu Blr
# ✅ Clicked: Sanskar BlrA-301, A, BLOCK-B...
# 🎉 Address changed to: Sanskar blr
```

**When user says "change address to X" or "deliver to X":**
```bash
# Just call the command with their address name/query
node zepto-agent.js select-address "{user_query}"
```

**No manual modal navigation needed!** The script handles:
- Opening the address modal
- Finding the address (fuzzy match)
- Clicking it
- Verifying the change
- Closing the modal

**Manual Selection (Fallback):**
If the programmatic method fails or address isn't found:

```bash
# Click the address button (ref e16 or similar)
browser act profile=openclaw request='{"kind":"click","ref":"e16"}'
# This opens address selection modal with all saved addresses
```

**Select address using JavaScript:**
```bash
# Replace {USER_ADDRESS_NAME} with the actual address name user selected
browser act profile=openclaw request='{"fn":"() => { const input = document.querySelector('input[placeholder*=\"address\"]'); if (!input) return { error: 'Modal not found' }; let modal = input; for (let i = 0; i < 15; i++) { if (!modal.parentElement) break; modal = modal.parentElement; if (window.getComputedStyle(modal).position === 'fixed') break; } const divs = Array.from(modal.querySelectorAll('div')); const match = divs.find(d => d.textContent && d.textContent.trim().startsWith('{USER_ADDRESS_NAME}')); if (!match) return { error: 'Address not found' }; let p = match; for (let i = 0; i < 10; i++) { if (!p) break; const s = window.getComputedStyle(p); if (p.onclick || p.getAttribute('onClick') || s.cursor === 'pointer') { p.scrollIntoView({ block: 'center' }); setTimeout(() => {}, 300); p.click(); return { clicked: true, text: match.textContent.substring(0, 100) }; } p = p.parentElement; } return { error: 'No clickable parent' }; }()","kind":"evaluate"}'
```

**After address confirmed by user:**
```
✅ Delivery address confirmed: {address_name}
📍 {full_address}
⏱️ ETA: {eta} mins

Ready to shop! What would you like to add to cart?
```

**⚠️ Address is CRITICAL - never skip this step!**

---

## Step 3: Shopping

### 3A: Discovery Mode (Browse & Explore)

When user asks to "explore", "show me", "what's good", "find something", or "discover":

**Common Discovery Patterns:**
- "Show me healthy snacks under ₹50"
- "What's good in dairy products?"
- "Find me something for breakfast"
- "Any deals on fruits?"
- "Discover protein bars"

**Browse Categories:**
```bash
# Navigate to category pages
browser navigate url=https://www.zepto.com profile=openclaw
browser snapshot --interactive profile=openclaw

# Categories available on homepage:
# - Fruits & Vegetables
# - Dairy, Bread & Eggs
# - Munchies (snacks)
# - Cold Drinks & Juices
# - Breakfast & Sauces
# - Atta, Rice, Oil & Dals
# - Cleaning Essentials
# - Bath & Body
# - Makeup & Beauty
```

**Filter & Sort:**
```bash
# Example: Browse "Munchies" category
browser navigate url=https://www.zepto.com/pn/munchies profile=openclaw
browser snapshot --interactive profile=openclaw

# Take screenshot to show user the options
browser screenshot profile=openclaw
```

**Discovery Response Format:**
```
🔍 Found some great options in {category}:

1. **{Product Name}** - ₹{price} ({discount}% OFF)
   ⭐ {rating} ({review_count} reviews)
   📦 {size/quantity}
   
2. **{Product Name}** - ₹{price}
   ⭐ {rating} ({review_count} reviews)
   
3. **{Product Name}** - ₹{price} ({discount}% OFF)
   ⭐ {rating} ({review_count} reviews)

Want me to add any of these? Just tell me the number(s)!
```

**Smart Filtering Tips:**
- Price range: Extract from query ("under ₹50", "below 100")
- Discount focus: Look for items with ₹X OFF tags
- High ratings: Prioritize 4.5+ star products
- Popular items: Sort by review count (k = thousands)
- Health focus: Keywords like "protein", "sugar-free", "organic", "millet"

**Interactive Discovery:**
After showing options, user can:
- Add by number: "Add 1 and 3"
- Ask for more: "Show me more"
- Refine: "Show cheaper options" or "What about chocolate flavors?"
- Browse different category: "Now show me dairy products"

### 3B: Direct Search (Specific Items)

**MANDATORY PRE-FLIGHT CHECK:**
Before adding ANY items:
1. Click cart button
2. Read current cart contents
3. If cart has items: Ask user "Keep existing items or clear cart first?"
4. If empty: Proceed to shopping

**Multi-Item Shopping Flow:**
When user gives a list (e.g., "add milk, butter, bread"):
1. **Add items ONE AT A TIME with verification:**
   - Search for item
   - Click ADD button
   - Wait 0.5s for page update
   - VERIFY item shows quantity controls (means it's in cart)
   - If verification fails: Retry up to 3 times
2. **Then show final cart summary** with all items and total

**CRITICAL:** Never batch-add without verification! Page refs change after each add.

**Item Selection Logic:**
- Check order-history.json first
- If item ordered 2+ times → auto-select that variant
- If item ordered 0-1 times or multiple unclear variants → **show options and ASK**
- Pick closest match to user's request (e.g., "Yakult Light" when they said "light")
- Use highest review count as tiebreaker

**When UNCLEAR about variant:**
```
🥛 Found multiple milk options:
1. Amul Taaza (500ml) - ₹29 ⭐ 4.8 (100k)
2. Amul Gold (1L) - ₹68 ⭐ 4.9 (80k)
3. Mother Dairy (500ml) - ₹30 ⭐ 4.7 (60k)

Which one? (or tell me a number)
```

**Search Process:**
```bash
browser navigate url=https://www.zepto.com/search?query={item} profile=openclaw
browser snapshot --interactive profile=openclaw
```

### Select Best Product
**Rule:** Pick product with highest review count (unless order history says otherwise).

Format: `{rating} ({count})` where k=thousand, M=million.

Example: "4.8 (694.4k)" = 694,400 reviews = most popular.

### Add to Cart
```bash
browser act profile=openclaw request='{"kind":"click","ref":"{ADD_button_ref}"}'
```

### View Cart Summary (ALWAYS show after adding all items)
```bash
browser navigate url=https://www.zepto.com/?cart=open profile=openclaw
browser snapshot profile=openclaw  # Get cart summary
```

**Cart Summary Format:**
```
🛒 Added to cart:
1. Item 1 - ₹XX
2. Item 2 - ₹YY
3. Item 3 - ₹ZZ

💰 Total: ₹{total}

Ready to checkout? (say "yes" or "checkout" or "lessgo")
```

**CRITICAL - Quantity Mapping:**
When user provides a shopping list with quantities (e.g., "3x jeera, 2x saffola oats"):
1. **ALWAYS create a mapping file FIRST** before any cart operations
2. Map each item name to its requested quantity
3. Before removing/modifying items, **verify against this mapping**
4. Never assume which item has which quantity - CHECK THE MAPPING

Example mapping:
```json
{
  "jeera": 3,
  "saffola_oats": 2,
  "milk": 1
}
```

**Before removing duplicates or adjusting quantities:**
- Take a cart snapshot
- Match cart items to your mapping by name similarity
- Verify quantities match the original request
- If unsure, ASK the user before making changes

### Error Handling - Out of Stock

**If item not found or out of stock:**
```
❌ {item} is currently unavailable.

🔍 Suggestions:
- {similar_item_1}
- {similar_item_2}

What would you like instead?
```

**Don't auto-add alternatives** - wait for user's next item or choice.

---

## Step 4: Generate Payment Link

After all items added to cart and user confirms checkout:

### 4.1: Open Cart and Proceed to Payment
```bash
# Open cart modal
browser act profile=openclaw request='{"kind":"click","ref":"{cart_button_ref}"}'
# Example ref from homepage: e44

# Wait for cart to open, take snapshot
browser snapshot --interactive profile=openclaw

# Click "Click to Pay ₹{amount}" button
browser act profile=openclaw request='{"kind":"click","ref":"{click_to_pay_button_ref}"}'
# Example ref: e3579
```

### 4.2: Extract Juspay Link
```bash
# Wait 2 seconds for navigation to complete
browser act profile=openclaw request='{"fn":"async () => { await new Promise(r => setTimeout(r, 2000)); return window.location.href; }","kind":"evaluate"}'
```

**URL Format:**
```
https://payments.juspay.in/payment-page/signature/zeptomarketplace-{order_id}
```

Example:
```
https://payments.juspay.in/payment-page/signature/zeptomarketplace-{ORDER_ID_EXAMPLE}
```

### 4.3: Send Link via WhatsApp
```bash
message action=send channel=whatsapp target={user_phone} message="🛒 *Your Zepto order is ready!*

*Cart Summary ({item_count} items):*
1. {item1} - ₹{price1}
2. {item2} - ₹{price2}
3. {item3} - ₹{price3}

*💰 Total: ₹{total}*

📍 Delivering to: {address_name} - {address}
⏱️ ETA: {eta} minutes

*🔗 Click here to pay:*
{juspay_payment_link}

⚠️ *IMPORTANT: After payment, message me \"DONE\" to confirm your order!*
(Don't rely on the payment page - just tell me when you've paid and I'll verify it) 🚀"
```

### 4.4: Wait for User "Done" Message & Verify Order

**After user says "done" or "paid":**

**Step 1: Navigate to Zepto homepage to check order status**
```bash
browser navigate url=https://www.zepto.com profile=openclaw
browser snapshot --interactive profile=openclaw
```

**Step 2: Look for order confirmation**
Check for text like:
- "Your order is on the way"
- "Order confirmed"
- "Preparing your order"
- "Arriving in X mins"
- Track order button/link

**Step 3: Auto-clear cart (Post-Payment Behavior)**

🚨 **CRITICAL: After payment, cart items persist because Zepto hasn't synced yet!**

**Automatically clear cart without asking (user expects cart to be empty after payment):**

```bash
# Open cart
browser act profile=openclaw request='{"kind":"click","ref":"{cart_button_ref}"}'
browser snapshot --interactive profile=openclaw

# Click Remove button for each item
browser act profile=openclaw request='{"kind":"click","ref":"{remove_button_ref_1}"}'
browser act profile=openclaw request='{"kind":"click","ref":"{remove_button_ref_2}"}'
browser act profile=openclaw request='{"kind":"click","ref":"{remove_button_ref_3}"}'
# ... repeat for all items
```

**Step 4: Confirm to user**

**If order confirmed:**
```
✅ *Payment confirmed!*
🚚 Your order is on the way! Arriving in ~{X} mins.

Order details:
- {item_count} items, ₹{total}
- Delivery to: {address}

✅ Cart cleared ({item_count} items removed from previous order)
🛒 Ready for your next order! 🐺
```

**If order NOT showing yet:**
```
⏳ Payment processed, but order confirmation is still loading on Zepto's end.

Let me check again in 30 seconds...
```

**Then set up a background check to try again.**


**Step 1: Navigate back to Zepto homepage**
```bash
browser navigate url=https://www.zepto.com profile=openclaw
```

**Step 2: Check order status on homepage**
```bash
browser snapshot --interactive profile=openclaw
# Look for "Your order is on the way" or order tracking
```

**Step 3: Open cart and check items**
```bash
browser act profile=openclaw request='{"kind":"click","ref":"{cart_button_ref}"}'
browser snapshot --interactive profile=openclaw
```

**🚨 CRITICAL: Cart items may still be there because Zepto hasn't synced order confirmation yet!**

**Step 4: Ask user about clearing cart**
```
✅ Payment confirmed! Your order is on the way.

⚠️ I can see {X} items still in the cart (from the previous order that just went through).

Should I:
1. Clear the cart (recommended for fresh start)
2. Keep the items (if you want to reorder them)

*Default: I'll clear the cart unless you say "keep it"*
```

**Step 5: Clear cart if user approves (or by default)**
```bash
# For each item in cart, click Remove button
browser act profile=openclaw request='{"kind":"click","ref":"{remove_button_ref_1}"}'
browser act profile=openclaw request='{"kind":"click","ref":"{remove_button_ref_2}"}'
# ... repeat for all items

# Or use JavaScript to clear all at once:
browser act profile=openclaw request='{"fn":"() => { const removeButtons = document.querySelectorAll(\"button\"); let count = 0; for (let btn of removeButtons) { if (btn.textContent.trim() === \"Remove\") { btn.click(); count++; } } return `Removed ${count} items`; }","kind":"evaluate"}'
```

**Confirmation message:**
```
✅ Cart cleared! ({X} items removed)
🛒 Ready for your next order!

Your current order ({item_count} items, ₹{total}) will arrive in ~{eta} mins.
```

**If user says "keep it":**
```
✅ Got it! Keeping {X} items in cart.
🛒 Ready to add more items or proceed with these?
```

---

2. Going to cart manually and clicking "Pay"
3. Let me know if you need me to try again
```

**If delivery address becomes unserviceable:**
```
⚠️ Your delivery address is currently unserviceable.
Should I order it to a different address?

(I can show you all your saved addresses)
```

---

## 🎯 Complete Order Flow Summary

### Before Starting ANY New Order (Normal Flow - No Recent Payment):

**1. Check Address (ALWAYS)**
```
📍 Current address: {address}
Is this correct?
```

**2. Check Cart (if items exist)**
```bash
# Open cart
browser act profile=openclaw request='{"kind":"click","ref":"{cart_button_ref}"}'
browser snapshot --interactive profile=openclaw
```

**If items in cart from NORMAL browsing (not post-payment):**
```
⚠️ I see {X} items in your cart:
1. {item1} - ₹{price1}
2. {item2} - ₹{price2}

Should I:
1. Clear the cart
2. Keep these items

What would you like?
```

**Wait for user response before proceeding.**

---

### Post-Payment Behavior (After User Says "Done" or "Paid"):

**This is DIFFERENT from normal flow - auto-clear expected!**

**1. Navigate to zepto.com and check order status**
```bash
browser navigate url=https://www.zepto.com profile=openclaw
browser snapshot --interactive profile=openclaw
```

**2. Look for "Your order is on the way" or "Arriving in X mins"**

**3. Open cart and AUTO-CLEAR without asking**
```bash
# Open cart
browser act profile=openclaw request='{"kind":"click","ref":"{cart_button_ref}"}'

# Remove all items (they're from the order that just went through)
browser act profile=openclaw request='{"kind":"click","ref":"{remove_ref_1}"}'
browser act profile=openclaw request='{"kind":"click","ref":"{remove_ref_2}"}'
browser act profile=openclaw request='{"kind":"click","ref":"{remove_ref_3}"}'
```

**4. Confirm to user**
```
✅ Payment confirmed! Your order is on the way! Arriving in ~{X} mins.

✅ Cart cleared ({item_count} items removed from previous order)
🛒 Ready for your next order!
```

**Why auto-clear in post-payment?**
- User expects cart to be empty after successful order
- Cart items are from the order they just paid for
- Zepto hasn't synced yet, so items persist temporarily
- Clearing prevents confusion and duplicate orders

---

### Start Fresh Shopping (After Cart Cleared)
```
✅ Cart cleared!
✅ Address confirmed: {address}

What would you like to order? 🛒
```

---

**Key Difference:**
- **Normal flow**: ASK before clearing cart (user might want those items)
- **Post-payment flow**: AUTO-CLEAR cart (user knows those items are ordered)

---

## Safety & Best Practices

✅ **DO:**
- Check auth status before every order
- Confirm address with user
- Extract payment link accurately
- Send link via WhatsApp
- Let user complete payment

❌ **DON'T:**
- Never click "Pay" button
- Never store OTP
- Never auto-submit payment
- Never change address without user confirmation

---

## Error Handling

**Phone number invalid:**
```
"Phone number should be 10 digits. Please try again."
```

**OTP verification failed:**
```
"OTP verification failed. Let me resend the OTP.
Check your phone for the new code."
```

**Location not serviceable:**
```
"⚠️ Your location is currently not serviceable by Zepto.
Store might be temporarily closed or location outside delivery zone.
Want to try a different address?"
```

**Item not found:**
```
"Couldn't find {item} on Zepto. Try a different search term?"
```

---

## Session Persistence

**After successful authentication:**
- Browser cookies persist login
- No need to re-authenticate for future orders
- Address selection persists
- Can directly proceed to shopping

**To check if authenticated:**
```bash
browser navigate url=https://www.zepto.com profile=openclaw
browser snapshot --interactive profile=openclaw
# If "profile" link exists → logged in
# If "login" button exists → need to auth
```
