/* Public Storefront API client. Never place an Admin or private token here. */
(() => {
  "use strict";
  const cartFields = `fragment CartFields on Cart {
    id checkoutUrl totalQuantity
    cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
    lines(first: 50) { nodes { id quantity cost { totalAmount { amount currencyCode } }
      merchandise { ... on ProductVariant { id title selectedOptions { name value } product { handle title } } }
    } pageInfo { hasNextPage } }
  }`;

  function create(settings = {}) {
    const domain = String(settings.storeDomain || "").trim().toLowerCase();
    const version = String(settings.apiVersion || "2026-10");
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain) || !/^\d{4}-(01|04|07|10)$/.test(version)) throw new Error("Shopify Storefront API is not configured.");
    const endpoint = `https://${domain}/api/${version}/graphql.json`;
    const country = settings.country || "CA";
    if (country !== "CA") throw new Error("The storefront requires the Canadian market.");
    const publicToken = String(settings.publicToken || "").trim();
    const key = `medicine-bear-shopify-cart-v1:${domain}`;
    let memoryId = "";
    try { memoryId = localStorage.getItem(key) || ""; } catch (_) { /* Storage may be blocked. */ }
    const saveId = id => { memoryId = id || ""; try { if (memoryId) localStorage.setItem(key, memoryId); else localStorage.removeItem(key); } catch (_) { /* Cart remains available in memory. */ } };

    async function request(query, variables = {}) {
      let response;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", ...(publicToken ? { "X-Shopify-Storefront-Access-Token": publicToken } : {}) }, credentials: "omit", body: JSON.stringify({ query, variables }), signal: controller.signal });
      } catch (_) { throw new Error("Could not reach the store. Check your connection and try again."); }
      finally { clearTimeout(timeout); }
      if (!response.ok) throw new Error(`The store could not process the request (${response.status}).`);
      let body; try { body = await response.json(); } catch (_) { throw new Error("The store returned an unreadable response."); }
      if (Array.isArray(body.errors) && body.errors.length) throw new Error(body.errors.map(error => error.message || "Store request failed").join(" "));
      if (!body.data) throw new Error("The store returned no data.");
      return body.data;
    }
    const assertCAD = money => { if (!money || money.currencyCode !== "CAD" || !Number.isFinite(Number(money.amount))) throw new Error("The store did not return Canadian-dollar pricing. Please contact us."); };
    function normalizeCart(raw, warnings = []) {
      if (!raw) return null;
      if (!raw.id || !raw.lines || !Array.isArray(raw.lines.nodes) || raw.lines.pageInfo?.hasNextPage) throw new Error("The cart could not be displayed completely. Please contact us.");
      assertCAD(raw.cost?.subtotalAmount); assertCAD(raw.cost?.totalAmount);
      const checkout = new URL(raw.checkoutUrl);
      if (checkout.protocol !== "https:") throw new Error("The store returned an invalid checkout link.");
      return { id: raw.id, checkoutUrl: checkout.href, totalQuantity: raw.totalQuantity, subtotal: Number(raw.cost.subtotalAmount.amount), total: Number(raw.cost.totalAmount.amount), currency: "CAD", warnings: warnings.map(item => item.message).filter(Boolean), lines: raw.lines.nodes.map(line => ({ id: line.id, quantity: line.quantity, total: Number(line.cost?.totalAmount?.amount), currency: line.cost?.totalAmount?.currencyCode, merchandise: line.merchandise })) };
    }
    async function readProducts(handles) {
      const unique = [...new Set(handles)];
      if (!unique.length || unique.length > 50 || unique.some(handle => !/^[a-z0-9][a-z0-9-]*$/.test(handle))) throw new Error("Invalid product handles.");
      const results = await Promise.all(unique.map(async handle => {
        const data = await request(`query Product($handle: String!) @inContext(country: CA) { product(handle: $handle) { id handle options { name values } variants(first: 100) { nodes { id title availableForSale selectedOptions { name value } price { amount currencyCode } } pageInfo { hasNextPage } } } }`, { handle });
        const product = data.product;
        if (!product || !product.variants || !Array.isArray(product.variants.nodes) || product.variants.pageInfo?.hasNextPage || !product.variants.nodes.length) return [handle, null];
        const originalOptions = Array.isArray(product.options) ? product.options : [];
        const options = originalOptions.filter(option => !(option.name === "Title" && option.values.length === 1 && option.values[0] === "Default Title"));
        const variants = product.variants.nodes.map(variant => {
          assertCAD(variant.price);
          const selected = new Map(variant.selectedOptions.map(option => [option.name, option.value]));
          return { id: variant.id, title: variant.title, options: options.map(option => selected.get(option.name)), price: Number(variant.price.amount), available: variant.availableForSale };
        });
        return [handle, { id: product.id, options, variants, price: Math.min(...variants.map(variant => variant.price)) }];
      }));
      return Object.fromEntries(results);
    }
    async function getCart() {
      if (!memoryId) return null;
      const data = await request(`query GetCart($id: ID!) @inContext(country: CA) { cart(id: $id) { ...CartFields } } ${cartFields}`, { id: memoryId });
      if (!data.cart) { saveId(""); return null; }
      const cart = normalizeCart(data.cart); saveId(cart.id); return cart;
    }
    async function mutate(operation, query, variables) {
      const data = await request(query, variables);
      const payload = data[operation];
      if (!payload) throw new Error("The store returned no cart response.");
      if (payload.userErrors?.length) {
        const error = new Error(payload.userErrors.map(item => item.message).join(" "));
        if (payload.cart) { try { error.cart = normalizeCart(payload.cart, payload.warnings || []); saveId(error.cart.id); } catch (_) { /* Invalid cart will be reloaded. */ } }
        throw error;
      }
      const cart = normalizeCart(payload.cart, payload.warnings || []);
      if (!cart) throw new Error("Your cart could not be updated. Please try again.");
      saveId(cart.id); return cart;
    }
    async function addLine(variantId, quantity) {
      if (!/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variantId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Please choose a valid product and quantity.");
      const cart = await getCart();
      const prior = cart?.lines.filter(line => line.merchandise?.id === variantId).reduce((total, line) => total + line.quantity, 0) || 0;
      const updated = !cart
        ? await mutate("cartCreate", `mutation Create($input: CartInput!) @inContext(country: CA) { cartCreate(input: $input) { cart { ...CartFields } userErrors { message } warnings { message } } } ${cartFields}`, { input: { buyerIdentity: { countryCode: "CA" }, lines: [{ merchandiseId: variantId, quantity }] } })
        : await mutate("cartLinesAdd", `mutation Add($cartId: ID!, $lines: [CartLineInput!]!) @inContext(country: CA) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } warnings { message } } } ${cartFields}`, { cartId: cart.id, lines: [{ merchandiseId: variantId, quantity }] });
      const actual = updated.lines.filter(line => line.merchandise?.id === variantId).reduce((total, line) => total + line.quantity, 0) - prior;
      if (actual !== quantity) updated.warnings.push(`The store adjusted your request: ${Math.max(0, actual)} of ${quantity} requested items were added. Please review your cart.`);
      return updated;
    }
    async function updateLine(lineId, quantity) {
      if (!memoryId || typeof lineId !== "string" || !lineId || !Number.isInteger(quantity) || quantity < 0 || quantity > 99) throw new Error("The cart could not be updated. Please refresh it.");
      const updated = !quantity
        ? await mutate("cartLinesRemove", `mutation Remove($cartId: ID!, $lineIds: [ID!]!) @inContext(country: CA) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { message } warnings { message } } } ${cartFields}`, { cartId: memoryId, lineIds: [lineId] })
        : await mutate("cartLinesUpdate", `mutation Update($cartId: ID!, $lines: [CartLineUpdateInput!]!) @inContext(country: CA) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } warnings { message } } } ${cartFields}`, { cartId: memoryId, lines: [{ id: lineId, quantity }] });
      const actual = updated.lines.find(line => line.id === lineId)?.quantity || 0;
      if (actual !== quantity) updated.warnings.push(`The store adjusted the quantity from ${quantity} to ${actual}. Please review your cart.`);
      return updated;
    }
    return { readProducts, getCart, addLine, updateLine };
  }
  window.MedicineBearShopify = { create };
})();
