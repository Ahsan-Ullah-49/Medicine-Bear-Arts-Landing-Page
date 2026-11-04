# Deployment and release checklist

## What can be deployed

This repository is a static frontend. It requires no server process, database, package installation, or environment variables. The browser communicates directly with Shopify's public Storefront API and then redirects buyers to the Shopify checkout URL returned for the active cart.

Use an HTTPS static host. GitHub Pages is suitable for a client preview. A final advertising launch should use the client-approved domain and hosting plan.

## GitHub Pages

1. Create a new GitHub repository.
2. Upload the complete project root. Keep `index.html`, `css/`, `js/`, `assets/`, `docs/`, `README.md`, and `.gitignore`.
3. Open **Settings → Pages** in the repository.
4. Set the source to **Deploy from a branch**.
5. Select the intended branch and the root folder (`/`).
6. Wait for the deployment URL from GitHub Pages.
7. Test the HTTPS URL before sharing it with the client.

## Required post-deployment checks

- Open the default product and every configured `?product=<slug>` URL.
- Confirm the product image gallery, title, CAD price, availability, and options load from Shopify.
- Add an available product to the bag, adjust quantity, remove it, add a second product, and confirm totals remain CAD.
- Use **Continue to secure checkout** and verify Shopify receives the cart. Do not place an order unless the merchant authorizes a test order.
- Test the WhatsApp links, floating bag, theme toggle, review controls, desktop layout, and a mobile device.
- Check browser console errors and failed network requests.

## Client and Shopify checks

The page cannot independently confirm the merchant's shipping profiles, taxes, payment providers, checkout branding, inventory policy, or order status. Confirm those settings inside Shopify before running paid traffic.

## Performance work before paid ads

The supplied product PNGs are approximately 72 MB in total. Generate client-approved WebP or AVIF delivery copies and responsive sizes before an advertising launch. Preserve original client files outside the deployed build and update `js/products.js` with the optimized copy paths only after verifying each product image.

## Rollback

For GitHub Pages, restore the last known working commit or select the previous successful deployment in GitHub Pages. Shopify's existing store, theme, carts, and checkout remain independent from this static frontend.
