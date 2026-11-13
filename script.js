(() => {
  const toast = document.querySelector("#toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function initializeStorefront() {
    const productCards = [...document.querySelectorAll(".product-card")];
    const cart = new Map(EclothsStore.read("cart"));
    const wishlist = new Map(EclothsStore.read("wishlist"));

    function saveShoppingLists() {
      EclothsStore.write("cart", [...cart.entries()]);
      EclothsStore.write("wishlist", [...wishlist.entries()]);
      document.querySelector("#cart-count").textContent =
        [...cart.values()].reduce((total, item) => total + item.quantity, 0);
      document.querySelector("#wishlist-count").textContent = wishlist.size;
    }

    saveShoppingLists();

    document.querySelector("#product-search").addEventListener("input", (event) => {
      const query = event.target.value.trim().toLowerCase();
      let visibleProducts = 0;

      productCards.forEach((card) => {
        const matches = card.dataset.name.includes(query);
        card.hidden = !matches;
        if (matches) visibleProducts += 1;
      });

      document.querySelector("#empty-search").hidden = visibleProducts !== 0;
    });

    productCards.forEach((card) => {
      const productName = card.querySelector("h3").textContent;
      const product = {
        id: card.dataset.name,
        name: productName,
        price: Number(card.querySelector(".product-info strong").textContent.replace(/[^0-9.]/g, "")),
        priceLabel: card.querySelector(".product-info strong").textContent,
        image: card.querySelector("img").getAttribute("src"),
        imageAlt: card.querySelector("img").alt
      };
      const addButton = card.querySelector(".add-button");
      const wishlistButton = card.querySelector(".wishlist-button");
      const saved = wishlist.has(product.id);
      wishlistButton.setAttribute("aria-pressed", String(saved));
      wishlistButton.textContent = saved ? "♥" : "♡";
      wishlistButton.setAttribute(
        "aria-label",
        `${saved ? "Remove" : "Add"} ${productName} ${saved ? "from" : "to"} wishlist`
      );

      addButton.addEventListener("click", () => {
        const existing = cart.get(product.id);
        cart.set(product.id, { ...product, quantity: existing ? existing.quantity + 1 : 1 });
        saveShoppingLists();
        showToast(`${productName} added to your bag.`);
      });

      wishlistButton.addEventListener("click", () => {
        const isSaved = wishlistButton.getAttribute("aria-pressed") === "true";
        wishlistButton.setAttribute("aria-pressed", String(!isSaved));
        wishlistButton.textContent = isSaved ? "♡" : "♥";
        wishlistButton.setAttribute(
          "aria-label",
          `${isSaved ? "Add" : "Remove"} ${productName} ${isSaved ? "to" : "from"} wishlist`
        );
        if (isSaved) wishlist.delete(product.id);
        else wishlist.set(product.id, product);
        saveShoppingLists();
        showToast(isSaved ? "Removed from your wishlist." : `${productName} saved to your wishlist.`);
      });
    });
  }

  function initializeAccount() {
    const cart = new Map(EclothsStore.read("cart"));
    const wishlist = new Map(EclothsStore.read("wishlist"));
    const cartItems = document.querySelector("#cart-items");
    const wishlistItems = document.querySelector("#wishlist-items");

    function createProductSummary(item) {
      const summary = document.createElement("div");
      summary.className = "cart-product";
      const title = document.createElement("h3");
      title.textContent = item.name;
      const price = document.createElement("p");
      price.textContent = item.priceLabel;
      summary.append(title, price);
      return summary;
    }

    function addProductImage(row, item) {
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.imageAlt;
      row.append(image);
    }

    function saveShoppingLists() {
      EclothsStore.write("cart", [...cart.entries()]);
      EclothsStore.write("wishlist", [...wishlist.entries()]);
    }

    function renderShoppingSpace() {
      const itemCount = [...cart.values()].reduce((total, item) => total + item.quantity, 0);
      document.querySelector("#cart-count").textContent = itemCount;
      document.querySelector("#wishlist-count").textContent = wishlist.size;
      document.querySelector("#cart-panel-count").textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
      document.querySelector("#wishlist-panel-count").textContent =
        `${wishlist.size} ${wishlist.size === 1 ? "item" : "items"}`;
      document.querySelector("#cart-empty").hidden = cart.size > 0;
      document.querySelector("#wishlist-empty").hidden = wishlist.size > 0;
      cartItems.replaceChildren();
      wishlistItems.replaceChildren();

      cart.forEach((item) => {
        const row = document.createElement("article");
        row.className = "cart-row";
        addProductImage(row, item);
        row.append(createProductSummary(item));

        const quantity = document.createElement("div");
        quantity.className = "quantity-control";
        quantity.setAttribute("aria-label", `Quantity for ${item.name}`);
        const decrease = document.createElement("button");
        decrease.type = "button";
        decrease.textContent = "−";
        decrease.setAttribute("aria-label", "Decrease quantity");
        const amount = document.createElement("span");
        amount.textContent = item.quantity;
        const increase = document.createElement("button");
        increase.type = "button";
        increase.textContent = "+";
        increase.setAttribute("aria-label", "Increase quantity");
        decrease.addEventListener("click", () => {
          if (item.quantity <= 1) cart.delete(item.id);
          else item.quantity -= 1;
          saveShoppingLists();
          renderShoppingSpace();
        });
        increase.addEventListener("click", () => {
          item.quantity += 1;
          saveShoppingLists();
          renderShoppingSpace();
        });
        quantity.append(decrease, amount, increase);
        row.append(quantity);

        const subtotal = document.createElement("strong");
        subtotal.className = "row-total";
        subtotal.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
        row.append(subtotal);
        const remove = document.createElement("button");
        remove.className = "remove-button";
        remove.type = "button";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
          cart.delete(item.id);
          saveShoppingLists();
          renderShoppingSpace();
          showToast(`${item.name} removed from your cart.`);
        });
        row.append(remove);
        cartItems.append(row);
      });

      wishlist.forEach((item) => {
        const row = document.createElement("article");
        row.className = "wishlist-row";
        addProductImage(row, item);
        row.append(createProductSummary(item));
        const addButton = document.createElement("button");
        addButton.className = "wishlist-add-button";
        addButton.type = "button";
        addButton.textContent = "Add to cart";
        addButton.addEventListener("click", () => {
          const existing = cart.get(item.id);
          cart.set(item.id, { ...item, quantity: existing ? existing.quantity + 1 : 1 });
          saveShoppingLists();
          renderShoppingSpace();
          showToast(`${item.name} added to your bag.`);
        });
        row.append(addButton);
        const remove = document.createElement("button");
        remove.className = "remove-button";
        remove.type = "button";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
          wishlist.delete(item.id);
          saveShoppingLists();
          renderShoppingSpace();
        });
        row.append(remove);
        wishlistItems.append(row);
      });

      const total = [...cart.values()].reduce((sum, item) => sum + item.price * item.quantity, 0);
      document.querySelector("#cart-total").textContent = `$${total.toFixed(2)}`;
    }

    document.querySelector("#checkout-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.querySelector("#checkout-message");
      if (cart.size === 0) {
        message.textContent = "Add at least one item to your cart before checkout.";
        return;
      }
      if (!event.currentTarget.reportValidity()) return;
      if (!EclothsApi.orderEndpoint) {
        message.textContent = "Order processing is not connected yet. No order has been placed.";
        return;
      }

      const fields = new FormData(event.currentTarget);
      const paymentMethod = fields.get("paymentMethod");
      const customer = Object.fromEntries(fields.entries());
      delete customer.paymentMethod;
      try {
        const response = await fetch(EclothsApi.orderEndpoint, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer,
            paymentMethod,
            items: [...cart.values()].map((item) => ({ id: item.id, quantity: item.quantity }))
          })
        });
        if (!response.ok) throw new Error(`Order request failed (${response.status}).`);
        const order = await response.json();
        if (!order.id || order.paymentMethod !== paymentMethod) {
          throw new TypeError("Order response must include an id and the selected payment method.");
        }

        if (paymentMethod === "mpesa" && order.status === "paid") {
          message.textContent = `Payment confirmed for order ${order.id}.`;
        } else if (paymentMethod === "mpesa" && order.status === "pending" && order.paymentPromptSent === true) {
          message.textContent = `M-Pesa prompt sent for order ${order.id}. Reviews unlock after payment is confirmed.`;
        } else if (paymentMethod === "cod" && order.status === "pending_delivery") {
          message.textContent = `Order ${order.id} is awaiting delivery. Reviews unlock after delivery is confirmed.`;
        } else {
          message.textContent = "The order is not confirmed yet. No review access has been granted.";
        }
      } catch (error) {
        console.error("Could not submit the Ecloths order.", error);
        message.textContent = "The order could not be submitted. Please try again later.";
      }
    });

    const reviewPanel = document.querySelector("#review-panel");
    const reviewAccessStatus = document.querySelector("#review-access-status");
    const reviewForm = document.querySelector("#review-form");
    const reviewOrderSelect = document.querySelector("#review-order");
    const reviewProductSelect = document.querySelector("#review-product");
    const reviewMessage = document.querySelector("#review-message");
    let eligibleOrders = [];

    function orderIsComplete(order) {
      return Boolean(order && order.id)
        && ((order.paymentMethod === "mpesa" && order.status === "paid")
        || (order.paymentMethod === "cod" && order.status === "delivered"));
    }

    function populateReviewProducts() {
      const order = eligibleOrders.find((eligibleOrder) => eligibleOrder.id === reviewOrderSelect.value);
      reviewProductSelect.replaceChildren(new Option("Choose an item", ""));
      reviewProductSelect.disabled = !order;
      if (!order) return;
      order.items.forEach((item) => {
        reviewProductSelect.add(new Option(item.name, item.id));
      });
    }

    async function loadEligibleOrders() {
      const { reviewEligibilityEndpoint, reviewSubmissionEndpoint } = EclothsApi;
      if (!reviewEligibilityEndpoint || !reviewSubmissionEndpoint) {
        reviewAccessStatus.textContent =
          "Reviews unlock after verified M-Pesa payment or delivery confirmation for cash on delivery. Order verification and email services are not connected yet.";
        return;
      }

      try {
        const response = await fetch(reviewEligibilityEndpoint, { credentials: "same-origin" });
        if (!response.ok) throw new Error(`Review eligibility request failed (${response.status}).`);
        const result = await response.json();
        if (!Array.isArray(result.orders)) throw new TypeError("Review eligibility response must include an orders array.");
        eligibleOrders = result.orders.filter((order) =>
          orderIsComplete(order)
          && Array.isArray(order.items)
          && order.items.length > 0
          && order.items.every((item) => item && item.id && item.name)
        );
        if (eligibleOrders.length === 0) return;

        reviewOrderSelect.replaceChildren(new Option("Choose an order", ""));
        eligibleOrders.forEach((order) => {
          reviewOrderSelect.add(new Option(`Order ${order.id}`, order.id));
        });
        reviewPanel.hidden = false;
        reviewAccessStatus.hidden = true;
      } catch (error) {
        console.error("Could not verify completed Ecloths orders for review access.", error);
        reviewAccessStatus.textContent = "We could not verify completed orders right now. Please try again later.";
      }
    }

    reviewOrderSelect.addEventListener("change", populateReviewProducts);

    reviewForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;

      const fields = new FormData(reviewForm);
      const order = eligibleOrders.find((eligibleOrder) => eligibleOrder.id === fields.get("orderId"));
      const item = order && order.items.find((orderItem) => orderItem.id === fields.get("productId"));
      if (!orderIsComplete(order || {}) || !item) {
        reviewMessage.textContent = "This is a Demo no Intergration for livepay.";
        return;
      }

      try {
        const response = await fetch(EclothsApi.reviewSubmissionEndpoint, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            productId: item.id,
            rating: Number(fields.get("rating")),
            comment: fields.get("comment").trim()
          })
        });
        if (!response.ok) throw new Error(`Review submission failed (${response.status}).`);
        const result = await response.json();
        if (!Array.isArray(result.emailSentTo)
          || !result.emailSentTo.includes("customer")
          || !result.emailSentTo.includes("store")) {
          reviewMessage.textContent = "Email delivery is not active yet. Please try again later.";
          return;
        }
        reviewMessage.textContent = "May you Please provide review for the product. Thank you for your feedback.";
        reviewForm.reset();
        populateReviewProducts();
      } catch (error) {
        console.error("Could not submit and email the Ecloths review.", error);
        reviewMessage.textContent = "Your review could not be submitted. Please try again later.";
      }
    });

    renderShoppingSpace();
    loadEligibleOrders();
  }

  if (document.querySelector("#product-grid")) {
    initializeStorefront();
  }
  if (document.querySelector("#checkout-form")) {
    initializeAccount();
  }
})();
