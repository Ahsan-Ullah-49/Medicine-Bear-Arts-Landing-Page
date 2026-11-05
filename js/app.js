(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Application bootstrap and page references
  // ---------------------------------------------------------------------------
  const config = window.MEDICINE_BEAR_CONFIG;
  if (!config || !Array.isArray(config.products) || !config.products.length) return;
  const products = config.products;
  const bySlug = new Map(products.map(product => [product.slug, product]));
  const featured = document.querySelector("#featured-product");
  const grid = document.querySelector("#product-grid");
  const productCount = document.querySelector("#product-count");
  const routeMessage = document.querySelector("#route-message");
  const dialog = document.querySelector("#cart-dialog");
  const cartItems = document.querySelector("#cart-items");
  const cartSummary = document.querySelector("#cart-summary");
  const cartCount = document.querySelector("#cart-count");
  if (!featured || !grid || !dialog || !cartItems || !cartSummary || !cartCount) return;

  // Smooth scrolling is disabled whenever the visitor requests reduced motion.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let lenis = null;
  function configureScroll() {
    lenis?.destroy();
    lenis = null;
    if (!reducedMotion.matches && window.Lenis) {
      lenis = new window.Lenis({ autoRaf: true, lerp: 0.085, smoothWheel: true, syncTouch: false, wheelMultiplier: 0.95, stopInertiaOnNavigate: true, prevent: node => node.hasAttribute("data-lenis-prevent") });
      if (dialog.open) lenis.stop();
    }
  }
  configureScroll();
  reducedMotion.addEventListener("change", configureScroll);

  // ---------------------------------------------------------------------------
  // Safe display and catalog helpers
  // ---------------------------------------------------------------------------
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const plainText = value => String(value ?? "").replace(/\r\n?/g, "\n").replace(/[^\S\n]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  const safeURL = path => {
    if (typeof path !== "string" || !path.trim()) return "";
    try { const url = new URL(path, window.location.href); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; } catch (_) { return ""; }
  };
  const formatPrice = price => typeof price === "number" && Number.isFinite(price) && price >= 0 ? new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(price) + " CAD" : "Price available on request";
  const productOptions = product => Array.isArray(product.options) ? product.options.filter(option => option && typeof option.name === "string" && Array.isArray(option.values) && option.values.length) : [];
  const productVariants = product => Array.isArray(product.variants) ? product.variants : [];
  const cardPrice = product => {
    const prices = productVariants(product).map(variant => variant.price).filter(price => typeof price === "number" && Number.isFinite(price) && price >= 0);
    if (!prices.length) return formatPrice(product.price);
    const lowest = Math.min(...prices);
    return `${prices.some(price => price !== lowest) ? "From " : ""}${formatPrice(lowest)}`;
  };
  const mediaFor = product => {
    const raw = Array.isArray(product.media) && product.media.length ? product.media : [ ...(Array.isArray(product.images) ? product.images : []), ...(Array.isArray(product.videos) ? product.videos.map(src => typeof src === "string" ? { type: "video", src } : src) : []) ];
    return raw.map(item => {
      const source = typeof item === "string" ? item : item && (item.src || item.url);
      const src = safeURL(source);
      if (!src) return null;
      const type = typeof item === "object" && item.type === "video" || /\.(mp4|webm|ogg)(?:\?|#|$)/i.test(source) ? "video" : "image";
      return { type, src, poster: typeof item === "object" ? safeURL(item.poster) : "" };
    }).filter(Boolean);
  };
  let quantity = 1;
  let selectedImage = 0;
  let selectedOptions = [];
  let lastFocus = null;
  let commerceClient = null;
  let commerceMode = config.shopify?.storeDomain && window.MedicineBearShopify ? "checking" : "preview";
  let liveCart = null;
  let cartBusy = false;
  let cartNeedsRefresh = false;
  let commerceMessage = "";
  const cartStorageKey = "medicine-bear-preview-bag-v2";
  let cart = {};
  try { const saved = JSON.parse(localStorage.getItem(cartStorageKey) || "{}"); if (saved && typeof saved === "object" && !Array.isArray(saved)) cart = saved; } catch (_) { /* Storage may be unavailable. */ }

  // ---------------------------------------------------------------------------
  // Featured-product selection, gallery, and rendering
  // ---------------------------------------------------------------------------
  function selectedVariant(product) {
    const variants = productVariants(product);
    return variants.find(variant => Array.isArray(variant.options) && selectedOptions.every((value, index) => variant.options[index] === value)) || (selectedOptions.length ? null : variants[0] || null);
  }
  function resetSelection(product) {
    quantity = 1; selectedImage = 0;
    const options = productOptions(product);
    const firstAvailable = productVariants(product).find(variant => variant.available === true && Array.isArray(variant.options)) || productVariants(product)[0];
    selectedOptions = options.map((option, index) => firstAvailable?.options?.[index] || option.values[0]);
  }
  function displayMedia(product, hero = false) {
    const media = mediaFor(product);
    const current = hero ? media[Math.min(selectedImage, Math.max(0, media.length - 1))] : media.find(item => item.type === "image");
    const classes = `product-image${hero ? " product-image--hero" : ""}`;
    if (!current) return `<div class="${classes}" aria-label="Product image coming soon"><div class="product-image__placeholder"><span>MB</span><small>Product image coming soon</small></div></div>`;
    if (current.type === "video") return `<div class="${classes}"><video class="product-image__primary" controls playsinline preload="metadata" ${current.poster ? `poster="${escapeHTML(current.poster)}"` : ""}><source src="${escapeHTML(current.src)}"></video></div>`;
    const currentIndex = media.indexOf(current);
    const nextImage = media.find((item, index) => item.type === "image" && index !== currentIndex);
    return `<div class="${classes}"><img class="product-image__primary" src="${escapeHTML(current.src)}" alt="${escapeHTML(product.name)}" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'}>${nextImage ? `<img class="product-image__alternate" src="${escapeHTML(nextImage.src)}" alt="" aria-hidden="true" loading="lazy">` : ""}</div>`;
  }
  function whatsappMarkup(product, classes, text) {
    const number = String(config.whatsappNumber || "").replace(/\D/g, "");
    if (!/^\d{8,15}$/.test(number)) return `<a class="${classes}" role="link" aria-disabled="true">${escapeHTML(text)}</a>`;
    const message = product ? `Hello, I would like to know more about ${product.name}.` : "Hello, I would like to know more about Medicine Bear Arts.";
    return `<a class="${classes}" href="https://wa.me/${encodeURIComponent(number)}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener noreferrer">${escapeHTML(text)} <span aria-hidden="true">↗</span></a>`;
  }
  function routeHref(slug) { const params = new URLSearchParams(window.location.search); params.set("product", slug); return `?${params.toString()}`; }
  function currentProduct() {
    const slug = new URLSearchParams(window.location.search).get("product");
    if (routeMessage) routeMessage.textContent = slug && !bySlug.has(slug) ? "That product is not available in this collection. Showing the first product instead." : "";
    return bySlug.get(slug) || products[0];
  }
  function descriptionMarkup(product) {
    const text = plainText(product.description);
    if (!text) return '<p class="product-hero__description">Contact us for details about this piece.</p>';
    const renderText = content => escapeHTML(content).replace(/\n/g, "<br>");
    if (text.length <= 185) return `<p class="product-hero__description">${renderText(text)}</p>`;
    let cut = Math.max(text.lastIndexOf(" ", 185), text.lastIndexOf("\n", 185)); if (cut < 80) cut = 185;
    return `<div class="product-hero__description"><p>${renderText(text.slice(0, cut))}<span data-description-ellipsis>…</span></p><details class="description-details"><summary>View More</summary><p>${renderText(text.slice(cut).trimStart())}</p></details></div>`;
  }
  function syncDescription(details) {
    const summary = details.querySelector("summary");
    if (summary) summary.textContent = details.open ? "View Less" : "View More";
    const ellipsis = details.closest(".product-hero__description")?.querySelector("[data-description-ellipsis]");
    if (ellipsis) ellipsis.hidden = details.open;
  }
  function scrollDescriptionControl(details) {
    const summary = details.querySelector("summary");
    if (!summary || !details.isConnected) return;
    const rect = summary.getBoundingClientRect();
    const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
    const destination = details.open
      ? Math.max(0, window.scrollY + rect.bottom - window.innerHeight + 32)
      : Math.max(0, window.scrollY + rect.top - headerHeight - 16);
    if (lenis && !reducedMotion.matches) lenis.scrollTo(destination, { duration: 0.9 });
    else window.scrollTo({ top: destination, behavior: reducedMotion.matches ? "instant" : "smooth" });
  }
  function toggleDescription(details) {
    details.open = !details.open;
    syncDescription(details);
    requestAnimationFrame(() => scrollDescriptionControl(details));
  }
  function renderProducts() {
    const product = currentProduct();
    const descriptionOpen = featured.dataset.renderedSlug === product.slug && !!featured.querySelector(".description-details")?.open;
    featured.dataset.renderedSlug = product.slug;
    const media = mediaFor(product);
    const variant = selectedVariant(product);
    const options = productOptions(product);
    const optionMarkup = options.map((option, i) => `<label class="product-option"><span>${escapeHTML(option.name)}</span><select data-option-index="${i}" aria-label="${escapeHTML(option.name)}">${option.values.map(value => `<option value="${escapeHTML(value)}"${selectedOptions[i] === value ? " selected" : ""}>${escapeHTML(value)}</option>`).join("")}</select></label>`).join("");
    const gemstoneNote = media.length && options.some(option => option.name.toLowerCase() === "gemstone") ? '<p class="product-option-note">Photos may show a different gemstone. Please check your selection before adding to cart.</p>' : "";
    const galleryControls = media.length > 1 ? `<div class="gallery-controls"><button class="gallery-control" type="button" data-gallery-step="-1" aria-label="Previous product image">←</button><button class="gallery-control" type="button" data-gallery-step="1" aria-label="Next product image">→</button></div>` : "";
    const gallery = media.length > 1 ? `<div class="product-gallery" aria-label="Product media" data-lenis-prevent>${media.map((item, i) => `<button type="button" class="product-gallery__thumbnail${i === selectedImage ? " is-active" : ""}" data-image-index="${i}" aria-label="View ${item.type === "video" ? "video" : "image"} ${i + 1}" aria-pressed="${i === selectedImage}">${item.type === "image" ? `<img src="${escapeHTML(item.src)}" alt="" loading="lazy" decoding="async">` : item.poster ? `<img src="${escapeHTML(item.poster)}" alt="" loading="lazy" decoding="async">` : '<span aria-hidden="true">▶</span>'}</button>`).join("")}</div>` : "";
    const currentPrice = variant ? variant.price : productVariants(product).length ? null : product.price;
    const availability = commerceMode === "live" && !product.storefrontReady ? '<p class="product-hero__note">This product is not currently available through the online checkout. Please contact us.</p>' : variant?.available === false ? '<p class="product-hero__note">This option is currently unavailable. Please choose another or contact us.</p>' : options.length && productVariants(product).length && !variant ? '<p class="product-hero__note">This combination is not available. Please select another option.</p>' : "";
    const unavailable = commerceMode === "checking" || cartBusy || cartNeedsRefresh || (commerceMode === "live" && (!product.storefrontReady || !variant?.id || variant.available !== true)) || (options.length && productVariants(product).length && !variant);
    const note = cartNeedsRefresh ? "The store connection was interrupted. Refresh your cart; prices and availability may have changed." : commerceMode === "live" && product.storefrontReady ? "Secure checkout through Shopify. Shipping and taxes are confirmed at checkout." : commerceMode === "checking" ? "Checking availability with the store…" : "Preview only. Current price and availability need confirmation.";
    featured.innerHTML = `<div class="product-hero"><div class="product-hero__visual"><div class="product-hero__frame">${displayMedia(product, true)}${galleryControls}</div>${gallery}</div><div class="product-hero__content"><h1 class="product-hero__title">${escapeHTML(product.name)}</h1><p class="product-hero__price">${escapeHTML(formatPrice(currentPrice))}</p>${product.priceStatus === "snapshot" ? '<p class="price-note">Catalog price; current price needs confirmation.</p>' : ""}${optionMarkup ? `<div class="product-options">${optionMarkup}${gemstoneNote}</div>` : ""}${availability}<div class="product-hero__controls"><span>Quantity</span><div class="quantity-control" aria-label="Select quantity"><button type="button" data-quantity="decrease" aria-label="Decrease quantity">−</button><output aria-live="polite">${quantity}</output><button type="button" data-quantity="increase" aria-label="Increase quantity">+</button></div></div><div class="product-hero__actions"><button type="button" class="button button--primary" data-add="${escapeHTML(product.slug)}"${unavailable ? " disabled" : ""}>Add to Cart <span aria-hidden="true">↗</span></button>${whatsappMarkup(product, "button button--whatsapp", "Ask on WhatsApp")}</div><p class="product-hero__note">${escapeHTML(note)}</p>${descriptionMarkup(product)}</div></div>`;
    const others = products.filter(item => item !== product);
    if (productCount) productCount.textContent = `${String(others.length).padStart(2, "0")} pieces`;
    grid.innerHTML = others.map(item => `<article class="product-card"><a class="product-card__visual" href="${escapeHTML(routeHref(item.slug))}" data-product-link="${escapeHTML(item.slug)}" aria-label="View ${escapeHTML(item.name)}">${displayMedia(item)}</a><div class="product-card__body"><h3 class="product-card__title">${escapeHTML(item.name)}</h3><p class="product-card__price">${escapeHTML(cardPrice(item))}</p>${item.priceStatus === "snapshot" ? '<p class="price-note">Price needs confirmation</p>' : ""}<div class="product-card__actions"><a class="button button--outline" href="${escapeHTML(routeHref(item.slug))}" data-product-link="${escapeHTML(item.slug)}">View piece <span aria-hidden="true">↗</span></a>${whatsappMarkup(item, "button button--whatsapp", "Ask on WhatsApp")}</div></div></article>`).join("");
    const details = featured.querySelector(".description-details");
    if (details) { if (descriptionOpen) details.open = true; syncDescription(details); }
  }
  // ---------------------------------------------------------------------------
  // Cart rendering and Shopify synchronization
  // ---------------------------------------------------------------------------
  function saveCart() { try { localStorage.setItem(cartStorageKey, JSON.stringify(cart)); } catch (_) { /* In-memory preview remains available. */ } }
  function renderCart() {
    const cartNote = dialog.querySelector(".cart-note");
    if (commerceMode === "live") {
      const entries = liveCart?.lines || [];
      const total = liveCart?.totalQuantity || 0;
      cartCount.textContent = String(total); cartCount.setAttribute("aria-label", `${total} ${total === 1 ? "item" : "items"} in shopping cart`);
      document.querySelectorAll(".floating-cart-count").forEach(count => { count.textContent = String(total); });
      cartItems.innerHTML = entries.length ? entries.map(item => {
        const variant = item.merchandise || {};
        const choices = (variant.selectedOptions || []).filter(option => option.value !== "Default Title").map(option => `${option.name}: ${option.value}`).join(" / ");
        return `<div class="cart-line"><div class="cart-line__info"><p class="cart-line__name">${escapeHTML(variant.product?.title || "Product")}</p><p class="cart-line__meta">${escapeHTML(choices)}${choices ? " · " : ""}${escapeHTML(item.currency === "CAD" ? formatPrice(item.total) : "Price unavailable")}</p></div><div class="cart-line__controls"><button type="button" data-live-decrease="${escapeHTML(item.id)}" aria-label="Remove one"${cartBusy ? " disabled" : ""}>−</button><span aria-label="Quantity">${item.quantity}</span><button type="button" data-live-increase="${escapeHTML(item.id)}" aria-label="Add one"${cartBusy || item.quantity >= 99 ? " disabled" : ""}>+</button><button type="button" data-live-remove="${escapeHTML(item.id)}"${cartBusy ? " disabled" : ""}>Remove</button></div></div>`;
      }).join("") : '<div class="cart-empty"><p>Your bag is empty.</p><p>Explore the collection and choose a piece.</p></div>';
      const status = commerceMessage ? `<p class="cart-notice" role="status">${escapeHTML(commerceMessage)}</p>` : "";
      const amounts = liveCart ? `<p class="cart-notice">Subtotal: ${escapeHTML(formatPrice(liveCart.subtotal))}<br>Estimated total: ${escapeHTML(formatPrice(liveCart.total))}</p>` : "";
      cartSummary.innerHTML = `${status}${amounts}${cartNeedsRefresh ? `<button type="button" class="button button--outline" data-refresh-cart${cartBusy ? " disabled" : ""}>Refresh cart</button>` : ""}<button type="button" class="button button--primary" data-live-checkout${cartBusy || cartNeedsRefresh || !total || !liveCart?.checkoutUrl ? " disabled" : ""}>Continue to secure checkout</button>`;
      if (cartNote) cartNote.textContent = "Shipping and taxes are calculated at checkout.";
      return;
    }
    if (cartNote) cartNote.textContent = "Secure checkout is unavailable until the store connection succeeds.";
    const entries = Object.entries(cart).filter(([, item]) => item && bySlug.has(item.slug) && Number.isInteger(item.quantity) && item.quantity > 0);
    const total = entries.reduce((sum, [, item]) => sum + item.quantity, 0);
    cartCount.textContent = String(total); cartCount.setAttribute("aria-label", `${total} ${total === 1 ? "item" : "items"} in preview bag`);
    document.querySelectorAll(".floating-cart-count").forEach(count => { count.textContent = String(total); });
    cartItems.innerHTML = entries.length ? entries.map(([key, item]) => `<div class="cart-line"><div class="cart-line__info"><p class="cart-line__name">${escapeHTML(bySlug.get(item.slug).name)}</p><p class="cart-line__meta">${escapeHTML(item.options?.join(" / ") || "Price needs confirmation")}</p></div><div class="cart-line__controls"><button type="button" data-cart-decrease="${escapeHTML(key)}" aria-label="Remove one">−</button><span aria-label="Quantity">${item.quantity}</span><button type="button" data-cart-increase="${escapeHTML(key)}" aria-label="Add one">+</button><button type="button" data-cart-remove="${escapeHTML(key)}">Remove</button></div></div>`).join("") : '<div class="cart-empty"><p>Your bag is empty.</p><p>Explore the collection and save a piece here.</p></div>';
    cartSummary.innerHTML = `<p class="cart-notice" role="status">${escapeHTML(commerceMode === "checking" ? "Connecting to the store…" : commerceMessage || "This bag is a preview. Live checkout is unavailable.")}</p>${config.shopify?.storeDomain && commerceMode !== "checking" ? '<button type="button" class="button button--outline" data-retry-store>Retry connection</button>' : ""}<button type="button" class="button button--primary" disabled>Checkout unavailable</button>`;
  }
  function openCart() { lastFocus = document.activeElement; if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal(); else if (!dialog.open) dialog.setAttribute("open", ""); if (dialog.open) lenis?.stop(); }
  function closeCart() { if (typeof dialog.close === "function" && dialog.open) dialog.close(); else dialog.removeAttribute("open"); lenis?.start(); if (lastFocus?.focus) lastFocus.focus(); }
  async function loadStore() {
    if (!config.shopify?.storeDomain || !window.MedicineBearShopify) return;
    commerceMode = "checking"; commerceMessage = ""; cartNeedsRefresh = false;
    renderProducts(); renderCart();
    try {
      const client = window.MedicineBearShopify.create(config.shopify);
      const handles = products.map(product => {
        const match = new URL(product.storeUrl).pathname.match(/\/products\/([^/]+)/);
        if (!match) throw new Error("A product link is missing its store handle.");
        return decodeURIComponent(match[1]);
      });
      const [liveProducts, restored] = await Promise.all([client.readProducts(handles), client.getCart()]);
      products.forEach((product, index) => {
        const live = liveProducts[handles[index]];
        product.storefrontReady = !!live;
        if (live) {
          product.options = live.options; product.variants = live.variants;
          product.price = live.price; product.priceStatus = "live";
          product.storefrontProductId = live.id;
        }
      });
      commerceClient = client; liveCart = restored; commerceMode = "live";
      resetSelection(currentProduct());
      commerceMessage = "";
    } catch (_) {
      commerceClient = null; commerceMode = "preview"; liveCart = null;
      commerceMessage = "The store connection is unavailable. Your bag is a preview; checkout is disabled. Please try again or contact us.";
    }
    renderProducts(); renderCart();
  }
  async function runCartOperation(operation, { open = false } = {}) {
    if (!commerceClient || cartBusy) return;
    cartBusy = true; commerceMessage = ""; renderProducts(); renderCart();
    if (open && !dialog.open) openCart();
    try {
      liveCart = await operation(); cartNeedsRefresh = false;
      commerceMessage = liveCart?.warnings?.join(" ") || "";
    } catch (error) {
      if (error.cart) { liveCart = error.cart; cartNeedsRefresh = false; }
      else { cartNeedsRefresh = true; }
      commerceMessage = error.message || "The cart could not be updated. Please refresh and try again.";
    } finally { cartBusy = false; renderProducts(); renderCart(); }
  }
  // Populate shared WhatsApp actions after the catalog configuration is loaded.
  document.querySelectorAll("[data-whatsapp-contact]").forEach(link => {
    const number = String(config.whatsappNumber || "").replace(/\D/g, "");
    if (/^\d{8,15}$/.test(number)) { link.href = `https://wa.me/${encodeURIComponent(number)}?text=${encodeURIComponent("Hello, I would like to know more about Medicine Bear Arts.")}`; link.target = "_blank"; link.rel = "noopener noreferrer"; link.removeAttribute("aria-disabled"); }
    else { link.removeAttribute("href"); link.setAttribute("aria-disabled", "true"); }
  });

  // ---------------------------------------------------------------------------
  // Delegated product, cart, and gallery interactions
  // ---------------------------------------------------------------------------
  // Secondary-path events stay provider-neutral. If a consented analytics
  // container exposes dataLayer, it receives the same non-personalized event.
  function trackCampaignLink(target) {
    const destination = target.dataset.campaignLink;
    if (!destination) return;
    const detail = { destination, page_location: window.location.href };
    window.dispatchEvent(new CustomEvent("medicinebear:campaign-interaction", { detail }));
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: "medicinebear_campaign_link_click", ...detail });
  }
  document.addEventListener("change", event => {
    if (!event.target.matches("[data-option-index]")) return;
    const index = Number(event.target.dataset.optionIndex);
    selectedOptions[index] = event.target.value;
    // If the requested value is incompatible with the other selections, pick
    // the closest real variant rather than constructing a nonexistent one.
    const variants = productVariants(currentProduct());
    if (variants.length && !selectedVariant(currentProduct())) {
      const matching = variants.filter(variant => Array.isArray(variant.options) && variant.options[index] === event.target.value);
      matching.sort((a, b) => selectedOptions.reduce((score, value, i) => score + Number(b.options[i] === value) - Number(a.options[i] === value), 0));
      if (matching[0]) selectedOptions = matching[0].options.slice(0, productOptions(currentProduct()).length);
    }
    renderProducts(); featured.querySelector(`[data-option-index="${index}"]`)?.focus();
  });
  document.addEventListener("keydown", event => {
    const summary = event.target.closest(".description-details > summary");
    if (!summary || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    toggleDescription(summary.parentElement);
  });
  document.addEventListener("click", event => {
    const summary = event.target.closest(".description-details > summary");
    if (summary) {
      event.preventDefault();
      toggleDescription(summary.parentElement);
      return;
    }
    const target = event.target.closest("button, a"); if (!target) return;
    if (target.matches('[aria-disabled="true"]')) { event.preventDefault(); return; }
    trackCampaignLink(target);
    if (target.hasAttribute("data-cart-open")) { event.preventDefault(); openCart(); return; }
    if (target.hasAttribute("data-cart-close")) { event.preventDefault(); closeCart(); return; }
    if (target.hasAttribute("data-retry-store")) { event.preventDefault(); loadStore(); return; }
    if (target.hasAttribute("data-refresh-cart")) { event.preventDefault(); runCartOperation(() => commerceClient.getCart()); return; }
    if (target.hasAttribute("data-live-checkout")) {
      event.preventDefault();
      runCartOperation(async () => {
        const fresh = await commerceClient.getCart();
        if (!fresh || !fresh.totalQuantity || !fresh.checkoutUrl) throw new Error("Your cart is empty or has expired. Please refresh your cart.");
        window.location.assign(fresh.checkoutUrl);
        return fresh;
      });
      return;
    }
    if (target.dataset.productLink && bySlug.has(target.dataset.productLink)) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); try { history.pushState({}, "", routeHref(target.dataset.productLink)); } catch (_) { window.location.href = target.href; return; }
      resetSelection(currentProduct()); renderProducts();
      if (lenis) lenis.scrollTo(featured, { duration: 1.15 });
      else featured.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", block: "start" });
      return;
    }
    if (target.dataset.quantity) { const direction = target.dataset.quantity; quantity = Math.max(1, Math.min(99, quantity + (direction === "increase" ? 1 : -1))); renderProducts(); featured.querySelector(`[data-quantity="${direction}"]`)?.focus(); return; }
    if (target.dataset.galleryStep) { const total = mediaFor(currentProduct()).length; if (total) selectedImage = (selectedImage + Number(target.dataset.galleryStep) + total) % total; const step = target.dataset.galleryStep; renderProducts(); featured.querySelector(`[data-gallery-step="${step}"]`)?.focus(); return; }
    if (target.dataset.imageIndex !== undefined) { selectedImage = Number(target.dataset.imageIndex) || 0; renderProducts(); featured.querySelector(`[data-image-index="${selectedImage}"]`)?.focus(); return; }
    if (target.dataset.add && bySlug.has(target.dataset.add)) {
      const product = bySlug.get(target.dataset.add); const variant = selectedVariant(product);
      if (commerceMode === "live") {
        if (!cartNeedsRefresh && product.storefrontReady && variant?.id && variant.available === true) runCartOperation(() => commerceClient.addLine(variant.id, quantity), { open: true });
        return;
      }
      if (commerceMode === "checking") return;
      const key = `${product.slug}::${variant?.id || selectedOptions.join("|") || "default"}`;
      cart[key] = { slug: product.slug, variantId: variant?.id || null, options: selectedOptions.slice(), quantity: Math.min(99, (cart[key]?.quantity || 0) + quantity) }; saveCart(); renderCart(); openCart(); return;
    }
    for (const [attribute, delta] of [["liveIncrease", 1], ["liveDecrease", -1], ["liveRemove", 0]]) {
      const lineId = target.dataset[attribute];
      if (lineId && commerceMode === "live" && !cartNeedsRefresh && !cartBusy) {
        const line = liveCart?.lines.find(item => item.id === lineId);
        if (line) runCartOperation(() => commerceClient.updateLine(lineId, delta ? line.quantity + delta : 0));
        return;
      }
    }
    for (const [attribute, delta] of [["cartIncrease", 1], ["cartDecrease", -1], ["cartRemove", 0]]) {
      const key = target.dataset[attribute]; if (key && cart[key]) { if (!delta || cart[key].quantity + delta <= 0) delete cart[key]; else cart[key].quantity = Math.min(99, cart[key].quantity + delta); saveCart(); renderCart(); const next = Array.from(cartItems.querySelectorAll(`[data-${attribute.replace(/[A-Z]/g, char => "-" + char.toLowerCase())}]`)).find(button => button.dataset[attribute] === key); if (next) next.focus(); else dialog.querySelector("[data-cart-close]")?.focus(); return; }
    }
  });
  window.addEventListener("popstate", () => { resetSelection(currentProduct()); renderProducts(); });
  dialog.addEventListener("close", () => { lenis?.start(); if (lastFocus?.focus) lastFocus.focus(); });

  // ---------------------------------------------------------------------------
  // Review carousel
  // Keep the supplied review text and initials; the owner requested five stars.
  // ---------------------------------------------------------------------------
  const reviews = [
    { text: "Stopped in Naskup on a whim- so glad we did! Great little studio with a variety of Indigenous art. JR was a joy to talk to and I absolutely love my ring I bought. Thanks! We will stop again the next time we are in the area.", author: "Brenda J.", stars: 5 },
    { text: "my childhood friend might as well say family , hes very creative and so is his family his mom does birch bark biting his auntie makes clothes and a cousin has her own make up line", author: "Kelly P.", stars: null },
    { text: "What a wonderful little gallery- clearly run with love and passion. I purchased a lovely birch bark biting piece and I’m very excited to hang it in my home.", author: "Mia N.", stars: null },
    { text: "Beautiful work and lovely shop!", author: "Maureen A.", stars: 5 },
    { text: "I just received my order, they are beautiful! If you or your loved one , are looking for graduation or birthday gifts, or any gift , this is the perfect place to purchase! My delivery was smooth & quick. The small feathers I purchased for my husband for Father’s Day ! You will not be disappointed, I guarantee it! I am addicted to buying from this talented artist. Thanks Jadeon!!! 😃 ❤️", author: "Tanya E.", stars: null }
  ];
  const reviewText = document.querySelector("#testimonial-text");
  const reviewRating = document.querySelector("#testimonial-rating");
  const reviewCounter = document.querySelector("#testimonial-counter");
  const reviewAttribution = document.querySelector("#testimonial-attribution");
  const reviewSlide = reviewText?.closest(".testimonial-slide");
  let reviewIndex = 0, reviewTimer = null, reviewAnimationToken = 0;
  function setReviewContent() {
    if (!reviewText || !reviewRating || !reviewCounter || !reviewAttribution) return;
    const review = reviews[reviewIndex];
    reviewText.textContent = review.text;
    reviewAttribution.textContent = `— ${review.author}`;
    reviewRating.textContent = "★★★★★";
    reviewRating.style.visibility = "visible";
    reviewRating.setAttribute("aria-label", "5 out of 5 stars");
    reviewCounter.textContent = `${String(reviewIndex + 1).padStart(2, "0")} / ${String(reviews.length).padStart(2, "0")}`;
  }
  function showReview(direction = 1, animate = false) {
    if (!reviewText || !reviewRating || !reviewCounter || !reviewAttribution) return;
    if (!animate || reducedMotion.matches || !reviewSlide?.animate) { setReviewContent(); return; }
    const token = ++reviewAnimationToken;
    reviewSlide.getAnimations().forEach(animation => animation.cancel());
    const offset = direction > 0 ? -22 : 22;
    reviewSlide.animate([{ opacity: 1, transform: "translateX(0)" }, { opacity: 0, transform: `translateX(${offset}px)` }], { duration: 170, easing: "cubic-bezier(.4,0,.7,.2)", fill: "forwards" }).finished.then(() => {
      if (token !== reviewAnimationToken) return;
      setReviewContent();
      reviewSlide.animate([{ opacity: 0, transform: `translateX(${-offset}px)` }, { opacity: 1, transform: "translateX(0)" }], { duration: 260, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" });
    }).catch(() => {});
  }
  function scheduleReview() {
    clearInterval(reviewTimer); reviewTimer = null;
    if (!reducedMotion.matches && !document.hidden && reviewText) reviewTimer = setInterval(() => { reviewIndex = (reviewIndex + 1) % reviews.length; showReview(1, true); }, 5000);
  }
  document.querySelector("[data-review-prev]")?.addEventListener("click", () => { reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length; showReview(-1, true); scheduleReview(); });
  document.querySelector("[data-review-next]")?.addEventListener("click", () => { reviewIndex = (reviewIndex + 1) % reviews.length; showReview(1, true); scheduleReview(); });
  document.addEventListener("visibilitychange", scheduleReview);
  reducedMotion.addEventListener("change", scheduleReview);
  document.querySelector("[data-back-to-top]")?.addEventListener("click", event => {
    event.preventDefault();
    if (lenis) lenis.scrollTo(0, { duration: 1.1 });
    else window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  });
  resetSelection(currentProduct()); renderProducts(); renderCart(); showReview(); scheduleReview();
  if (commerceMode === "checking") loadStore();
})();

