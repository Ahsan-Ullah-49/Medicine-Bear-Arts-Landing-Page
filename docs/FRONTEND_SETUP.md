# Local frontend setup

Open `index.html` through a modern local web server. This is a local, undeployed site that connects to the existing live Shopify store when available. Adding items creates a real Shopify cart; checkout opens the store checkout, but no order is created unless a buyer completes it. No package installation or build step is needed. See [README.md](../README.md) for the repository overview and [DEPLOYMENT.md](DEPLOYMENT.md) for deployment checks.

## Assets and media

The client-supplied logo is in `assets/Logo/`. The folders in `assets/Products/` are organized by product; put that product's approved photos and videos in its folder and record their paths in `js/products.js`. Adding files alone does not automatically connect them to the page. Do not move or rename supplied assets without checking their references.

Use 4:5 product photography (for example 1600 × 2000) with breathing room around the subject: the featured frame is 4:5, while 3:4 cards crop some width. For product video, a 4:5 file (1080 × 1350) suits the frame; keep a 9:16 version for vertical campaigns if needed. Preserve originals. The gallery supports image paths and video entries; for example:

```js
media: [
  { type: "image", src: "assets/Products/example/front.jpg" },
  { type: "image", src: "assets/Products/example/side.jpg" },
  { type: "video", src: "assets/Products/example/video.mp4", poster: "assets/Products/example/front.jpg" }
]
```

Smooth wheel scrolling uses locally bundled Lenis and its MIT license in `assets/vendor/`, matching the Tamseel settings. Touch scrolling remains native, reduced-motion preferences disable the effect, and native scrolling is the fallback if the library is unavailable. Keep this folder when uploading to GitHub: `index.html` loads both files directly.

## Products, prices and contact

Edit `js/products.js` to add products or update their content and media. Each product needs a unique stable slug; a local product URL is `index.html?product=your-slug`. Eleven products are configured; the featured product is excluded from the ten recommendations. An unknown slug shows the first product and a notice. Other campaign parameters are retained when navigating.

The configured WhatsApp number is the client-supplied Canadian number. Product links include the relevant product name in the message. CSV catalog values and variant IDs are snapshots; `js/shopify.js` requests live products, variants, prices, and availability from the Storefront API in the Canadian context and verifies CAD. Grand Mother Wolf and Celestial Moonlight have gemstone options. Celestial chain-length requests should be discussed on WhatsApp because this frontend does not currently provide an order-note field. The page falls back to labeled snapshot prices when the store cannot be reached.

In live mode, the bag uses the Storefront Cart API and redirects to Shopify's returned checkout URL. Its cart identity is stored in the browser and is distinct from the existing theme cart. If the store cannot be reached, the fallback bag is only a preview and checkout is disabled; it is not automatically migrated into the Shopify cart. Review text and initials came from the supplied screenshots; the owner requested a five-star visual treatment for every displayed review. Confirm permission and attribution before publishing.
