const API_BASE = "/api/products";
const PAGE_SIZE = 6;

const productForm = document.getElementById("productForm");
const tableBody = document.getElementById("productTableBody");
const statusMessage = document.getElementById("statusMessage");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const categoryChips = document.getElementById("categoryChips");
const statusChips = document.getElementById("statusChips");
const pagination = document.getElementById("pagination");
const toastStack = document.getElementById("toastStack");

const editDialog = document.getElementById("editDialog");
const editForm = document.getElementById("editForm");
const cancelEdit = document.getElementById("cancelEdit");

let allProducts = [];

const uiState = {
  searchTerm: "",
  category: "All",
  status: "All",
  sort: "newest",
  page: 1,
  isLoading: false
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const setStatus = (message, isError = false) => {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b42318" : "#3d3d3d";
};

const showToast = (message, type = "info") => {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastStack.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(6px)";
    setTimeout(() => toast.remove(), 180);
  }, 2800);
};

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
};

const readCreateFormPayload = (form) => {
  const data = new FormData(form);
  return {
    productName: data.get("productName")?.trim(),
    productCode: data.get("productCode")?.trim(),
    category: data.get("category"),
    supplierName: data.get("supplierName")?.trim() || "",
    quantityInStock: Number(data.get("quantityInStock") || 0),
    reorderLevel: Number(data.get("reorderLevel") || 0),
    unitPrice: Number(data.get("unitPrice") || 0),
    manufactureDate: data.get("manufactureDate") || null,
    productType: data.get("productType"),
    status: data.get("status")
  };
};

const readEditFormPayload = (form) => {
  const data = new FormData(form);
  return {
    productName: data.get("productName")?.trim(),
    category: data.get("category"),
    quantityInStock: Number(data.get("quantityInStock") || 0),
    unitPrice: Number(data.get("unitPrice") || 0),
    status: data.get("status")
  };
};

const drawSkeletonRows = (rows = PAGE_SIZE) => {
  tableBody.innerHTML = Array.from({ length: rows }, () => {
    return `
      <tr>
        <td><div class="skeleton medium"></div></td>
        <td><div class="skeleton short"></div></td>
        <td><div class="skeleton short"></div></td>
        <td><div class="skeleton short"></div></td>
        <td><div class="skeleton short"></div></td>
        <td><div class="skeleton short"></div></td>
        <td><div class="skeleton long"></div></td>
      </tr>`;
  }).join("");
};

const drawProducts = (items) => {
  if (!items.length) {
    tableBody.innerHTML =
      "<tr><td colspan='7'>No products found for this filter combination.</td></tr>";
    return;
  }

  tableBody.innerHTML = items
    .map(
      (product) => `
      <tr>
        <td>${escapeHtml(product.productName || "-")}</td>
        <td>${escapeHtml(product.productCode || "-")}</td>
        <td>${escapeHtml(product.category || "-")}</td>
        <td>${product.quantityInStock ?? 0}</td>
        <td>${formatMoney(product.unitPrice)}</td>
        <td>${escapeHtml(product.status || "-")}</td>
        <td>
          <div class="actions">
            <button class="btn btn-ghost" data-action="edit" data-id="${product._id}">Edit</button>
            <button class="btn btn-danger" data-action="delete" data-id="${product._id}">Delete</button>
          </div>
        </td>
      </tr>
      `
    )
    .join("");
};

const buildChipButton = (value, selectedValue, type) => {
  const activeClass = value === selectedValue ? "active" : "";
  return `<button class="chip ${activeClass}" type="button" data-chip="${type}" data-value="${escapeHtml(
    value
  )}">${escapeHtml(value)}</button>`;
};

const renderChips = () => {
  const categories = [
    "All",
    ...new Set(allProducts.map((product) => product.category).filter(Boolean))
  ];
  const statuses = [
    "All",
    ...new Set(allProducts.map((product) => product.status).filter(Boolean))
  ];

  categoryChips.innerHTML = categories
    .map((value) => buildChipButton(value, uiState.category, "category"))
    .join("");

  statusChips.innerHTML = statuses
    .map((value) => buildChipButton(value, uiState.status, "status"))
    .join("");
};

const filterProducts = (items) => {
  return items.filter((product) => {
    const haystack = `${product.productName} ${product.productCode} ${product.category}`.toLowerCase();
    const searchMatch = haystack.includes(uiState.searchTerm);
    const categoryMatch = uiState.category === "All" || product.category === uiState.category;
    const statusMatch = uiState.status === "All" || product.status === uiState.status;
    return searchMatch && categoryMatch && statusMatch;
  });
};

const sortProducts = (items) => {
  const sorted = [...items];

  switch (uiState.sort) {
    case "oldest":
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case "name-asc":
      sorted.sort((a, b) => (a.productName || "").localeCompare(b.productName || ""));
      break;
    case "name-desc":
      sorted.sort((a, b) => (b.productName || "").localeCompare(a.productName || ""));
      break;
    case "price-asc":
      sorted.sort((a, b) => Number(a.unitPrice || 0) - Number(b.unitPrice || 0));
      break;
    case "price-desc":
      sorted.sort((a, b) => Number(b.unitPrice || 0) - Number(a.unitPrice || 0));
      break;
    case "stock-asc":
      sorted.sort((a, b) => Number(a.quantityInStock || 0) - Number(b.quantityInStock || 0));
      break;
    case "stock-desc":
      sorted.sort((a, b) => Number(b.quantityInStock || 0) - Number(a.quantityInStock || 0));
      break;
    case "newest":
    default:
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  return sorted;
};

const clampPage = (nextPage, totalPages) => {
  if (nextPage < 1) return 1;
  if (nextPage > totalPages) return totalPages;
  return nextPage;
};

const renderPagination = (totalItems) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  uiState.page = clampPage(uiState.page, totalPages);

  const start = (uiState.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(uiState.page * PAGE_SIZE, totalItems);
  const rangeText = totalItems
    ? `Showing ${start}-${end} of ${totalItems}`
    : "Showing 0 of 0";

  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const activeClass = page === uiState.page ? "active" : "";
    return `<button class="page-btn ${activeClass}" type="button" data-page="${page}">${page}</button>`;
  }).join("");

  pagination.innerHTML = `
    <p class="pagination-info">${rangeText}</p>
    <div class="pagination-controls">
      <button class="page-btn" type="button" data-page="${uiState.page - 1}" ${
        uiState.page === 1 ? "disabled" : ""
      }>Prev</button>
      ${pageButtons}
      <button class="page-btn" type="button" data-page="${uiState.page + 1}" ${
        uiState.page === totalPages ? "disabled" : ""
      }>Next</button>
    </div>
  `;
};

const renderView = () => {
  const filtered = filterProducts(allProducts);
  const sorted = sortProducts(filtered);
  const totalItems = sorted.length;

  renderPagination(totalItems);

  const startIndex = (uiState.page - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(startIndex, startIndex + PAGE_SIZE);

  drawProducts(pageItems);
  setStatus(`Loaded ${allProducts.length} total product(s). ${totalItems} match current filters.`);
};

const fetchProducts = async () => {
  uiState.isLoading = true;
  drawSkeletonRows();
  setStatus("Loading products...");

  try {
    const response = await fetch(API_BASE);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch products");
    }

    allProducts = result.data || [];
    renderChips();
    renderView();
  } catch (error) {
    setStatus(error.message, true);
    showToast(error.message, "error");
    tableBody.innerHTML = "<tr><td colspan='7'>Unable to load products.</td></tr>";
  } finally {
    uiState.isLoading = false;
  }
};

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = readCreateFormPayload(productForm);

  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || "Failed to create product");
    }

    productForm.reset();
    showToast("Product created successfully.", "success");
    uiState.page = 1;
    fetchProducts();
  } catch (error) {
    setStatus(error.message, true);
    showToast(error.message, "error");
  }
});

refreshBtn.addEventListener("click", () => {
  showToast("Refreshing products...", "info");
  fetchProducts();
});

searchInput.addEventListener("input", () => {
  uiState.searchTerm = searchInput.value.trim().toLowerCase();
  uiState.page = 1;
  renderView();
});

sortSelect.addEventListener("change", () => {
  uiState.sort = sortSelect.value;
  uiState.page = 1;
  renderView();
});

const handleChipClick = (event) => {
  const chipButton = event.target.closest("button[data-chip]");
  if (!chipButton) return;

  const chipType = chipButton.dataset.chip;
  const value = chipButton.dataset.value;

  if (chipType === "category") {
    uiState.category = value;
  }

  if (chipType === "status") {
    uiState.status = value;
  }

  uiState.page = 1;
  renderChips();
  renderView();
};

categoryChips.addEventListener("click", handleChipClick);
statusChips.addEventListener("click", handleChipClick);

pagination.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-page]");
  if (!button) return;

  uiState.page = Number(button.dataset.page || 1);
  renderView();
});

tableBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  const product = allProducts.find((item) => item._id === id);

  if (action === "edit" && product) {
    editForm.elements.id.value = product._id;
    editForm.elements.productName.value = product.productName || "";
    editForm.elements.category.value = product.category || "Other";
    editForm.elements.quantityInStock.value = product.quantityInStock ?? 0;
    editForm.elements.unitPrice.value = product.unitPrice ?? 0;
    editForm.elements.status.value = product.status || "Available";

    editDialog.showModal();
  }

  if (action === "delete" && id) {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete product");
      }

      showToast("Product deleted successfully.", "success");
      fetchProducts();
    } catch (error) {
      setStatus(error.message, true);
      showToast(error.message, "error");
    }
  }
});

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = editForm.elements.id.value;
  const payload = readEditFormPayload(editForm);

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || "Failed to update product");
    }

    editDialog.close();
    showToast("Product updated successfully.", "success");
    fetchProducts();
  } catch (error) {
    setStatus(error.message, true);
    showToast(error.message, "error");
  }
});

cancelEdit.addEventListener("click", () => {
  editDialog.close();
});

fetchProducts();
