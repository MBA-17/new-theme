document.addEventListener('DOMContentLoaded', function() {
  // Get all dropdown toggle buttons
  const dropdownToggles = document.querySelectorAll('[data-dropdown-toggle]');
  let currentOpenDropdown = null;
  
  // Function to close all dropdowns
  function closeAllDropdowns() {
    dropdownToggles.forEach(toggle => {
      toggle.setAttribute('aria-expanded', 'false');
      const dropdown = document.getElementById(toggle.getAttribute('aria-controls'));
      if (dropdown) {
        dropdown.setAttribute('aria-hidden', 'true');
        dropdown.classList.remove('open');
      }
    });
    currentOpenDropdown = null;
  }
  
  // Function to open a dropdown
  function openDropdown(toggle) {
    closeAllDropdowns();
    toggle.setAttribute('aria-expanded', 'true');
    const dropdown = document.getElementById(toggle.getAttribute('aria-controls'));
    if (dropdown) {
      dropdown.setAttribute('aria-hidden', 'false');
      dropdown.classList.add('open');
      currentOpenDropdown = toggle;
      
      // Focus the first item for keyboard users
      setTimeout(() => {
        const firstLink = dropdown.querySelector('a');
        if (firstLink) firstLink.focus();
      }, 10);
    }
  }
  
  // Add click event to each dropdown toggle
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        closeAllDropdowns();
      } else {
        openDropdown(this);
      }
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (currentOpenDropdown && 
        !currentOpenDropdown.contains(e.target) && 
        !document.getElementById(currentOpenDropdown.getAttribute('aria-controls')).contains(e.target)) {
      closeAllDropdowns();
    }
  });
  
  // Close dropdowns when pressing ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && currentOpenDropdown) {
      closeAllDropdowns();
      currentOpenDropdown.focus();
    }
  });
  
  // Keyboard navigation within dropdowns
  document.addEventListener('keydown', function(e) {
    if (!currentOpenDropdown) return;
    
    const dropdown = document.getElementById(currentOpenDropdown.getAttribute('aria-controls'));
    if (!dropdown) return;
    
    const focusableElements = dropdown.querySelectorAll('a');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          currentOpenDropdown.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          currentOpenDropdown.focus();
        }
      }
    }
  });
  
  // Close dropdowns when a menu item is clicked
  document.querySelectorAll('.dropdown__link').forEach(link => {
    link.addEventListener('click', function() {
      closeAllDropdowns();
    });
  });
});