# Project status

Last updated: 2026-11-04.

## Current stage: Local Shopify integration and testing

The initial documentation foundation was completed and verified on 2026-11-03:

- Project requirements documented.
- Architecture proposal documented, with unvalidated choices identified.
- AI assistant instructions created.
- Development roadmap documented.
- Decision log initialized.

The owner subsequently authorized a mobile-first local frontend, product-specific URL selection, custom presentation and Shopify cart integration. The design and content still need product media and client review.

Tamseel-style locally bundled smooth wheel scrolling has been added and checked in a browser, including cart open/close and reduced-motion behavior. Touch scrolling remains native.

The owner supplied product CSVs, a logo, a Canadian-dollar preference, a WhatsApp number, and review screenshots. The local page includes six catalog entries, 15 variant combinations and descriptions; CSV amounts are a fallback snapshot. Celestial Moonlight Pendant replaced Moon Beam at the owner's request. Reviews use the supplied text and screenshot-attributed initials. The owner explicitly requested a five-star visual treatment for every displayed review. On 2026-11-04, 39 owner-supplied images were configured in the six galleries and recommendation cards. Their numbered order is preserved, and image paths, gallery navigation and responsive display were checked locally.

The owner confirmed that the Celestial folder images, including those engraved “Moon Beam” and “Eagle Spirit”, should be used. The Wolf gallery shows a purple gemstone while other gemstone options are selectable; a selection note is displayed until verified option-specific images are available. The original PNGs total approximately 72 MB, so media optimization remains a performance consideration.

The local page supports light and dark themes using a header toggle. The selected theme is saved in browser storage where available; light is the default. Mobile layout, theme persistence, and the cart's appearance were checked locally.

On 2026-11-04, additional presentation refinements were applied locally: desktop product galleries place vertical thumbnails beside a compact 4:5 image frame with centered side controls; the mobile header centers the logo above its three controls; reviews use a fixed-size horizontal carousel; and section spacing, typography, button fills, floating actions, and footer copy were adjusted. The desktop frame height now responds to available viewport height, recommendation buttons use the requested forward and reverse green-fill states, primary CTA buttons begin green and reveal their outline on hover, and cart and page-quantity controls share a forest-fill hover. Each review card shows its quotation mark at top left. Scripts load in dependency order at the end of the document. JavaScript syntax and CSS brace balance were checked locally. A headless-browser screenshot could not be produced in the current environment, so the latest refinement remains pending visual review.

The Storefront API is connected locally, using tokenless access to `medicine-bear-arts.myshopify.com` with Canada/CAD context. The six products, their current prices, and variant IDs were read successfully. Isolated Shopify test carts verified multi-product add, quantity changes, removal, returned totals, and an HTTPS checkout URL; a browser test reached the Shopify checkout page without placing an order. A stock-limited quantity adjustment was also tested. No successful payment or order, checkout settings, tracking, deployment, or launch has been tested or changed. Cart and checkout depend on live API access; failures fall back to a clearly labeled preview with checkout disabled.

On 2026-11-04, a GitHub-readiness audit added a root README, deployment checklist, security notes, Git attributes, and a recorded QA report. JavaScript syntax, CSS structure, local media paths, static-server responses, live CAD product reads, and source credential hygiene passed. A fresh temporary cart mutation was not run during that final audit because the local approval quota was unavailable; the earlier recorded isolated cart tests remain the cart-mutation evidence. No source code was published, deployed, or connected to GitHub as part of this audit.

## Not started

- Final media, product content review, and full commerce acceptance testing.
- Analytics integration and tracking configuration.
- Paid test order, shipping, tax, payment methods, and analytics verification.
- Deployment, hosting setup, and DNS changes.

## Next recommended action

Confirm the product-image matches and option imagery, consider media optimization, review content and testimonial permissions, and arrange merchant-approved end-to-end checkout testing, tracking and deployment decisions. See [FRONTEND_SETUP.md](FRONTEND_SETUP.md) for local setup.

Update this file as work is actually performed and verified; distinguish proposed work, in-progress work, completed work, and blockers. Record dates and link supporting decisions or evidence where useful.
