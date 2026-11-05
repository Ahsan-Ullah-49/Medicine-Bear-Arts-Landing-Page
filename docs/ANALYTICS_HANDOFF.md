# Campaign interaction measurement handoff

## What is already in the page

The landing page now emits a provider-neutral browser event whenever a visitor uses one of the secondary trust links:

```text
medicinebear:campaign-interaction
```

If a consented analytics container initializes `window.dataLayer`, the same interaction is pushed as:

```text
event: medicinebear_campaign_link_click
destination: <link identifier>
page_location: <landing-page URL>
```

No name, email, phone number, cart data, or other personal information is included.

## Tracked secondary paths

- About the Artist
- Our Story
- Shipping Information
- Returns / Exchanges
- Materials & FAQ
- Contact Us
- Shop All Jewelry

The `destination` value distinguishes the trust-section links from their footer equivalents so a future report can identify placement as well as topic.

## Still required before reporting is possible

The project does not contain a Google Analytics 4 Measurement ID, Google Tag Manager container ID, Meta Pixel ID, consent-management configuration, or a Shopify cross-domain attribution setup. Do not invent or add those IDs.

Once the client provides the approved analytics and consent setup, configure it to collect `medicinebear_campaign_link_click` and attribute Shopify checkout/purchase events back to the campaign. Use the report to compare the primary product-to-checkout path against visitors who first open an artist, story, policy, or Shop All link.
