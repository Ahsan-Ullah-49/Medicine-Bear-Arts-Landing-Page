# Pre-deployment QA report

Last reviewed: 2026-11-04.

## Completed checks

- JavaScript syntax passed for `js/theme.js`, `js/products.js`, `js/shopify.js`, and `js/app.js`.
- CSS brace balance passed.
- Catalog validation passed: six products, 15 configured variants, and 39 configured local media references all resolve to files in the project.
- Local static-server checks returned `200` for the page, stylesheet, application script, Lenis vendor script, and a product-specific URL.
- Live Shopify Storefront reads in the Canadian market returned CAD prices and active variants for all six configured products:
  - The Whispers of the Needle — CAD 140.00
  - Spirit of the Sky — CAD 160.00
  - The Golden Radiance Bracelet — CAD 250.00
  - Celestial Moonlight Pendant — CAD 60.00
  - Sacred Circle of Life Pendant — CAD 160.00
  - Grand Mother Wolf Pendant Inlay — CAD 200.00
- Source review found no Shopify Admin credential, private token, password, customer data, or payment secret in the project.

## Commerce status

The frontend uses Shopify's public Storefront Cart API. Product reads and CAD validation are live. Previous isolated cart checks validated product add, quantity adjustment, removal, checkout URL generation, and Shopify checkout navigation without placing an order.

No payment was attempted and no order was created. Shopify merchant settings—including shipping, taxes, payment methods, inventory policy, checkout branding, analytics, and consent—remain outside this project and must be approved in Shopify before launch.

## Remaining release checks

- Perform one merchant-authorized cart and checkout redirect test from the deployed HTTPS URL.
- Review the deployed page manually on real mobile and desktop browsers. The local environment could not produce a reliable headless screenshot during this audit.
- Replace or optimize the supplied PNGs before paid advertising; the current product-media directory is approximately 72 MB.
- Confirm client approval for product imagery, product copy, testimonials, and cultural attribution.
