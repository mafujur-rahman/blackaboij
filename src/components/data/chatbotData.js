/**
 * chatbotData.js
 * ------------------------------------------------------------------
 * All the "brain" content for the Blackaboij chatbot lives here, kept
 * separate from the UI (Chatbot.jsx) so non-developers can update
 * answers, links, and prices without touching component code.
 *
 * WHERE THE REAL DATA COMES FROM
 * The live site (blackaboij.com) renders its product grid from a
 * backend/CMS call, so exact live prices/stock cannot be scraped
 * from the page markup. Two things are stubbed below so the bot
 * works out of the box:
 *   1. PRODUCTS — replace this array with a real fetch to your own
 *      product API / CMS (Shopify, WooCommerce, custom backend, etc).
 *   2. Anywhere you see "TODO" — swap in your live values.
 *
 * Everything else (categories, nav structure, contact info, policy
 * links, sale banner) was taken directly from the current site.
 */

export const BRAND = {
    name: "Blackaboij",
    tagline: "Life is made of choice",
    homeUrl: "https://blackaboij.com",
    logo: "https://blackaboij.com/images/new-logo.png",
};

export const CONTACT = {
    email: "info@blackaboij.com",
    phone: "+33 6 62 02 39 69",
    phoneHref: "tel:+33662023969",
    address: "20 Allée des Piboules, résidence les Belenos, 13800 Istres, France",
    contactPageUrl: "https://blackaboij.com/contact",
    social: {
        facebook: "https://www.facebook.com/BBOIJ",
        pinterest: "https://fr.pinterest.com/blackaboij/",
        instagram: "https://www.instagram.com/blackaboij_/",
    },
};

export const SALE = {
    title: "Black Friday Sale",
    detail: "Up to 60% off on selected items across the store.",
    url: "https://blackaboij.com/shop",
    // TODO: once you have a live "on sale" product feed, list a few
    // highlighted items here so the bot can name specific pieces.
    highlightNote:
        "Discounts are applied automatically at checkout on eligible items — the sale badge shows on the product card.",
};

export const CATEGORIES = {
    men: [
        { label: "New Arrivals", url: "https://blackaboij.com/men/men-collection" },
        { label: "Tees", url: "https://blackaboij.com/men/men-tees" },
        { label: "Hoodies & Sweaters", url: "https://blackaboij.com/men/men-hoodies-sweaters" },
        { label: "Pants", url: "https://blackaboij.com/men/men-pants" },
        { label: "Outerwear", url: "https://blackaboij.com/men/men-outwears" },
        { label: "Shoes", url: "https://blackaboij.com/men/men-shoes" },
        { label: "Caps", url: "https://blackaboij.com/men/men-cap" },
        { label: "Hats", url: "https://blackaboij.com/men/men-hat" },
    ],
    women: [
        { label: "New Arrivals", url: "https://blackaboij.com/women/women-collection" },
        { label: "Tees", url: "https://blackaboij.com/women/women-tees" },
        { label: "Hoodies & Sweaters", url: "https://blackaboij.com/women/women-hoodies-sweaters" },
        { label: "Pants", url: "https://blackaboij.com/women/women-pants" },
        { label: "Outerwear", url: "https://blackaboij.com/women/women-outwears" },
        { label: "Shoes", url: "https://blackaboij.com/women/women-shoes" },
        { label: "Caps", url: "https://blackaboij.com/women/women-cap" },
        { label: "Hats", url: "https://blackaboij.com/women/women-hat" },
    ],
    accessories: [{ label: "All Accessories", url: "https://blackaboij.com/accessories" }],
};

export const POLICIES = {
    returns: "https://blackaboij.com/return-policy",
    shipping: "https://blackaboij.com/shipping-policy",
    terms: "https://blackaboij.com/terms-conditions",
};

/**
 * Sample product shape — REPLACE with a real fetch (e.g.
 * `await fetch('/api/products?onSale=true')`) inside Chatbot.jsx or
 * a data hook. Kept here so the bot has something concrete to show
 * out of the box and so the shape is obvious.
 */
export const PRODUCTS = [
    {
        id: "sample-hoodie-01",
        name: "Signature Black Hoodie",
        category: "Men / Hoodies & Sweaters",
        price: 79.0,
        salePrice: 39.0,
        onSale: true,
        url: "https://blackaboij.com/men/men-hoodies-sweaters",
    },
    {
        id: "sample-tee-01",
        name: "Core Logo Tee",
        category: "Women / Tees",
        price: 39.0,
        salePrice: 19.0,
        onSale: true,
        url: "https://blackaboij.com/women/women-tees",
    },
    {
        id: "sample-cap-01",
        name: "Structured Cap",
        category: "Accessories",
        price: 29.0,
        salePrice: null,
        onSale: false,
        url: "https://blackaboij.com/accessories",
    },
    // TODO: remove these samples once real product data is wired in.
];

const formatPrice = (n) => `€${n.toFixed(2)}`;

export function getOnSaleProducts() {
    return PRODUCTS.filter((p) => p.onSale);
}

/**
 * Quick replies shown as tappable chips. Keep this list short — 4-6
 * items reads as helpful, more reads as cluttered.
 */
export const QUICK_REPLIES = [
    "What's on sale?",
    "What products do you have?",
    "How much do things cost?",
    "Shipping & delivery",
    "Return policy",
    "Contact a human",
];

export const GREETING =
    "Hey, welcome to Blackaboij 🖤 I can help with sales, sizing, shipping, and contact info. What do you need?";

/**
 * Very small keyword-based intent matcher. Good enough for a
 * storefront FAQ bot; swap the `getBotReply` body for a call to your
 * own LLM/API endpoint if you want open-ended answers later — the
 * function signature (string in, {text, links?} out) stays the same.
 */
const INTENTS = [
    {
        key: "sale",
        keywords: ["sale", "discount", "offer", "deal", "% off", "percent off", "black friday", "promo"],
        reply: () => {
            const items = getOnSaleProducts();
            const lines = items
                .map((p) => `• ${p.name} — ${formatPrice(p.salePrice)} (was ${formatPrice(p.price)})`)
                .join("\n");
            return {
                text: `${SALE.title}: ${SALE.detail}\n\nCurrently discounted:\n${lines}\n\n${SALE.highlightNote}`,
                links: [{ label: "Shop the sale", url: SALE.url }],
            };
        },
    },
    {
        key: "products",
        keywords: [
            "what product",
            "products do you have",
            "what do you sell",
            "catalog",
            "catalogue",
            "collection",
            "categories",
            "available now",
            "in stock",
            "range",
        ],
        reply: () => ({
            text:
                "We carry Men's and Women's tees, hoodies & sweaters, pants, outerwear, shoes, caps and hats, plus a full accessories line.",
            links: [
                { label: "Men", url: CATEGORIES.men[0].url },
                { label: "Women", url: CATEGORIES.women[0].url },
                { label: "Accessories", url: CATEGORIES.accessories[0].url },
            ],
        }),
    },
    {
        key: "men",
        keywords: ["men", "menswear", "man's", "mens"],
        reply: () => ({
            text: "Here's the men's range:",
            links: CATEGORIES.men,
        }),
    },
    {
        key: "women",
        keywords: ["women", "womenswear", "woman's", "womens"],
        reply: () => ({
            text: "Here's the women's range:",
            links: CATEGORIES.women,
        }),
    },
    {
        key: "accessories",
        keywords: ["accessor"],
        reply: () => ({
            text: "All accessories are in one place:",
            links: CATEGORIES.accessories,
        }),
    },
    {
        key: "price",
        keywords: ["price", "cost", "how much", "pricing", "expensive", "cheap"],
        reply: () => ({
            text:
                "Pricing varies by item and size — tees and caps sit at the lower end, hoodies, outerwear and shoes cost more. Exact prices show on each product page, and sale items are marked with a strike-through price.",
            links: [{ label: "Browse the shop", url: "https://blackaboij.com/shop" }],
        }),
    },
    {
        key: "shipping",
        keywords: ["shipping", "delivery", "deliver", "ship to", "how long"],
        reply: () => ({
            text: "Shipping is free on the site. For delivery times and countries covered, check the full shipping policy.",
            links: [{ label: "Shipping policy", url: POLICIES.shipping }],
        }),
    },
    {
        key: "returns",
        keywords: ["return", "refund", "exchange", "money back"],
        reply: () => ({
            text: "You can return or exchange eligible items — full conditions are on the return policy page.",
            links: [{ label: "Return policy", url: POLICIES.returns }],
        }),
    },
    {
        key: "terms",
        keywords: ["terms", "conditions", "legal"],
        reply: () => ({
            text: "Our terms & conditions cover orders, payments and site use.",
            links: [{ label: "Terms & conditions", url: POLICIES.terms }],
        }),
    },
    {
        key: "contact",
        keywords: ["contact", "human", "agent", "support", "help me", "email", "phone", "call", "reach you", "talk to someone"],
        reply: () => ({
            text: `You can reach us directly:\nEmail: ${CONTACT.email}\nPhone: ${CONTACT.phone}\nAddress: ${CONTACT.address}`,
            links: [{ label: "Contact page", url: CONTACT.contactPageUrl }],
        }),
    },
    {
        key: "store",
        keywords: ["store", "shop location", "mall", "in person", "physical store", "visit"],
        reply: () => ({
            text: `Our store is located at: ${CONTACT.address}`,
            links: [{ label: "Find our store", url: "https://blackaboij.com/store" }],
        }),
    },
    {
        key: "greeting",
        keywords: ["hi", "hello", "hey", "yo", "sup"],
        reply: () => ({ text: "Hey! 👋 Ask me about sales, products, pricing, shipping, or how to reach us." }),
    },
    {
        key: "thanks",
        keywords: ["thank", "thanks", "cheers", "appreciate"],
        reply: () => ({ text: "Anytime 🖤 Anything else I can help with?" }),
    },
];

const FALLBACK_REPLY = {
    text:
        "I'm not totally sure about that one — try asking about sales, products, pricing, shipping, returns, or how to contact us. You can also email info@blackaboij.com directly.",
    links: [{ label: "Contact page", url: CONTACT.contactPageUrl }],
};

export function getBotReply(rawMessage) {
    const message = rawMessage.trim().toLowerCase();
    if (!message) return FALLBACK_REPLY;

    for (const intent of INTENTS) {
        if (intent.keywords.some((kw) => message.includes(kw))) {
            return intent.reply();
        }
    }
    return FALLBACK_REPLY;
}