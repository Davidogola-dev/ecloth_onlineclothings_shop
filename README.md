# Ecloths Online Clothing Shop

A responsive clothing storefront for browsing featured looks, managing a cart and wishlist, and entering delivery details at checkout.

## Features

- Browse and search the clothing collection.
- View a continuously scrolling trending collection.
- Add products to a cart, adjust quantities, or remove items.
- Save products to a wishlist.
- Enter required customer and delivery details and choose M-Pesa or cash on delivery payment choice.
- Submit a star-rated review for an eligible completed order.

## Run locally

This is a static website and does not require a package installation or build step.

1. Clone or download the repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` in a browser, or use a local static server such as the VS Code Live Server extension.

Keep the HTML pages, JavaScript, stylesheet, favicon, and `images` folder together so relative asset links work.

## Project files

- `index.html` — storefront, trending section, and product collection.
- `account.html` — cart, wishlist, checkout form, and purchase-review form.
- `styles.css` — layout and responsive styles.
- `script.js` — storefront and account-page interactions.
- `store.js` — browser storage helpers and optional service endpoint configuration.
- `images/` — product and storefront images.
- `favicon.svg` — Ecloths browser icon.

## Checkout and reviews
- this is a demo site and there are no real money or livepay intergration involved

Cart and wishlist data are stored in the visitor's browser using `localStorage`; they are not synced across devices or accounts.
