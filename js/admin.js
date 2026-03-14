const API_URL = 'https://ananda-stores-production.up.railway.app/api';
// const API_URL = '/api'; // Use this if serving frontend and backend from same port in production

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('adminToken');
  const userRole = localStorage.getItem('adminRole');
  const userName = localStorage.getItem('adminName');
  
  if (token) {
    showDashboard(userRole, userName);
  }

  // --- Auth ---
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorEl = document.getElementById('loginError');

    try {
      const resp = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (resp.ok) {
        const data = await resp.json();
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminRole', data.role);
        localStorage.setItem('adminName', data.username);
        showDashboard(data.role, data.username);
      } else {
        errorEl.style.display = 'block';
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.reload();
  });

  // --- CRUD Functions ---
  async function loadProducts(role) {
    const resp = await fetch(`${API_URL}/products`);
    const products = await resp.json();
    updateAnalytics(products);
    const listBody = document.getElementById('adminProductList');
    listBody.innerHTML = products.map(p => `
      <tr class="${p.stock < 5 ? 'low-stock' : ''}">
        <td>${p.category}</td>
        <td>${p.nameEn}</td>
        <td>${p.brand || '-'}</td>
        <td>${p.weight || '-'}</td>
        <td>${p.price}</td>
        <td>${p.stock}</td>
        <td>${p.image ? `<a href="${p.image}" target="_blank">View</a>` : '-'}</td>
        <td>
          <button class="btn-edit" onclick="editProduct('${p.id}')">Edit</button>
          ${role === 'super_admin' ? `<button class="btn-delete" onclick="deleteProduct('${p.id}')">Delete</button>` : ''}
        </td>
      </tr>
    `).join('');
  }

  function updateAnalytics(products) {
    const totalProducts = products.length;
    const totalValue = products.reduce((acc, p) => acc + (parseFloat(p.price) || 0) * (parseInt(p.stock) || 0), 0);
    const categories = new Set(products.map(p => p.category)).size;

    document.getElementById('statTotalProducts').textContent = totalProducts;
    document.getElementById('statTotalValue').textContent = `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById('statTotalCategories').textContent = categories;
  }

  window.deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('adminRole');
    
    if (!token) {
      alert('Your session has expired. Please log in again.');
      window.location.reload();
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (resp.status === 403 || resp.status === 401) {
        alert('Permission Denied: Your session expired or you are not a Super Admin.');
        if (resp.status === 401) {
          localStorage.clear();
          window.location.reload();
        }
        return;
      }

      if (resp.ok) {
        loadProducts(role);
      } else {
        const errData = await resp.json();
        alert(`Failed to delete: ${errData.error || resp.statusText}`);
      }
    } catch (err) {
      alert('Failed to connect to the server to delete the product.');
    }
  };

  window.editProduct = async (id) => {
    const resp = await fetch(`${API_URL}/products`);
    const products = await resp.json();
    const p = products.find(x => x.id === id);
    if (!p) return;

    document.getElementById('editId').value = p.id;
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodNameEn').value = p.nameEn;
    document.getElementById('prodNameTa').value = p.nameTa;
    document.getElementById('prodBrand').value = p.brand;
    document.getElementById('prodWeight').value = p.weight;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodStock').value = p.stock || 0;
    
    document.getElementById('newCategoryInput').style.display = 'none';
    document.getElementById('currentImageInfo').textContent = p.image ? `Current: ${p.image.split('/').pop()}` : 'No image uploaded';
    document.getElementById('imagePreview').style.display = 'none';

    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productFormModal').style.display = 'flex';
  };

  // --- Category Logic ---
  async function loadCategories() {
    const resp = await fetch(`${API_URL}/categories`);
    const cats = await resp.json();
    const select = document.getElementById('prodCategory');
    const currentVal = select.value;
    
    select.innerHTML = '<option value="">Select Category</option>' + 
      cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('') +
      '<option value="NEW_CATEGORY">+ Add New Category</option>';
    
    if (currentVal) select.value = currentVal;
  }

  document.getElementById('prodCategory').addEventListener('change', (e) => {
    const input = document.getElementById('newCategoryInput');
    if (e.target.value === 'NEW_CATEGORY') {
      input.style.display = 'block';
      input.required = true;
    } else {
      input.style.display = 'none';
      input.required = false;
    }
  });

  // --- User Management ---
  async function loadUsers() {
    const token = localStorage.getItem('adminToken');
    const resp = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!resp.ok) return;
    const users = await resp.json();
    const listBody = document.getElementById('adminUserList');
    listBody.innerHTML = users.map(u => `
      <tr>
        <td>${u.username} ${u.username === localStorage.getItem('adminName') ? '(You)' : ''}</td>
        <td>${u.role}</td>
        <td>
          ${u.username !== localStorage.getItem('adminName') ? `<button class="btn-delete" onclick="deleteUser('${u.username}')">Delete</button>` : '-'}
        </td>
      </tr>
    `).join('');
  }

  window.deleteUser = async (username) => {
    if (!confirm(`Are you sure you want to delete admin "${username}"?`)) return;
    const token = localStorage.getItem('adminToken');
    const resp = await fetch(`${API_URL}/users/${username}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (resp.ok) loadUsers();
    else {
      const err = await resp.json();
      alert(`Error: ${err.error || 'Failed to delete'}`);
    }
  };

  document.getElementById('manageUsersBtn').addEventListener('click', () => {
    const prodSec = document.getElementById('productsSection');
    const userSec = document.getElementById('usersSection');
    const btn = document.getElementById('manageUsersBtn');
    
    if (userSec.style.display === 'none') {
      userSec.style.display = 'block';
      prodSec.style.display = 'none';
      loadUsers();
      btn.textContent = 'Show Products';
    } else {
      userSec.style.display = 'none';
      prodSec.style.display = 'block';
      btn.textContent = 'Manage Admins';
    }
  });

  document.getElementById('addNewAdminBtn').addEventListener('click', () => {
    document.getElementById('userFormModal').style.display = 'flex';
  });

  document.getElementById('cancelUserForm').addEventListener('click', () => {
    document.getElementById('userFormModal').style.display = 'none';
  });

  function showError(id, msg) {
    const el = document.getElementById(`err-${id}`);
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
    const input = document.getElementById(id);
    if (input) input.parentElement.classList.add('has-error');
  }

  function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.form-group').forEach(el => el.classList.remove('has-error'));
  }

  document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    
    let isValid = true;
    if (!username) { showError('newUsername', 'Username is required'); isValid = false; }
    if (password.length < 6) { showError('newPassword', 'Password must be at least 6 characters'); isValid = false; }
    if (!role) { showError('newRole', 'Role is required'); isValid = false; }
    
    if (!isValid) return;

    const token = localStorage.getItem('adminToken');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    const data = { username, password, role };

    try {
      const resp = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });

      if (resp.ok) {
        document.getElementById('userFormModal').style.display = 'none';
        document.getElementById('userForm').reset();
        loadUsers();
      } else {
        const err = await resp.json();
        alert(`Error: ${err.error || 'Failed to create user'}`);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create User';
    }
  });

  // --- Modals ---
  document.getElementById('addProductBtn').addEventListener('click', () => {
    clearErrors();
    document.getElementById('productForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('newCategoryInput').style.display = 'none';
    document.getElementById('currentImageInfo').textContent = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productFormModal').style.display = 'flex';
  });

  // Image Preview Logic
  document.getElementById('prodImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      }
      reader.readAsDataURL(file);
    } else {
      preview.style.display = 'none';
    }
  });

  document.getElementById('cancelForm').addEventListener('click', () => {
    document.getElementById('productFormModal').style.display = 'none';
  });

  document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const editId = document.getElementById('editId').value;
    let category = document.getElementById('prodCategory').value;
    const newCategory = document.getElementById('newCategoryInput').value.trim();
    const nameEn = document.getElementById('prodNameEn').value.trim();
    const nameTa = document.getElementById('prodNameTa').value.trim();
    const weight = document.getElementById('prodWeight').value.trim();
    const price = document.getElementById('prodPrice').value.trim();
    const stock = document.getElementById('prodStock').value.trim();
    const imgFile = document.getElementById('prodImage').files[0];

    if (category === 'NEW_CATEGORY') {
      category = newCategory;
    }

    let isValid = true;
    if (!category) { showError('prodCategory', 'Category is required'); isValid = false; }
    if (!nameEn) { showError('prodNameEn', 'English name is required'); isValid = false; }
    if (!nameTa) { showError('prodNameTa', 'Tamil name is required'); isValid = false; }
    if (!weight) { showError('prodWeight', 'Weight/Quantity is required'); isValid = false; }
    if (!price || isNaN(price)) { showError('prodPrice', 'Please enter a valid numeric price'); isValid = false; }
    if (stock === '' || isNaN(stock)) { showError('prodStock', 'Valid stock number is required'); isValid = false; }

    if (!isValid) return;

    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('adminRole');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    const formData = new FormData();
    formData.append('category', category);
    formData.append('nameEn', nameEn);
    formData.append('nameTa', nameTa);
    formData.append('brand', document.getElementById('prodBrand').value.trim());
    formData.append('weight', weight);
    formData.append('price', price);
    formData.append('stock', stock);
    
    if (imgFile) {
      formData.append('image', imgFile);
    }

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/products/${editId}` : `${API_URL}/products`;

    try {
      const resp = await fetch(url, {
        method: method,
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      if (resp.ok) {
        document.getElementById('productFormModal').style.display = 'none';
        loadCategories();
        loadProducts(role);
      } else {
        const err = await resp.json();
        alert(`Error: ${err.error || 'Operation failed'}`);
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Save Product';
    }
  });

  function showDashboard(role, name) {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    document.getElementById('welcomeMsg').textContent = `Logged in as: ${name} (${role === 'super_admin' ? 'Super Admin' : 'Admin'})`;
    
    if (role === 'super_admin') {
      document.getElementById('manageUsersBtn').style.display = 'inline-block';
    }

    loadCategories(); // Always load categories for the product form
    loadProducts(role);
  }
});
