# Project roadmap

Current stage: **local frontend foundation**, authorized after Phase 1. Product preparation and integration remain dependent on client inputs. Phase order is a planning guide; dependencies and client approvals govern actual implementation. See [PROJECT_STATUS.md](PROJECT_STATUS.md) for verified progress.

## Phase 1: Planning and documentation — completed

Document requirements, proposed architecture, project constraints, assistant instructions, decisions, and unresolved questions. Confirm the scope and gather approvals for subsequent work. Documentation completion does not imply architecture or integration validation.

## Phase 2: Product preparation — in progress

Select approximately 10–12 products; collect verified names, specifications, variants, approved marketing content, imagery, and rights. Obtain and validate Shopify product and variant mappings and product publication/availability requirements.

## Phase 3: Frontend design — in progress

Review client brand assets and design references; build a responsive landing page with a dynamic product hero, custom imagery, and recommendations. Agree on accessibility, performance, and content expectations before finalizing the design.

## Phase 4: Dynamic functionality — initial foundation in progress

Implement configurable product URLs, featured-product switching, navigation, galleries, variant selection, quantity interactions, and defined invalid-product and error states. Coordinate variant interactions with the actual Shopify data model.

## Phase 5: Shopify integration — in progress

Validate API access and compatibility, connect live commerce data and the custom multi-product cart, implement quantity controls and availability validation, persistence and recovery, and redirect to the official secure Shopify checkout. Test actual store and checkout compatibility. Do not assume synchronization with the existing theme cart.

## Phase 6: Advertising tracking — not started

Audit existing integrations, agree consent and event ownership, then configure and verify Google Ads/GA4, Meta, and TikTok events. Verify attribution and confirmed purchases on the Shopify side and avoid duplicate events. Tracking and production changes need authorization.

## Phase 7: Testing — not started

Test all product URLs and fallback states, variant and cart interactions, changing inventory/prices, checkout with multiple items, mobile layouts, accessibility, performance, consent, and analytics including confirmed test purchases. Record results and resolve defects.

## Phase 8: Deployment — not started

Agree domain, hosting and deployment method; obtain explicit production approval; configure the approved environment and perform launch verification, including checkout and tracking. DNS, store, and production changes are not authorized by this roadmap alone.
