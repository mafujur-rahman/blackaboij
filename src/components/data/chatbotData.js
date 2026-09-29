/**
 * chatbotData.js
 * ------------------------------------------------------------------
 * All the "brain" content for the Blackaboij chatbot. Kept separate
 * from the UI (Chatbot.jsx) so answers, links and product data can be
 * updated without touching component code.
 *
 * WHAT IS VERIFIED vs. WHAT YOU MUST FILL IN
 * Verified from the site (nav, policies, contact, terms): everything in
 * BRAND, CONTACT, SALE, CATEGORIES, POLICY_FACTS.
 *
 * NOT verifiable from the page: the product grid is rendered
 * client-side from your backend, so product names, prices, GSM, fabric,
 * sizes and colours cannot be scraped. Load them with setProducts()
 * (see bottom of the PRODUCTS section). The bot only states a spec
 * (GSM, fabric...) if that field exists on the product — it never
 * guesses.
 */

export const BRAND = {
    name: "Blackaboij",
    tagline: "Life is made of choice",
    homeUrl: "https://blackaboij.com",
    logo: "https://blackaboij.com/images/new-logo.png",
};

export const CONTACT = {
    // Public contact page + footer
    email: "info@blackaboij.com",
    // Policy pages (returns / terms / shipping) list this address instead.
    // Consider using one address everywhere.
    policyEmail: "blackaboij@gmail.com",
    phone: "+33 6 62 02 39 69",
    phoneHref: "tel:+33662023969",
    address: "20 Allée des Piboules, résidence les Belenos, 13800 Istres, France",
    contactPageUrl: "https://blackaboij.com/contact",
    storePageUrl: "https://blackaboij.com/store",
    social: {
        facebook: "https://www.facebook.com/BBOIJ",
        pinterest: "https://fr.pinterest.com/blackaboij/",
        instagram: "https://www.instagram.com/blackaboij_/",
    },
};

export const SALE = {
    title: "Black Friday Sale",
    detail: "Up to 60% off on selected items.",
    accessoriesTitle: "Accessories Sale",
    url: "https://blackaboij.com/shop",
    accessoriesUrl: "https://blackaboij.com/accessories",
    highlightNote:
        "Discounts apply on selected items only — check the product card for the sale price. Promotions may not be combined unless stated.",
};

export const CATEGORIES = {
    men: [
        { label: "New Arrivals", url: "https://blackaboij.com/men/men-collection" },
        { label: "Tees", url: "https://blackaboij.com/men/men-tees" },
        { label: "Hoodies & Sweaters", url: "https://blackaboij.com/men/men-hoodies-sweaters" },
        { label: "Shorts", url: "https://blackaboij.com/men/men-pants" },
        { label: "Outerwear", url: "https://blackaboij.com/men/men-outwears" },
        { label: "Shoes", url: "https://blackaboij.com/men/men-shoes" },
    ],
    women: [
        { label: "New Arrivals", url: "https://blackaboij.com/women/women-collection" },
        { label: "Tees", url: "https://blackaboij.com/women/women-tees" },
        { label: "Hoodies & Sweaters", url: "https://blackaboij.com/women/women-hoodies-sweaters" },
        { label: "Shorts", url: "https://blackaboij.com/women/women-pants" },
        { label: "Outerwear", url: "https://blackaboij.com/women/women-outwears" },
        { label: "Shoes", url: "https://blackaboij.com/women/women-shoes" },
    ],
    accessories: [{ label: "All Accessories", url: "https://blackaboij.com/accessories" }],
};

export const POLICIES = {
    returns: "https://blackaboij.com/return-policy",
    shipping: "https://blackaboij.com/shipping-policy",
    terms: "https://blackaboij.com/terms-conditions",
};

/**
 * Facts taken from the policy pages (last updated Oct 2024 on the site).
 * Edit here if the policies change.
 */
export const POLICY_FACTS = {
    processing: "Orders are processed within 1–3 business days after payment confirmation (longer in peak seasons).",
    domestic: "We ship throughout France.",
    international: "International shipping is available for select destinations; fees and delivery times vary and are calculated at checkout by destination and order weight.",
    // The shipping policy page still shows "orders over €XX" as a placeholder.
    // Put the real number here (e.g. 60) and the bot will quote it.
    freeShippingThreshold: null,
    express: "Express shipping is available in select regions and may cost extra.",
    tracking: "Once your order ships you'll get a confirmation email with a tracking link.",
    customs: "International orders may be subject to customs fees or import duties, which are the customer's responsibility.",
    address: "Please double-check your address at checkout — re-shipping fees may apply if a package is returned.",
    returnWindow: "You can return items within 14 days of receiving your order (French consumer law).",
    returnCondition: "Items must be unused, in original condition, with all tags and packaging. Personalised or final-sale items may be excluded — check the product description.",
    returnProcess: "Email us within 14 days with your order details, pack the items securely with the packing slip or proof of purchase, and send them to the address in our return instructions.",
    returnCost: "Return shipping is at your cost unless the item was incorrect or defective.",
    refund: "After we receive and inspect your return, approved refunds go to your original payment method within 7–14 business days. Shipping fees are non-refundable unless the item was incorrect or defective.",
    exchange: "For a different size or colour, return the original item and place a new order.",
    damaged: "If an item arrives damaged or defective, tell us within 7 days of receipt and we'll arrange a replacement or refund at no extra cost.",
    payment: "We accept major credit cards and other secure payment options. Prices include VAT.",
    colorNote: "Small colour differences can occur because of screen settings or production variations.",
    cancel: "Once an order is placed you'll get a confirmation email. To change or cancel an order, contact us as soon as possible.",
};

/* ------------------------------------------------------------------
 * PRODUCTS
 * ------------------------------------------------------------------
 * Product shape (all spec fields optional — the bot only answers what
 * exists):
 * {
 *   id, name, gender: "men" | "women" | "unisex",
 *   category: "Tees" | "Hoodies & Sweaters" | "Shorts" | "Outerwear" | "Shoes" | "Accessories",
 *   price: 79, salePrice: 39 | null, onSale: true|false,
 *   colors: ["Black", "Charcoal"], sizes: ["S","M","L","XL"],
 *   inStock: true,
 *   specs: {
 *     gsm: 240,                    // fabric weight, grams per m²
 *     fabric: "100% cotton",       // material / composition
 *     fit: "Oversized",            // fit / cut
 *     fabricFeel: "Brushed fleece",// optional
 *     print: "Screen print",       // optional
 *     care: "Machine wash cold, 30°C",
 *     origin: "Made in ...",
 *     sole: "Rubber",              // shoes
 *     lining: "Fleece",            // outerwear
 *   },
 *   url: "https://blackaboij.com/..."
 * }
 *
 * Wire your real data in one of two ways:
 *   1) Edit the array below by hand, or
 *   2) In Chatbot.jsx:  useEffect(() => { fetch("/api/products")
 *        .then(r => r.json()).then(setProducts); }, []);
 */
let PRODUCTS = [];

export function setProducts(list) {
    PRODUCTS = Array.isArray(list) ? list : [];
}
export const getProducts = () => PRODUCTS;

const formatPrice = (n) => `€${Number(n).toFixed(2)}`;
export const getOnSaleProducts = () => PRODUCTS.filter((p) => p.onSale && p.salePrice != null);

const norm = (s) =>
    String(s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

/** Find the product the user is talking about (by name words). */
export function findProduct(message) {
    const m = norm(message);
    let best = null;
    let bestScore = 0;
    for (const p of PRODUCTS) {
        const words = norm(p.name).split(/\W+/).filter((w) => w.length > 2);
        if (!words.length) continue;
        const hits = words.filter((w) => new RegExp(`\\b${w}`).test(m)).length;
        const score = hits / words.length;
        if (hits >= Math.min(2, words.length) && score > bestScore) {
            best = p;
            bestScore = score;
        }
    }
    return best;
}

/** Products in a category / gender mentioned in the message. */
function findProductsByContext(message) {
    const m = norm(message);
    const cats = [
        ["tee", "Tees"], ["t-shirt", "Tees"], ["tshirt", "Tees"],
        ["hoodie", "Hoodies & Sweaters"], ["sweater", "Hoodies & Sweaters"], ["sweatshirt", "Hoodies & Sweaters"],
        ["short", "Shorts"], ["pant", "Shorts"],
        ["jacket", "Outerwear"], ["outer", "Outerwear"], ["coat", "Outerwear"],
        ["shoe", "Shoes"], ["sneaker", "Shoes"],
        ["accessor", "Accessories"], ["cap", "Accessories"], ["hat", "Accessories"],
    ];
    const cat = (cats.find(([k]) => m.includes(k)) || [])[1];
    const gender = /\bwomen|\bwoman|\bladies/.test(m) ? "women" : /\bmen\b|\bmens\b|\bman\b/.test(m) ? "men" : null;
    if (!cat && !gender) return [];
    return PRODUCTS.filter(
        (p) => (!cat || p.category === cat) && (!gender || p.gender === gender || p.gender === "unisex")
    );
}

/* ------------------------------------------------------------------
 * Product spec answers (GSM, fabric, fit, sizes, colours, care...)
 * ------------------------------------------------------------------ */

export const GSM_EXPLAINER =
    "GSM means grams per square metre — it measures how heavy and dense a fabric is. As a rule of thumb: about 130–180 GSM is lightweight (summer tees), 180–250 is midweight (everyday tees), and 250+ is heavyweight (premium tees, hoodies, sweatshirts). Higher GSM usually feels thicker, warmer and more structured.";

const SPEC_FIELDS = {
    gsm: { label: "Fabric weight", format: (v) => `${v} GSM` },
    fabric: { label: "Fabric", format: (v) => v },
    fit: { label: "Fit", format: (v) => v },
    care: { label: "Care", format: (v) => v },
    origin: { label: "Origin", format: (v) => v },
    print: { label: "Print / finish", format: (v) => v },
    lining: { label: "Lining", format: (v) => v },
    sole: { label: "Sole", format: (v) => v },
    fabricFeel: { label: "Feel", format: (v) => v },
};

function specLine(p, key) {
    const v = p.specs && p.specs[key];
    return v ? SPEC_FIELDS[key].format(v) : null;
}

function productDetails(p) {
    const lines = [`${p.name}${p.category ? ` — ${p.category}` : ""}`];
    if (p.price != null) {
        lines.push(
            p.onSale && p.salePrice != null
                ? `Price: ${formatPrice(p.salePrice)} (was ${formatPrice(p.price)})`
                : `Price: ${formatPrice(p.price)}`
        );
    }
    for (const key of Object.keys(SPEC_FIELDS)) {
        const v = specLine(p, key);
        if (v) lines.push(`${SPEC_FIELDS[key].label}: ${v}`);
    }
    if (p.colors?.length) lines.push(`Colours: ${p.colors.join(", ")}`);
    if (p.sizes?.length) lines.push(`Sizes: ${p.sizes.join(", ")}`);
    if (p.inStock === false) lines.push("Currently out of stock.");
    return { text: lines.join("\n"), links: p.url ? [{ label: `View ${p.name}`, url: p.url }] : [] };
}

const SPEC_INTENTS = [
    {
        key: "gsm",
        keywords: ["gsm", "grams per", "gram", "fabric weight", "how heavy", "how thick", "thickness", "heavyweight", "midweight", "lightweight", "weight of the fabric"],
        field: "gsm",
        generic: () => ({
            text: `${GSM_EXPLAINER}\n\nAsk me about a specific piece (e.g. "GSM of the Signature Hoodie") and I'll give its exact weight if it's listed — otherwise it's shown on the product page.`,
        }),
        answer: (p) => `${p.name} is ${p.specs.gsm} GSM.`,
        missing: (p) => `The exact GSM for ${p.name} isn't listed in my data — please check the product page or email ${CONTACT.email}.`,
    },
    {
        key: "fabric",
        keywords: ["fabric", "material", "cotton", "polyester", "fleece", "made of", "made from", "composition", "what is it made", "blend", "cloth", "quality"],
        field: "fabric",
        generic: () => ({
            text: "Fabric and composition are listed per product, so they're exact for each piece. Tell me which item you mean (e.g. \"fabric of the black hoodie\") or open its product page.",
            links: [{ label: "Browse the shop", url: "https://blackaboij.com/shop" }],
        }),
        answer: (p) => `${p.name} is made of ${p.specs.fabric}${p.specs.gsm ? ` (${p.specs.gsm} GSM)` : ""}.`,
        missing: (p) => `The fabric for ${p.name} isn't listed in my data — please check the product page or email ${CONTACT.email}.`,
    },
    {
        key: "fit",
        keywords: ["fit", "oversized", "oversize", "slim", "regular fit", "loose", "baggy", "true to size", "runs small", "runs large", "cut"],
        field: "fit",
        generic: () => ({ text: "Fit differs by piece. Tell me which item you mean and I'll share its fit if it's listed, or check the size info on the product page." }),
        answer: (p) => `${p.name} has a ${p.specs.fit} fit.`,
        missing: (p) => `The fit for ${p.name} isn't listed in my data — check its product page or email ${CONTACT.email} for sizing advice.`,
    },
    {
        key: "care",
        keywords: ["wash", "washing", "care", "shrink", "iron", "dry clean", "tumble", "laundry", "fade"],
        field: "care",
        generic: () => ({ text: "Care instructions are specific to each fabric. Tell me the item and I'll share its care info if it's listed — as a general tip, wash dark garments inside out in cold water to keep black shades rich." }),
        answer: (p) => `Care for ${p.name}: ${p.specs.care}`,
        missing: (p) => `Care details for ${p.name} aren't listed in my data — check the label or product page.`,
    },
    {
        key: "origin",
        keywords: ["made in", "origin", "where is it made", "where are your products made", "manufactured", "country of origin"],
        field: "origin",
        generic: () => ({ text: `Origin details are listed per product. For anything not shown, email ${CONTACT.email}.` }),
        answer: (p) => `${p.name}: ${p.specs.origin}.`,
        missing: (p) => `I don't have origin info for ${p.name} — email ${CONTACT.email} and we'll confirm.`,
    },
    {
        key: "size",
        keywords: ["size", "sizes", "sizing", "size chart", "size guide", "measurement", "measurements", "what size"],
        custom: (p) =>
            p?.sizes?.length
                ? { text: `${p.name} comes in: ${p.sizes.join(", ")}.`, links: p.url ? [{ label: "View product", url: p.url }] : [] }
                : {
                      text: `Available sizes are shown on each product page. If you're between sizes or unsure about fit, email us at ${CONTACT.email} and we'll help. Need a different size after ordering? Return the original item and place a new order.`,
                      links: [{ label: "Browse the shop", url: "https://blackaboij.com/shop" }],
                  },
    },
    {
        key: "color",
        keywords: ["color", "colour", "colors", "colours", "shade", "shades", "what colors"],
        custom: (p) =>
            p?.colors?.length
                ? { text: `${p.name} comes in: ${p.colors.join(", ")}. ${POLICY_FACTS.colorNote}` }
                : {
                      text: `Our motto here is "all shades of black" — plenty of black tones across the range. Exact colour options are listed on each product page. ${POLICY_FACTS.colorNote}`,
                      links: [{ label: "Shop all", url: "https://blackaboij.com/shop" }],
                  },
    },
    {
        key: "stock",
        keywords: ["in stock", "available", "availability", "out of stock", "restock", "sold out", "back in stock"],
        custom: (p) =>
            p && p.inStock !== undefined
                ? { text: p.inStock ? `${p.name} is in stock.` : `${p.name} is currently out of stock.`, links: p.url ? [{ label: "View product", url: p.url }] : [] }
                : {
                      text: "Stock is shown live on each product page — if a size isn't selectable, it's currently unavailable. Ask us at " + CONTACT.email + " about restocks.",
                      links: [{ label: "Browse the shop", url: "https://blackaboij.com/shop" }],
                  },
    },
];

function buildSpecReply(intent, message) {
    const product = findProduct(message);
    if (intent.custom) return intent.custom(product);
    if (!product) return intent.generic();
    if (product.specs && product.specs[intent.field]) {
        return { text: intent.answer(product), links: product.url ? [{ label: "View product", url: product.url }] : [] };
    }
    return { text: intent.missing(product), links: product.url ? [{ label: "View product", url: product.url }] : [] };
}

/* ------------------------------------------------------------------
 * Quick replies + greeting
 * ------------------------------------------------------------------ */

export const QUICK_REPLIES = [
    "What's on sale?",
    "What products do you have?",
    "What is GSM / fabric?",
    "Shipping & delivery",
    "Return policy",
    "Contact a human",
];

export const GREETING =
    "Hey, welcome to Blackaboij 🖤 I can help with sales, products, fabric & GSM, shipping, returns and contact info. What do you need?";

/* ------------------------------------------------------------------
 * General intents
 * ------------------------------------------------------------------ */

const INTENTS = [
    {
        key: "sale",
        keywords: ["sale", "discount", "offer", "deal", "% off", "percent off", "black friday", "promo", "coupon", "voucher", "promotion"],
        reply: () => {
            const items = getOnSaleProducts();
            const list = items.length
                ? "\n\nCurrently discounted:\n" +
                  items.map((p) => `• ${p.name} — ${formatPrice(p.salePrice)} (was ${formatPrice(p.price)})`).join("\n")
                : "";
            return {
                text: `${SALE.title}: ${SALE.detail} We also have an ${SALE.accessoriesTitle}.${list}\n\n${SALE.highlightNote}`,
                links: [
                    { label: "Shop the sale", url: SALE.url },
                    { label: "Accessories sale", url: SALE.accessoriesUrl },
                ],
            };
        },
    },
    {
        key: "new",
        keywords: ["new arrival", "new arrivals", "new in", "latest", "just dropped", "newest", "new collection"],
        reply: () => ({
            text: "Fresh drops live in the New Arrivals collections:",
            links: [
                { label: "Men New Arrivals", url: CATEGORIES.men[0].url },
                { label: "Women New Arrivals", url: CATEGORIES.women[0].url },
            ],
        }),
    },
    {
        key: "products",
        keywords: ["what product", "products do you have", "what do you sell", "catalog", "catalogue", "collection", "categories", "range", "what do you have", "show me everything"],
        reply: () => ({
            text: "We carry men's and women's tees, hoodies & sweaters, shorts, outerwear and shoes, plus an accessories line.",
            links: [
                { label: "Men", url: CATEGORIES.men[0].url },
                { label: "Women", url: CATEGORIES.women[0].url },
                { label: "Accessories", url: CATEGORIES.accessories[0].url },
                { label: "Shop all", url: "https://blackaboij.com/shop" },
            ],
        }),
    },
    {
        key: "tees",
        keywords: ["tee", "tees", "t-shirt", "tshirt", "t shirt", "shirt"],
        reply: (msg) => categoryReply(msg, "Tees", "tees"),
    },
    {
        key: "hoodies",
        keywords: ["hoodie", "hoodies", "sweater", "sweaters", "sweatshirt", "jumper"],
        reply: (msg) => categoryReply(msg, "Hoodies & Sweaters", "hoodies & sweaters"),
    },
    {
        key: "shorts",
        keywords: ["short", "shorts", "pants", "trousers", "bottoms"],
        reply: (msg) => categoryReply(msg, "Shorts", "shorts"),
    },
    {
        key: "outerwear",
        keywords: ["outerwear", "outwear", "outwears", "jacket", "jackets", "coat", "coats"],
        reply: (msg) => categoryReply(msg, "Outerwear", "outerwear"),
    },
    {
        key: "shoes",
        keywords: ["shoe", "shoes", "sneaker", "sneakers", "footwear", "trainers"],
        reply: (msg) => categoryReply(msg, "Shoes", "shoes"),
    },
    {
        key: "accessories",
        keywords: ["accessor", "cap", "caps", "hat", "hats", "belt", "bag"],
        reply: () => ({ text: "All accessories are in one place (and there's an Accessories Sale running):", links: CATEGORIES.accessories }),
    },
    {
        key: "women",
        keywords: ["women", "womens", "womenswear", "woman", "ladies", "female"],
        reply: () => ({ text: "Here's the women's range:", links: CATEGORIES.women }),
    },
    {
        key: "men",
        keywords: ["men", "mens", "menswear", "man", "male", "guys"],
        reply: () => ({ text: "Here's the men's range:", links: CATEGORIES.men }),
    },
    {
        key: "price",
        keywords: ["price", "prices", "cost", "how much", "pricing", "expensive", "cheap", "cheapest", "affordable"],
        reply: (msg) => {
            const p = findProduct(msg);
            if (p && p.price != null) {
                const d = productDetails(p);
                return { text: d.text.split("\n").slice(0, 2).join("\n") + "\n\nPrices include VAT; shipping is calculated at checkout.", links: d.links };
            }
            return {
                text: "Pricing varies by item — exact prices (with sale prices where they apply) are on each product page. Prices include VAT.",
                links: [{ label: "Browse the shop", url: "https://blackaboij.com/shop" }],
            };
        },
    },
    {
        key: "shipping",
        keywords: ["shipping", "delivery", "deliver", "ship to", "how long", "dispatch", "international", "worldwide", "abroad", "express", "shipping cost", "free shipping", "processing"],
        reply: () => ({
            text:
                `${POLICY_FACTS.domestic} ${POLICY_FACTS.processing}\n\n` +
                `${
                    POLICY_FACTS.freeShippingThreshold
                        ? `Free standard shipping in France on orders over €${POLICY_FACTS.freeShippingThreshold}; fees apply below that.`
                        : "Free standard shipping applies on eligible orders in France — the shipping cost is shown in your cart before you pay."
                }\n${POLICY_FACTS.international}\n${POLICY_FACTS.express}\n${POLICY_FACTS.tracking}\n${POLICY_FACTS.customs}`,
            links: [{ label: "Shipping policy", url: POLICIES.shipping }],
        }),
    },
    {
        key: "tracking",
        keywords: ["track", "tracking", "where is my order", "order status", "my order", "parcel", "package"],
        reply: () => ({
            text: `${POLICY_FACTS.tracking} Can't find it? Email ${CONTACT.email} with your order number.`,
            links: [{ label: "Contact us", url: CONTACT.contactPageUrl }],
        }),
    },
    {
        key: "returns",
        keywords: ["return", "returns", "refund", "money back", "send back", "return window"],
        reply: () => ({
            text: `${POLICY_FACTS.returnWindow}\n${POLICY_FACTS.returnCondition}\n${POLICY_FACTS.returnProcess} (${CONTACT.policyEmail})\n${POLICY_FACTS.returnCost}\n${POLICY_FACTS.refund}`,
            links: [{ label: "Return policy", url: POLICIES.returns }],
        }),
    },
    {
        key: "exchange",
        keywords: ["exchange", "swap", "wrong size", "change size", "different size", "too small", "too big"],
        reply: () => ({
            text: `${POLICY_FACTS.exchange} ${POLICY_FACTS.returnWindow}`,
            links: [{ label: "Return policy", url: POLICIES.returns }],
        }),
    },
    {
        key: "damaged",
        keywords: ["damaged", "defective", "broken", "faulty", "wrong item", "incorrect item", "arrived damaged"],
        reply: () => ({
            text: `${POLICY_FACTS.damaged} Email ${CONTACT.policyEmail} with photos and your order number.`,
            links: [{ label: "Return policy", url: POLICIES.returns }],
        }),
    },
    {
        key: "payment",
        keywords: ["payment", "pay", "credit card", "card", "checkout", "vat", "tax", "secure"],
        reply: () => ({
            text: `${POLICY_FACTS.payment} Shipping is calculated at checkout. ${POLICY_FACTS.cancel}`,
            links: [{ label: "Terms & conditions", url: POLICIES.terms }],
        }),
    },
    {
        key: "cancel",
        keywords: ["cancel", "cancellation", "change my order", "modify order", "edit order"],
        reply: () => ({
            text: POLICY_FACTS.cancel + ` Reach us at ${CONTACT.email} or ${CONTACT.phone}.`,
            links: [{ label: "Contact us", url: CONTACT.contactPageUrl }],
        }),
    },
    {
        key: "terms",
        keywords: ["terms", "conditions", "legal", "privacy"],
        reply: () => ({
            text: "Our terms & conditions cover orders, payments, promotions, liability and site use (French law and EU e-commerce regulations apply).",
            links: [{ label: "Terms & conditions", url: POLICIES.terms }],
        }),
    },
    {
        key: "newsletter",
        keywords: ["newsletter", "subscribe", "mailing list", "updates"],
        reply: () => ({ text: "You can join our weekly newsletter using the SUBSCRIBE box in the site footer." }),
    },
    {
        key: "social",
        keywords: ["instagram", "facebook", "pinterest", "social", "follow you"],
        reply: () => ({
            text: "Follow us here:",
            links: [
                { label: "Instagram", url: CONTACT.social.instagram },
                { label: "Facebook", url: CONTACT.social.facebook },
                { label: "Pinterest", url: CONTACT.social.pinterest },
            ],
        }),
    },
    {
        key: "contact",
        keywords: ["contact", "human", "agent", "support", "help me", "email", "phone", "call", "reach you", "talk to someone", "customer service", "bulk order", "collaboration", "business inquiry"],
        reply: () => ({
            text: `You can reach us directly:\nEmail: ${CONTACT.email}\nPhone: ${CONTACT.phone}\nAddress: ${CONTACT.address}\n\nWe also handle order questions, bulk orders and business collaborations.`,
            links: [
                { label: "Contact page", url: CONTACT.contactPageUrl },
                { label: "Call us", url: CONTACT.phoneHref },
            ],
        }),
    },
    {
        key: "store",
        keywords: ["store", "shop location", "mall", "in person", "physical store", "visit", "where are you", "address", "location", "find you", "istres"],
        reply: () => ({
            text: `Find us at: ${CONTACT.address}`,
            links: [{ label: "Find our store", url: CONTACT.storePageUrl }],
        }),
    },
    {
        key: "about",
        keywords: ["about", "who are you", "brand", "story", "blackaboij"],
        reply: () => ({
            text: `${BRAND.name} — "${BRAND.tagline}". A premium fashion and lifestyle brand with modern clothing and accessories for men and women, from casual to formal.`,
            links: [{ label: "Visit the site", url: BRAND.homeUrl }],
        }),
    },
    {
        key: "greeting",
        keywords: ["hi", "hello", "hey", "yo", "sup", "hola", "bonjour", "good morning", "good evening"],
        reply: () => ({ text: "Hey! 👋 Ask me about sales, products, fabric & GSM, sizes, shipping, returns or how to reach us." }),
    },
    {
        key: "thanks",
        keywords: ["thank", "thanks", "cheers", "appreciate", "merci"],
        reply: () => ({ text: "Anytime 🖤 Anything else I can help with?" }),
    },
];

function categoryReply(message, categoryLabel, plural) {
    const matches = findProductsByContext(message).filter((p) => p.category === categoryLabel);
    const gender = /\bwomen|\bwoman|\bladies/.test(norm(message)) ? "women" : /\bmen\b|\bmens\b/.test(norm(message)) ? "men" : null;
    const links = gender
        ? CATEGORIES[gender].filter((c) => c.label.toLowerCase().startsWith(categoryLabel.split(" ")[0].toLowerCase()))
        : [
              ...CATEGORIES.men.filter((c) => c.label === categoryLabel).map((c) => ({ ...c, label: `Men's ${plural}` })),
              ...CATEGORIES.women.filter((c) => c.label === categoryLabel).map((c) => ({ ...c, label: `Women's ${plural}` })),
          ];
    const list = matches.length
        ? "\n\n" +
          matches
              .slice(0, 6)
              .map((p) => `• ${p.name} — ${formatPrice(p.onSale && p.salePrice != null ? p.salePrice : p.price)}`)
              .join("\n")
        : "";
    return { text: `${gender ? `Here are our ${gender === "women" ? "women's" : "men's"} ${plural}.` : `We have ${plural} for men and women.`}${list}`, links };
}

/* ------------------------------------------------------------------
 * Matching
 * ------------------------------------------------------------------
 * Word-boundary matching so "women" no longer triggers "men", "shipping"
 * no longer triggers "hi", "your" no longer triggers "yo", etc.
 * Keywords are matched at the START of a word (so "accessor" matches
 * "accessories"); keywords of 3 chars or fewer must be whole words.
 * The intent with the highest score (longest matched keyword) wins.
 */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function keywordScore(message, kw) {
    const k = norm(kw);
    const short = k.length <= 3;
    const re = new RegExp(`(^|[^a-z0-9])${escapeRe(k)}${short ? "($|[^a-z0-9])" : ""}`);
    return re.test(message) ? k.length : 0;
}

function scoreIntent(message, keywords) {
    return keywords.reduce((best, kw) => Math.max(best, keywordScore(message, kw)), 0);
}

const FALLBACK_REPLY = {
    text: `I'm not totally sure about that one — try asking about sales, products, fabric & GSM, sizes, shipping, returns or contact info. You can also email ${CONTACT.email}.`,
    links: [{ label: "Contact page", url: CONTACT.contactPageUrl }],
};

export function getBotReply(rawMessage) {
    const message = norm(rawMessage).trim();
    if (!message) return FALLBACK_REPLY;

    // "Fabric of the Signature Hoodie" etc. — product-specific + spec questions first.
    const product = findProduct(message);

    let best = null;
    let bestScore = 0;

    for (const intent of SPEC_INTENTS) {
        const s = scoreIntent(message, intent.keywords);
        // A named product plus a spec keyword is a strong signal.
        const adj = s && product ? s + 5 : s;
        if (adj > bestScore) {
            best = { type: "spec", intent };
            bestScore = adj;
        }
    }
    const CATEGORY_KEYS = ["tees", "hoodies", "shorts", "outerwear", "shoes"];
    for (const intent of INTENTS) {
        // Category words beat a bare gender word ("women tees" -> tees).
        const s = scoreIntent(message, intent.keywords) + (CATEGORY_KEYS.includes(intent.key) && scoreIntent(message, intent.keywords) ? 3 : 0);
        if (s > bestScore) {
            best = { type: "general", intent };
            bestScore = s;
        }
    }

    if (!best) {
        // Just a product name with no question -> show its details.
        if (product) return productDetails(product);
        return FALLBACK_REPLY;
    }
    return best.type === "spec" ? buildSpecReply(best.intent, message) : best.intent.reply(message);
}