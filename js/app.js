/**
 * Ananda Stores - Single-page app: language toggle, product render, contact links, form UI.
 */

const STORAGE_KEY = 'ananda-lang';

let currentLang = localStorage.getItem(STORAGE_KEY) || 'ta';
let productsData = []; // Will be populated from the API

function getTranslation(key) {
  const t = TRANSLATIONS[currentLang];
  const parts = key.split('.');
  let v = t;
  for (const p of parts) {
    v = v && v[p];
  }
  return v != null ? String(v) : '';
}

function applyTranslations() {
  document.documentElement.lang = currentLang === 'ta' ? 'ta' : 'en';
  document.body.classList.toggle('ta', currentLang === 'ta');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = getTranslation(key);
    if (val) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    const key = el.getAttribute('data-i18n-alt');
    const val = getTranslation(key);
    if (val) el.setAttribute('alt', val);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = getTranslation(key);
    if (val) el.setAttribute('placeholder', val);
  });
  const searchInput = document.getElementById('productSearch');
  if (searchInput) searchInput.placeholder = getTranslation('products.searchPlaceholder') || 'Search products…';
  const noResultsEl = document.getElementById('productsNoResults');
  if (noResultsEl) noResultsEl.textContent = getTranslation('products.noProductsFound') || 'No products found.';

  // Sorting and Filter Labels
  const sortSelect = document.getElementById('productSort');
  if (sortSelect) {
    sortSelect.options[0].textContent = getTranslation('sort.default');
    sortSelect.options[1].textContent = getTranslation('sort.priceLow');
    sortSelect.options[2].textContent = getTranslation('sort.priceHigh');
    sortSelect.options[3].textContent = getTranslation('sort.nameAZ');
  }
  const priceLabel = document.querySelector('.price-filter label span');
  if (priceLabel) priceLabel.textContent = getTranslation('filter.maxPrice');

  const addressEl = document.getElementById('contactAddressDisplay');
  const footerAddress = document.getElementById('footerAddress');
  const addressText = currentLang === 'ta' ? CONFIG.addressTa : CONFIG.addressEn;
  if (addressEl) {
    addressEl.textContent = addressText;
    addressEl.lang = currentLang === 'ta' ? 'ta' : 'en';
  }
  if (footerAddress) footerAddress.textContent = addressText;

  const headerShopName = document.getElementById('headerShopName');
  if (headerShopName) {
    const t = TRANSLATIONS[currentLang];
    headerShopName.textContent = currentLang === 'ta' ? t.shopNameTa : t.shopName;
    headerShopName.lang = currentLang === 'ta' ? 'ta' : 'en';
  }

  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    const t = TRANSLATIONS[currentLang];
    heroTitle.textContent = currentLang === 'ta' ? t.shopNameTa : t.shopName;
    heroTitle.lang = currentLang === 'ta' ? 'ta' : 'en';
  }

  const toggle = document.getElementById('langToggle');
  if (toggle) {
    const label = TRANSLATIONS.en.langToggleLabel;
    const langName = currentLang === 'en' ? 'தமிழ்' : 'English';
    toggle.innerHTML = `<span class="lang-toggle__current">${langName}</span><span class="lang-toggle__hint">${label}</span>`;
  }
}

async function fetchProducts() {
  try {
    const response = await fetch(`${window.location.protocol}//${window.location.hostname}:3000/api/products`);
    if (!response.ok) throw new Error('Network response was not ok');
    productsData = await response.json();
    renderProducts(null);
  } catch (error) {
    console.error('Fetch error:', error);
    // Fallback to local PRODUCTS if available or show error
    productsData = [];
    renderProducts(null);
  }
}

function filterProductsBySearch(query) {
  const currentList = productsData;
  if (!query || !query.trim()) return currentList;
  const q = query.trim().toLowerCase();
  return currentList.filter((p) => {
    const nameEn = (p.nameEn || '').toLowerCase();
    const nameTa = (p.nameTa || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const weight = (p.weight || '').toLowerCase();
    const category = (p.category || '').toLowerCase();
    return nameEn.includes(q) || nameTa.includes(q) || brand.includes(q) || weight.includes(q) || category.includes(q);
  });
}

function renderProducts(productList) {
  const container = document.getElementById('productsContainer');
  const noResultsEl = document.getElementById('productsNoResults');
  if (!container) return;

  const t = TRANSLATIONS[currentLang];
  const list = productList != null ? productList : productsData;
  const priceLabel = t.products?.priceLabel || 'Price';
  
  // Apply Search, Sort, and Price Filter
  const query = document.getElementById('productSearch')?.value?.toLowerCase() || '';
  const maxPrice = parseFloat(document.getElementById('priceRange')?.value) || Infinity;
  const sortBy = document.getElementById('productSort')?.value || 'default';

  let filtered = list.filter(p => {
    const nameStr = (currentLang === 'ta' ? (p.nameTa || '') : (p.nameEn || '')).toLowerCase();
    const queryMatches = nameStr.includes(query) || (p.brand || '').toLowerCase().includes(query);
    const itemPrice = parseFloat(p.price) || 0;
    const priceMatches = isNaN(parseFloat(p.price)) ? true : (itemPrice <= maxPrice);
    return queryMatches && priceMatches;
  });

  if (sortBy === 'price-low') filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  else if (sortBy === 'price-high') filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  else if (sortBy === 'name-az') filtered.sort((a, b) => {
    const nameA = (currentLang === 'ta' ? a.nameTa : a.nameEn).toLowerCase();
    const nameB = (currentLang === 'ta' ? b.nameTa : b.nameEn).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const categories = {};
  filtered.forEach((p) => {
    if (!categories[p.category]) categories[p.category] = [];
    categories[p.category].push(p);
  });

  const catOrder = Object.keys(categories).sort();

  const CAT_MAP = {
    'sugar': t.products?.categorySugar || 'Sugar',
    'flours': t.products?.categoryFlours || 'Flours',
    'dhalls': t.products?.categoryDhalls || 'Dhalls',
    'oils': t.products?.categoryOils || 'Oils',
    'rice': t.products?.categoryRice || 'Rice',
    'spices': t.products?.categorySpices || 'Spices',
    'other': t.products?.categoryOther || 'Other'
  };

  const getCatTitle = (c) => {
    const key = (c || '').toLowerCase();
    return CAT_MAP[key] || c || 'Other';
  };

  if (noResultsEl) noResultsEl.classList.toggle('products__no-results--visible', filtered.length === 0);

  const placeholderImg = 'https://placehold.co/200x200/e8f0f6/1e5a8e?text=Product';
  container.innerHTML = catOrder
    .map(
      (cat) => {
        const title = getCatTitle(cat);
        return `
    <div class="product-category">
      <h3 class="product-category__title">${title}</h3>
      <ul class="product-category__list">
        ${categories[cat]
          .map(
            (p) => {
              const name = currentLang === 'ta' ? p.nameTa : p.nameEn;
              const label = [p.brand, name, p.weight].filter(Boolean).join(' · ');
              const price = p.price != null ? p.price : 'xxx.xx';
              const imageUrl = p.image || 'https://placehold.co/400x400?text=No+Image';
              return `
          <li class="product-category__item product-card">
            <div class="product-card__image-container">
              <img src="${imageUrl}" alt="${label}" class="product-card__image" loading="lazy">
            </div>
            <div class="product-card__content">
              <div class="product-card__header">
                <span class="product-card__category">${getCatTitle(p.category)}</span>
                ${p.brand ? `<span class="product-card__brand">${p.brand}</span>` : ''}
              </div>
              <h3 class="product-card__name">${name}</h3>
              <div class="product-card__footer">
                <span class="product-card__weight">${p.weight}</span>
                <span class="product-card__price">${priceLabel}: ₹${price}</span>
              </div>
            </div>
          </li>`;
            }
          )
          .join('')}
      </ul>
    </div>`;
      }
    )
    .join('');
}

function setContactLinks() {
  const tel = CONFIG.phoneTel;
  const telHref = `tel:${tel}`;
  const wa = CONFIG.whatsappNumber;
  const waText = encodeURIComponent(currentLang === 'ta' ? 'வணக்கம், உங்கள் பொருட்கள் பற்றி தகவல் விரும்புகிறேன்.' : 'Hi, I would like to know about your products.');
  const waHref = `https://wa.me/${wa}?text=${waText}`;

  [document.getElementById('contactPhone'), document.getElementById('footerPhone')].forEach((el) => {
    if (el) el.href = telHref;
  });
  [document.getElementById('contactWhatsapp')].forEach((el) => {
    if (el) el.href = waHref;
  });

  const mapEl = document.getElementById('contactMap');
  if (mapEl) mapEl.src = CONFIG.mapEmbedUrl;
}

function initFilters() {
  const search = document.getElementById('productSearch');
  const sort = document.getElementById('productSort');
  const price = document.getElementById('priceRange');
  const priceVal = document.getElementById('priceValue');

  if (search) search.addEventListener('input', () => renderProducts());
  if (sort) sort.addEventListener('change', () => renderProducts());
  if (price) {
    price.addEventListener('input', () => {
      priceVal.textContent = price.value;
      renderProducts();
    });
  }
}

function initLanguageToggle() {
  document.getElementById('langToggle')?.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ta' : 'en';
    localStorage.setItem(STORAGE_KEY, currentLang);
    applyTranslations();
    const searchInput = document.getElementById('productSearch');
    const list = searchInput?.value?.trim() ? filterProductsBySearch(searchInput.value) : null;
    renderProducts(list);
    setContactLinks();
  });
}

const API_URL = 'https://ananda-stores-production.up.railway.app/api';

function initContactForm() {
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');
  if (!form || !feedback) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const name = form.name?.value?.trim();
    const email = form.email?.value?.trim();
    const message = form.message?.value?.trim();

    if (!name || !email || !message) {
      feedback.textContent = 'Please fill out all fields.';
      feedback.style.color = 'red';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    feedback.textContent = '';
    feedback.style.color = '';

    try {
      const resp = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (resp.ok) {
        feedback.textContent = 'Message sent successfully! We will get back to you soon.';
        feedback.style.color = '#27ae60';
        form.reset();
      } else {
        const err = await resp.json();
        feedback.textContent = `Error: ${err.error || 'Failed to send message.'}`;
        feedback.style.color = 'red';
      }
    } catch (err) {
      feedback.textContent = 'Connection error. Please try again later.';
      feedback.style.color = 'red';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
    }
  });
}

async function init() {
  setContactLinks();
  applyTranslations();
  await fetchProducts();
  initFilters();
  initLanguageToggle();
  initContactForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
