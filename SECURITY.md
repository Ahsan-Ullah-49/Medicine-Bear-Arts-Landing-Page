# Security notes

## Credential policy

This static site must never contain Shopify Admin API credentials, private app tokens, payment-provider secrets, or staff login details. The browser only uses Shopify's public Storefront API endpoint and Shopify-hosted checkout URL.

If a public Storefront token is ever enabled in `js/products.js`, treat it as a publishable browser credential only. Restrict it in Shopify to the required storefront permissions and rotate it in Shopify if it is accidentally exposed beyond the intended repository.

## Reporting an issue

Do not publish checkout, account, or security details in a public GitHub issue. Contact the Medicine Bear Arts store owner through the established private channel, include the affected URL and a safe reproduction description, and avoid including customer data.

## Deployment safeguards

- Use HTTPS hosting.
- Keep the Shopify Admin account separate from this frontend project.
- Review repository collaborators before publishing client assets.
- Do not commit `.env` files, private exports, customer records, or Admin API credentials.
