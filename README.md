# Medicine Bear Arts Campaign Storefront

A mobile-first, static product landing page for Medicine Bear Arts. It presents selected products in a premium campaign layout and sends live cart and checkout activity to the existing Shopify store.

## What is included

- Eleven selectable products through `?product=<slug>` URLs.
- Product galleries, descriptions, options, quantity controls, and product-specific WhatsApp messages.
- Shopify Storefront Cart API integration in the Canadian market with CAD pricing.
- A multi-item bag that redirects to Shopify's secure checkout URL.
- A preview-only fallback if the Shopify API cannot be reached.
- A controlled, secondary trust path with concise artist/story, shipping, returns, materials, contact, and Shop All links to the official store.
- Provider-neutral campaign-link events for a future consented analytics container.
- Light and dark themes, smooth wheel scrolling, responsive desktop/mobile layouts, review carousel, and accessible keyboard controls.

## Project structure

```text
index.html             Page structure and local script order
css/styles.css         Responsive design, themes, hover states, and layout
js/products.js         Campaign catalog, copy, local media, snapshot fallback data
js/shopify.js          Public Shopify Storefront API and Cart API client
js/app.js              Rendering, routing, gallery, cart, and review behavior
js/theme.js            Saved light/dark theme behavior
assets/Logo/           Client logo
assets/Products/       Client-provided product images
assets/vendor/         Local Lenis smooth-scroll library and its MIT license
docs/                  Project notes, setup, deployment, and decision records
```

## Local preview

No packages or build command are needed. Open the project folder using a simple local web server, such as VS Code Live Server, and visit:

```text
http://127.0.0.1:5500/index.html
```

To feature a different product, use a URL such as:

```text
http://127.0.0.1:5500/index.html?product=celestial-moonlight-pendant
```

Opening `index.html` directly can show the layout, but use a local server for the most reliable Storefront API behavior.

## Shopify integration

The page uses the public Storefront API at `medicine-bear-arts.myshopify.com` in the Canadian market. It does not contain an Admin API credential, a private token, payment logic, or a custom backend.

When the Storefront API responds, the page reads current product variants, prices, availability, and the Shopify checkout URL. The displayed bag creates a Shopify cart. When the connection fails, the bag becomes a clearly labelled local preview and checkout is disabled.

A final live read audit confirmed all 11 configured products in the Canadian storefront, including their titles, CAD prices, variant IDs, and availability. A successful checkout redirect confirms that Shopify accepts a cart; it does not confirm payment or an order.

## Catalog and media updates

Edit [js/products.js](js/products.js) to add a product, change approved campaign copy, update local media paths, or change a product slug. Keep Shopify handles in `storeUrl` accurate because the app derives live product reads from that URL.

Use product media that is approved by the client. The current 51 PNG files are about 58 MB in total. Convert and resize copies for production before paid traffic, while retaining the supplied originals separately.

## GitHub and static deployment

This is a static site. Commit the full project, including `assets/vendor/` and `assets/Products/`, to a GitHub repository. GitHub Pages, Netlify, Cloudflare Pages, Vercel static hosting, or another HTTPS static host can serve it without a build step.

For GitHub Pages:

1. Create a repository and upload this folder.
2. In **Settings → Pages**, select **Deploy from a branch**.
3. Choose the branch containing `index.html` and the repository root (`/`).
4. Wait for the Pages URL, then test all featured-product URLs and a Shopify checkout redirect.
5. Add a custom domain only after the client approves its hosting and DNS plan.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the release checklist and [docs/QA_REPORT.md](docs/QA_REPORT.md) for the completed pre-deployment checks. Campaign trust content and measurement handoff are documented in [docs/CAMPAIGN_TRUST_CONTENT.md](docs/CAMPAIGN_TRUST_CONTENT.md) and [docs/ANALYTICS_HANDOFF.md](docs/ANALYTICS_HANDOFF.md).

## Before client launch

- Confirm the client approves every product image, description, review, and testimonial attribution.
- Optimize the product images and test the page over mobile data.
- Perform a merchant-approved Shopify checkout test without relying on this page to process payment.
- Confirm shipping, taxes, payment methods, inventory, and Canadian market settings in Shopify.
- Configure and verify consent-aware analytics before paid ads launch.
- Test the deployed HTTPS URL on mobile and desktop, including the dark theme, WhatsApp links, product options, bag operations, and checkout redirect.

## Why `assets/vendor` stays

`assets/vendor/` contains the locally bundled Lenis JavaScript and CSS that power the requested smooth desktop scrolling. Its MIT license is included as `LENIS-LICENSE.txt`. Removing that folder would break smooth scrolling and remove the required license notice.

## License

The campaign source and client assets remain Medicine Bear Arts project material. The Lenis files in `assets/vendor/` are distributed under their included MIT license.
