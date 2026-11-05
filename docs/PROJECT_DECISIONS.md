# Project decision log

Initialized 2026-11-03 from the project brief. Confirmed items are requirements supplied by the owner, not evidence of completed integration or implementation. Proposed items need validation and pending items need a decision.

## Confirmed decisions

- The existing Shopify store is the intended commerce backend; payments and order processing use Shopify.
- The frontend and its campaign presentation will be independently customized; the preferred stack is HTML, CSS, and vanilla JavaScript.
- Approximately 10–12 selected products will be advertised using one dynamic landing page with product-specific URLs.
- Each selected product can become the main featured product; the other selected products appear as recommendations.
- Customers should be able to purchase multiple products together with adjustable quantities.
- Advertising platforms are Google, Meta, and TikTok.
- The existing Shopify storefront, theme, product images, and operations must not be disturbed; production changes require explicit approval.
- The initial documentation task created five Markdown files in `docs`. On 2026-11-03, the owner subsequently authorized a local frontend foundation and asset folders.
- The page should be mobile first, contain a header with logo, cart and contact, followed by products, testimonials and a footer, and provide a product-specific WhatsApp contact action for each product. The owner later selected six products initially; allow additional entries later.
- Display currency is CAD. Use the supplied logo and WhatsApp contact, sticky header, and floating WhatsApp/cart actions. Product images and videos are being prepared by the owner.

## Proposed technical approach — pending validation

- Shopify Storefront API and its Cart API have been validated for local tokenless product reads and test carts; full launch and order testing remain pending.
- Query-parameter product routing, such as `?product=product-seven`.
- Independently hosted static frontend where suitable; a Shopify-managed approach remains possible.
- Custom campaign content and imagery mapped to Shopify products and variants, without changing the original Shopify content.

## Pending decisions and information

- Final product selection, approved imagery and rights, marketing content, and design/branding details.
- Final domain, hosting platform, and deployment method.
- Shopify API access, required scopes, compatibility, and product/variant mappings.
- Tracking IDs, current Shopify advertising integrations, event ownership and deduplication, and consent management.
- Exact checkout and Buy Now behavior, including interaction with an existing cart; market, currency, shipping, tax, and payment compatibility.
- Invalid-product behavior, cart persistence and recovery details, SEO/social previews, and measurable accessibility and performance targets.

## Change log

| Date | Decision or change | Reason | Consequences |
| --- | --- | --- | --- |
| 2026-11-03 | Initialize confirmed requirements, proposed approaches, and pending decisions from the brief. | Establish a durable project foundation. | Implementation and unvalidated technical choices remain pending; update this log as decisions are made. |
| 2026-11-03 | Authorize local HTML/CSS/JavaScript frontend and organized asset folders with ten expandable product entries and WhatsApp actions. | Prepare the page before the owner supplies imagery and store product links. | Product content, contact details, verified testimonials, live Shopify integration and production launch remain pending. |
| 2026-11-03 | Start with six supplied product links, CAD, supplied logo and WhatsApp number; extend the local presentation and review carousel. | Reflect the owner's latest brief. | Additional products can be added; verify prices, variant IDs, media rights and testimonial attribution before launch. |
| 2026-11-03 | Connect the local frontend to the store's tokenless Storefront API in the Canadian market. | The owner requested a functional cart and supplied product CSVs. | Six products and test carts were verified; payment/order testing, tracking, assets and deployment remain pending. |
| 2026-11-05 | Extend the campaign catalog to 11 approved products without changing the page layout. | The owner supplied five new public product links, a Shopify CSV, and local image folders. | Live CAD product/variant reads were verified; the Pink Bear Print Stud variant is unavailable and remains disabled. |
| 2026-11-05 | Keep the description control at the end of expanded copy and below collapsed preview copy. | The owner requested the prior reading flow. | Uses native `details` semantics and CSS ordering; no new JavaScript dependency or visual redesign. |
| 2026-11-03 | Replace Moon Beam Pendant With Inlay with Celestial Moonlight Pendant in the selected catalog. | The owner identified the original selection as incorrect and supplied the replacement product link and CSV. | Use the new product slug and five gemstone variants. Existing Shopify carts are not automatically altered. |
| 2026-11-04 | Refine the local presentation with a compact desktop 4:5 gallery and vertical thumbnails, a two-row mobile header, targeted solid-fill controls, and a fixed horizontal review carousel. | The owner supplied detailed desktop, mobile, review, and footer directions. | The latest layout has not yet received browser visual review. Review names retain only screenshot-provided initials. The owner explicitly requested a five-star visual treatment for all displayed reviews; ethnicity is not inferred. |
| 2026-11-04 | Tune the latest hero, card-button, and review presentation after owner screenshot feedback. | The owner reported a clipped hero frame, inefficient title wrapping, incorrect card-button states, and misplaced review quotation marks. | The desktop frame uses available viewport height, title width permits balanced wrapping, View Piece retains a green sweep, Ask on WhatsApp begins filled and reveals its outline on hover, and every review card shows a quotation mark at top left. |
| 2026-11-04 | Apply the requested hover hierarchy and move frontend scripts to the document end. | The owner requested theme-style fills for quantity and cart controls and a reverse-fill interaction for primary conversion actions. | Quantity and cart controls use forest-fill hovers; Contact us, Add to Cart, and Chat on WhatsApp begin green and reveal a forest outline on hover; JavaScript resources remain ordered by dependency at the end of the local document. |

For future entries, add a dated row identifying the decision, rationale, and consequences; update the relevant master context, roadmap, and status when needed. Record reversals and their reasons rather than silently rewriting history.
