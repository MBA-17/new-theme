document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("search-modal");
  const searchInput = document.getElementById("search-input");
  const suggestions = document.getElementById("search-suggestions");
  let lastFocusedElement = null;

  // Focus trap function
  function trapFocus(e) {
    const focusable = modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // Open modal
  document.querySelectorAll("[data-open-search]").forEach(btn =>
    btn.addEventListener("click", () => {
      lastFocusedElement = document.activeElement;
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      searchInput.focus();

      document.addEventListener("keydown", trapFocus);
    })
  );

  // Close modal (all ways)
  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", trapFocus);
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  modal.querySelectorAll("[data-close]").forEach(btn =>
    btn.addEventListener("click", closeModal)
  );

  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("search-modal__overlay")) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // Predictive Search
  let timeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(timeout);
    const query = e.target.value.trim();
    if (query.length < 2) {
      suggestions.innerHTML = "";
      return;
    }

    timeout = setTimeout(() => {
      fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product,collection,article,page`)
        .then(res => res.json())
        .then(data => {
          let html = "";
          ["products","collections","articles"].forEach(type => {
            if (data.resources.results[type].length) {
              html += `<h4>${type}</h4><ul>`;
              data.resources.results[type].forEach(item => {
                html += `
                  <li>
                    <a href="${item.url}">
                      ${item.image ? `<img src="${item.image}" alt="${item.title}" width="40">` : ""}
                      <span>${item.title}</span>
                    </a>
                  </li>`;
              });
              html += "</ul>";
            }
          });
          suggestions.innerHTML = html || "<p>No suggestions found.</p>";
        });
    }, 300);
  });
});
