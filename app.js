// Browser version of the original Java Swing Inventory Management System.
// Original Java source: https://github.com/Riska997/InventoryManagementSystem
(() => {
  "use strict";

  const STORAGE_KEY = "inventory-management-demo-v1";
  const elements = {
    form: document.getElementById("inventoryForm"),
    name: document.getElementById("itemName"),
    id: document.getElementById("itemId"),
    quantity: document.getElementById("quantity"),
    price: document.getElementById("price"),
    error: document.getElementById("formError"),
    title: document.getElementById("formTitle"),
    subtitle: document.getElementById("formSubtitle"),
    submit: document.getElementById("submitButton"),
    clear: document.getElementById("clearButton"),
    tbody: document.getElementById("inventoryTable"),
    empty: document.getElementById("emptyMessage"),
    count: document.getElementById("recordCount"),
    totalItems: document.getElementById("totalItems"),
    totalQuantity: document.getElementById("totalQuantity"),
    totalValue: document.getElementById("totalValue"),
    message: document.getElementById("message")
  };

  const rand = new Intl.NumberFormat("en-ZA");
  const money = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" });
  let inventory = readSavedItems();
  let editingOriginalId = null;
  let toastTimer;

  function readSavedItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const records = JSON.parse(raw);
      if (!Array.isArray(records)) return [];
      return records.filter(item =>
        item && typeof item.id === "string" && typeof item.name === "string" &&
        Number.isSafeInteger(item.quantity) && item.quantity >= 0 &&
        Number.isFinite(item.price) && item.price >= 0
      );
    } catch {
      return [];
    }
  }

  function saveItems() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    } catch {
      notify("Storage is unavailable; changes will be lost when the page reloads.");
    }
  }

  function notify(message) {
    elements.message.textContent = message;
    elements.message.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { elements.message.hidden = true; }, 3200);
  }

  function clearForm() {
    editingOriginalId = null;
    elements.form.reset();
    elements.error.textContent = "";
    elements.title.textContent = "Add inventory item";
    elements.subtitle.textContent = "Enter item details below.";
    elements.submit.textContent = "Add";
  }

  function makeCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
  }

  function refreshTable() {
    elements.tbody.replaceChildren();
    for (const item of inventory) {
      const row = document.createElement("tr");
      makeCell(row, item.id);
      makeCell(row, item.name);
      makeCell(row, rand.format(item.quantity));
      makeCell(row, money.format(item.price));

      const actions = document.createElement("td");
      const wrap = document.createElement("div");
      wrap.className = "row-actions";
      for (const [label, action] of [["Update", "edit"], ["Delete", "delete"]]) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "action" + (action === "delete" ? " delete" : "");
        button.textContent = label;
        button.dataset.action = action;
        button.dataset.id = item.id;
        button.setAttribute("aria-label", label + " " + item.name);
        wrap.appendChild(button);
      }
      actions.appendChild(wrap);
      row.appendChild(actions);
      elements.tbody.appendChild(row);
    }
    elements.empty.hidden = inventory.length > 0;
    elements.count.textContent = inventory.length + (inventory.length === 1 ? " record" : " records");
    elements.totalItems.textContent = rand.format(inventory.length);
    elements.totalQuantity.textContent = rand.format(inventory.reduce((sum, item) => sum + item.quantity, 0));
    elements.totalValue.textContent = money.format(inventory.reduce((sum, item) => sum + item.quantity * item.price, 0));
  }

  function validate() {
    const name = elements.name.value.trim();
    const id = elements.id.value.trim();
    const quantityText = elements.quantity.value.trim();
    const priceText = elements.price.value.trim();
    const quantity = Number(quantityText);
    const price = Number(priceText);

    if (!name || !id) return { error: "Please enter both an item name and item ID." };
    if (!quantityText || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 999999999) {
      return { error: "Quantity must be a whole number of 0 or more." };
    }
    if (!priceText || !Number.isFinite(price) || price < 0 || price > 999999999 || !/^\d+(\.\d{1,2})?$/.test(priceText)) {
      return { error: "Price must be a non-negative number with at most two decimal places." };
    }
    if (inventory.some(item => item.id.toLowerCase() === id.toLowerCase() && item.id !== editingOriginalId)) {
      return { error: "An item with this ID already exists." };
    }
    return { item: { id, name, quantity, price } };
  }

  elements.form.addEventListener("submit", event => {
    event.preventDefault();
    const result = validate();
    if (result.error) {
      elements.error.textContent = result.error;
      return;
    }
    elements.error.textContent = "";

    if (editingOriginalId === null) {
      inventory.push(result.item);
      notify("Item added successfully.");
    } else {
      const index = inventory.findIndex(item => item.id === editingOriginalId);
      if (index < 0) {
        clearForm();
        notify("The item you were editing no longer exists.");
        return;
      }
      inventory[index] = result.item;
      notify("Item updated successfully.");
    }
    saveItems();
    refreshTable();
    clearForm();
  });

  elements.tbody.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const item = inventory.find(record => record.id === button.dataset.id);
    if (!item) return;

    if (button.dataset.action === "edit") {
      editingOriginalId = item.id;
      elements.name.value = item.name;
      elements.id.value = item.id;
      elements.quantity.value = item.quantity;
      elements.price.value = item.price;
      elements.title.textContent = "Update inventory item";
      elements.subtitle.textContent = "Edit the selected item, then click Update.";
      elements.submit.textContent = "Update";
      elements.error.textContent = "";
      elements.name.focus();
    }

    if (button.dataset.action === "delete") {
      if (!window.confirm('Delete "' + item.name + '" from inventory?')) return;
      inventory = inventory.filter(record => record !== item);
      if (editingOriginalId === item.id) clearForm();
      saveItems();
      refreshTable();
      notify("Item deleted successfully.");
    }
  });

  elements.clear.addEventListener("click", clearForm);
  refreshTable();
})();
