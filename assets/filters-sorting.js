// assets/filters-sorting.js
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector('[id^="FacetFiltersForm-"]');
  if (!form) return;

  const sectionId = form.id.replace("FacetFiltersForm-", "");
  // Prefer full section container (so pagination + grid update). Fallback to grid.
  let container = document.getElementById(`CollectionSection-${sectionId}`);
  const gridId = `CollectionProductGrid-${sectionId}`;
  let grid = document.getElementById(gridId);

  // Sidebar toggle on small screens
  const toggleBtn = form.querySelector(".fs-toggle");
  const panel = form.querySelector(".fs-panels");
  if (toggleBtn && panel) {
    toggleBtn.addEventListener("click", () => {
      const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", (!expanded).toString());
      panel.hidden = expanded;
    });
    panel.hidden = true;
  }

  // Intercept pagination clicks if container exists (will handle later even if not present now)
  function attachPaginationInterceptor() {
    const listenTarget = container || document;
    listenTarget.addEventListener("click", onPaginationClick);
  }

  function onPaginationClick(e) {
    const a = e.target.closest(".pagination a");
    if (!a) return;
    e.preventDefault();
    const href = a.href;
    const parsed = new URL(href, window.location.origin);
    const fetchUrl = `${parsed.pathname}?${parsed.searchParams.toString()}&section_id=${sectionId}`;
    fetchAndReplace(fetchUrl, href);
  }

  // Use change + submit events
  form.addEventListener("change", submitForm);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    submitForm();
  });

  function submitForm() {
    const params = new URLSearchParams();

    // sort_by
    const sortEl = form.querySelector('[name="sort_by"]');
    if (sortEl && sortEl.value) params.set("sort_by", sortEl.value);

    // page_size
    const pageSizeEl = form.querySelector('[name="page_size"]');
    if (pageSizeEl && pageSizeEl.value) params.set("page_size", pageSizeEl.value);

    // Build params from checked checkboxes that include data-filter-url (preferred)
    form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (!cb.checked) return;
      const u = cb.getAttribute('data-filter-url');
      if (u) {
        // parse query params from the provided filter url and append them
        try {
          const parsed = new URL(u, window.location.origin);
          parsed.searchParams.forEach((v, k) => params.append(k, v));
        } catch (err) {
          // fallback: parse substring after '?'
          const q = (u.split('?')[1] || '');
          new URLSearchParams(q).forEach((v, k) => params.append(k, v));
        }
      } else {
        // fallback when data-filter-url isn't present: use name/value
        if (cb.name && cb.value) params.append(cb.name, cb.value);
      }
    });

    // Numeric inputs with data-param-name (price range)
    form.querySelectorAll('input[type="number"][data-param-name]').forEach(inp => {
      const pname = inp.getAttribute('data-param-name') || inp.name;
      const val = inp.value;
      if (val !== '') {
        params.set(pname, val);
      } else {
        // ensure removal: do not set param
      }
    });

    // Reset to page 1 on filter change
    params.set("page", "1");

    const pushUrl = `${window.location.pathname}?${params.toString()}`;
    const fetchUrl = `${window.location.pathname}?${params.toString()}&section_id=${sectionId}`;

    fetchAndReplace(fetchUrl, pushUrl);
  }

  function fetchAndReplace(fetchUrl, pushUrl) {
    fetch(fetchUrl)
      .then(res => res.text())
      .then(html => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        // Prefer replacing whole section container
        const newContainer = doc.getElementById(`CollectionSection-${sectionId}`);
        const newGrid = doc.getElementById(gridId);

        if (newContainer && container) {
          container.replaceWith(newContainer);
          container = document.getElementById(`CollectionSection-${sectionId}`);
        } else if (newContainer && !container) {
          // If we didn't have container before, insert new one
          const beforeEl = document.getElementById(form.id) || document.body;
          beforeEl.insertAdjacentElement('afterend', newContainer);
          container = document.getElementById(`CollectionSection-${sectionId}`);
        } else if (newGrid && grid) {
          grid.replaceWith(newGrid);
          grid = document.getElementById(gridId);
        } else if (newGrid && !grid) {
          const beforeEl = document.getElementById(form.id) || document.body;
          beforeEl.insertAdjacentElement('afterend', newGrid);
          grid = document.getElementById(gridId);
        } else {
          // nothing to replace — fallback to full navigation
          window.location.href = pushUrl;
          return;
        }

        // Re-attach interceptors to new DOM region
        container = document.getElementById(`CollectionSection-${sectionId}`) || container;
        grid = document.getElementById(gridId) || grid;
        // Replace URL (without section param)
        window.history.replaceState({}, "", pushUrl);

        // Focus the grid for screen reader users
        const focusedGrid = document.getElementById(gridId);
        if (focusedGrid) {
          focusedGrid.setAttribute("tabindex", "-1");
          focusedGrid.focus();
        }
      })
      .catch(err => {
        // fallback to hard reload
        window.location.href = pushUrl;
      });
  }

  // initial attach
  attachPaginationInterceptor();
});


/*Filter Drawer*/
document.addEventListener("DOMContentLoaded", function () {
  const drawer = document.querySelector(".fs-drawer");
  const toggle = document.querySelector(".fs-toggle");
  if (!drawer || !toggle) return;

  const closeBtns = drawer.querySelectorAll("[data-drawer-close]");
  const panel = drawer.querySelector(".fs-drawer__panel");

  toggle.addEventListener("click", () => {
    drawer.setAttribute("open", "");
    toggle.setAttribute("aria-expanded", "true");
    panel.focus();
  });

  closeBtns.forEach(btn =>
    btn.addEventListener("click", () => {
      drawer.removeAttribute("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    })
  );

  // Close on Escape
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && drawer.hasAttribute("open")) {
      drawer.removeAttribute("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });
});
