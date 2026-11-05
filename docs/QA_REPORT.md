# Pre-deployment QA report

Last reviewed: 2026-11-05.

## Completed checks

- JavaScript syntax passed for `js/theme.js`, `js/products.js`, `js/shopify.js`, and `js/app.js`.
- CSS brace balance passed.
- Catalog validation passed: 11 products, 25 configured variants, and 51 configured local media references all resolve to files in the project.
- The description control source was checked: the collapsed control follows the preview copy, and the expanded control follows the remaining copy.
- Local static-server checks returned `200` for all 11 product URLs and the page's core HTML, CSS, JavaScript, vendor, and license files.
- Final Shopify Storefront audit in the Canadian market passed: 11 products, 25 variants, and 24 currently available variants. Current CAD prices were refreshed in the snapshot fallback data:
  - The Whispers of the Needle — CAD 120.00
  - Spirit of the Sky — CAD 140.00
  - The Golden Radiance Bracelet — CAD 180.00
  - Celestial Moonlight Pendant — CAD 60.00
  - Sacred Circle of Life Pendant — CAD 140.00
  - Grand Mother Wolf Pendant Inlay — CAD 160.00
  - Honor Our Mother Wrap Ring — CAD 140.00
  - Sterling Silver Bear Print Faceted Gemstone Stud Earrings — CAD 100.00; Blue available and Pink currently unavailable
  - The Guardian Spirit Bracelet — CAD 180.00
  - Little Wolf Track – Studs — CAD 50.00
  - Eagle Spirit – Brass Stud Earrings — CAD 100.00
- Source review found no Shopify Admin credential, private token, password, customer data, or payment secret in the project.
- The controlled trust path passed static checks: four official-store destinations, WhatsApp contact, footer resources, and analytics link attributes are present in the served page.

## Commerce status

The frontend uses Shopify's public Storefront Cart API. Product reads and CAD validation are live. Previous isolated cart checks validated product add, quantity adjustment, removal, checkout URL generation, and Shopify checkout navigation without placing an order.

No payment was attempted and no order was created. Shopify merchant settings—including shipping, taxes, payment methods, inventory policy, checkout branding, analytics, and consent—remain outside this project and must be approved in Shopify before launch.

## Remaining release checks

- Perform one merchant-authorized cart and checkout redirect test from the deployed HTTPS URL.
- Review the deployed page manually on real mobile and desktop browsers. The local environment could not produce a reliable headless screenshot during this audit.
- Replace or optimize the supplied PNGs before paid advertising; the current product-media directory is approximately 58 MB.
- Confirm client approval for product imagery, product copy, testimonials, and cultural attribution.
