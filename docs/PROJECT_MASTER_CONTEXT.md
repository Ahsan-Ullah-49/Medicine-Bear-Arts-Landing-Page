# Medicine Bear Arts: project master context

Last initialized: 2026-11-03. This document is the primary specification, not evidence that development or integration is complete. See [PROJECT_STATUS.md](PROJECT_STATUS.md) for verified progress, [PROJECT_DECISIONS.md](PROJECT_DECISIONS.md) for decision state, [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) for phases, and [AGENTS.md](AGENTS.md) for assistant instructions.

## 1. Background and client

Medicine Bear Arts is an existing Indigenous art and jewelry brand with an operational Shopify store at <https://medicinebeararts.com/>. The client wants a separately customized, premium product landing experience for paid advertising while preserving the existing storefront, theme, product images, and operations. The proposed URL is `https://offers.medicinebeararts.com/`; the domain, hosting, and whether Shopify itself hosts the experience are not yet decided. Brand history, cultural details, product claims, and trust signals must come from verified client materials.

## 2. Business objectives

Present approximately 10–12 selected products in a focused, mobile-first shopping experience for Google Ads, Meta Ads (Facebook and Instagram), and TikTok Ads. Give the client control over campaign presentation and custom imagery while using the existing Shopify commerce infrastructure for purchase and fulfillment. Support a single customer journey from an advertisement to a multi-item Shopify checkout and measure outcomes accurately, subject to consent and technical validation.

## 3. Functional requirements and dynamic routing

Use **one reusable landing page**, with configurable product slugs that select the featured product. Examples (domain and slugs are illustrative, not confirmed):

```text
https://offers.medicinebeararts.com/?product=product-one
https://offers.medicinebeararts.com/?product=product-seven
```

The advertised product should appear prominently first with its custom photography, name, current price, detailed information, applicable variant options, quantity selector, Add to Cart, Buy Now, and relevant purchasing information. Show the other selected products as smaller recommendations, each able to become the featured product through the same template. Support configurable routing and preserve relevant campaign parameters where appropriate. Decide and document the behavior for missing, invalid, unpublished, or unavailable products before implementation; do not assume a fallback or redirect.

The owner initially selected six products and requested CAD, supplied a logo, WhatsApp contact, review screenshots and product CSVs, and requested sticky and floating contact/cart controls and a light/dark theme toggle. Additional products may be added later. The local frontend uses live Shopify prices, variants, availability, cart and checkout URL when reachable; fallback data is a labeled CSV snapshot and checkout is disabled. See project status for verification limits. Buy Now behavior remains a pending product decision.

## 4. Data ownership and custom content

Maintain a configurable mapping between campaign slugs, custom presentation content, and the correct Shopify product and purchasable variant identities. The eventual configuration should support independent hero and gallery images, marketing headlines, descriptions, benefits, stories, specifications, and SEO information. Updating campaign content must not alter Shopify product records or existing store imagery. Actual products, variant mappings, content, imagery, rights, and publication workflow remain to be supplied and verified.

Shopify is the source of truth for live prices, currency, availability, and purchasable variants. Display current values returned for the applicable storefront and market; validate variant and quantity availability, and handle changes and API errors explicitly. Marketing content must not contradict verified product or commerce information. Tax, shipping, payment availability, and final totals are subject to Shopify configuration and checkout behavior.

## 5. Proposed architecture and Shopify integration

The preferred stack is HTML5, CSS3, and modular vanilla JavaScript, without an unnecessary framework. A static, independently hosted frontend is one option, not a final decision. Shopify's official Storefront API and Storefront Cart API are the proposed integration; API version, store permissions, scopes, product publication, market/currency context, access setup, rate limits, and compatibility need validation against the actual store and current official documentation during implementation. Shopify handles commerce identities, prices, inventory, cart, checkout, payment, orders, taxes, and shipping within its actual configuration. Do not introduce a custom backend unless a specific requirement makes it necessary and the client approves it.

The frontend owns presentation, independent media and marketing copy, routing, interactions, and the custom cart interface. Tokenless Storefront API access to the verified store has been tested from the local frontend. Use only appropriately scoped public Storefront access in the browser; browser-exposed tokens are visible to visitors and are not secrets. Never expose private API credentials, Admin API credentials, or other secrets. No store configuration or storefront content has been modified.

## 6. Cart and checkout

The custom interface should create and manage a Shopify cart that can contain multiple product variants and quantities: add the featured item or recommendations, adjust quantities, remove items, view returned totals, continue shopping, and proceed together to one secure Shopify checkout. For example, three units of Product Seven and two of Product Two should be purchasable together when valid and available. Cart identity and persistence across visits or page changes, browser-storage behavior and limitations, expiration, recovery from stale carts or failures, reconciliation of Shopify responses, and inventory/price changes require design and testing. Do not assume the Storefront API cart automatically synchronizes with the existing theme cart.

Redirect using the cart's official Shopify checkout URL after successful cart creation and updates. Never collect card details or build a payment processor or order database. The client's checkout settings and payment, shipping, tax, market, and domain compatibility must be verified. A click on checkout is an initiation event, not proof of an order or payment.

## 7. Advertising, attribution, and privacy

Plan these event families; use each platform's current official specifications and account settings when implementation begins. IDs, integration ownership, event payloads, consent rules, and actual configuration remain pending.

| Platform | Planned measurement |
| --- | --- |
| Google Ads / GA4 where applicable | Product views, add to cart, begin checkout, and confirmed purchase/conversion. |
| Meta Pixel | ViewContent, AddToCart, InitiateCheckout, and confirmed Purchase. |
| TikTok Pixel | Product view, add to cart, checkout initiation, and completed payment, using current platform event definitions. |

Capture and retain relevant UTM parameters and applicable click identifiers only as permitted by consent and applicable requirements. Investigate how attribution survives the journey from landing page to Shopify checkout and how confirmed purchase events are emitted on Shopify. Audit existing Shopify pixels, apps, tags, and server-side integrations first; establish event ownership and deduplication so purchase events are neither lost nor counted twice. A checkout-button click must never be counted as a confirmed purchase. Validate events end to end using appropriate platform diagnostics and test orders; browser-only checkout completion tracking must not be assumed. Consent management, privacy disclosures, applicable jurisdictions, and legal review are pending.

## 8. Brand, UI/UX, performance, and accessibility

Aim for a premium, modern, conversion-focused product presentation with high-quality client-approved photography, clear purchase controls, minimal distractions, and verified trust signals. Design mobile first and adapt to different screen sizes. Respect the brand's Indigenous identity using client-supplied guidance; do not invent cultural claims, product descriptions, testimonials, or history. Visual design is not final until actual references, brand assets, and requirements are reviewed.

The owner's 2026-11-04 refinements request a smaller desktop 4:5 hero frame that fits within the viewport, vertical thumbnails to its left, centered previous/next controls on the frame, and an unchanged mobile gallery layout. On mobile, center the logo above a second row containing the theme, contact, and cart controls. Use a readable sans-serif with a distinct italic display face, compact section spacing, targeted smooth solid-fill hover states only for the theme, gallery, and quantity controls, larger floating actions, and remove editorial/index labels from the product frame and cards. The review heading sits above a fixed-size wide carousel that slides every five seconds with arrow controls; the footer ends with the requested WhatsApp CTA, copyright, and smooth back-to-top link. Preserve the review text and visible initials supplied in screenshots. The owner explicitly requested a five-star visual treatment for every displayed review; do not invent customer identity or ethnicity.

Plan for optimized responsive images, efficient asset loading, fast perceived and measured performance, and graceful behavior on slow or failed requests. Use semantic structure, keyboard-operable controls, visible focus, suitable contrast, meaningful image alternatives, accessible form labels and error messages, and screen-reader-friendly cart feedback. Agree measurable performance and accessibility targets and test against them in a later phase.

## 9. Security, hosting, SEO, and previews

Use HTTPS in any production deployment, least-privilege access, appropriate token handling, safe rendering of product content, and careful handling of browser storage and customer data. No private credentials belong in client-side code. Avoid collecting sensitive payment information; Shopify checkout handles payment.

Possible hosting choices include an independently hosted static site or an approach managed through Shopify, subject to feasibility and permission. Independent hosting offers presentation control but introduces separate hosting, domain, integration, tracking, and operational responsibilities. A Shopify-managed approach may fit existing operations and domain choices but its customization, integration, and deployment constraints must be investigated. No option, domain, DNS change, or deployment is approved yet.

Client-rendered query-parameter pages may have inconsistent search indexing and social/ad preview metadata because crawlers vary in JavaScript execution and query handling. Assess discoverability, canonical URLs, per-product metadata and preview requirements, and whether static generation, server rendering, or another approved solution is needed before selecting an approach. Do not assume per-product previews will work automatically or add a backend without approval.

## 10. Phases and constraints

Phase 1 covered planning and documentation. On 2026-11-03 the owner authorized a local frontend foundation with HTML, CSS, JavaScript, and organized asset folders. The initial interface should contain only a header (logo, cart, contact), products, testimonials, and footer; each product needs a clearly labeled product-specific WhatsApp contact action. It should be mobile first and initially accommodate ten products with an easily extensible configuration. Actual product links and imagery will be supplied later. See the roadmap and status for progress and remaining dependencies.

The owner subsequently authorized local Shopify cart integration. Outside the authorized scope: Shopify store configuration or storefront changes, analytics configuration, deployment, and DNS changes. Product images, details, testimonials, and contact information must be supplied or verified rather than invented. Outside the intended product architecture unless separately approved: a separate commerce backend, order database, payment processor, or disruption of the existing storefront. No production changes without explicit approval.

## 11. Pending information and success criteria

Decisions and inputs needed include product selection; approved images, content, and branding; product/variant IDs and mappings; API access and permissions; domain and hosting; checkout and Buy Now behavior; existing advertising integrations and tracking IDs; consent approach; SEO/social preview requirements; and deployment method. See the decision log for status. Confirm the client's actual checkout, markets, currency, shipping, tax, and payment configuration rather than assuming compatibility.

The eventual project succeeds when the approved products can each be featured by a configurable URL; approved custom content appears without changing the original store; accurate live Shopify variant, price, and availability data drives a usable accessible cart; multiple items reach one secure Shopify checkout; consent-aware advertising events and confirmed purchases are verified without duplicate reporting; and the approved experience meets agreed mobile, performance, accessibility, and launch criteria. These are future acceptance goals, not claims of completion.
