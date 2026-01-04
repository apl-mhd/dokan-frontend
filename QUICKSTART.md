# Dokan Frontend - Quick Start Guide

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd dokan-frontend
pnpm install
```

### 2. Start Backend (if not running)
```bash
cd ../dokan-api
source venv/bin/activate
python manage.py runserver
```

### 3. Start Frontend
```bash
cd ../dokan-frontend
pnpm dev
```

The app will be available at: **http://localhost:5173**

## 🔑 Getting a JWT Token

Before using the frontend, you need to obtain a JWT token from the backend.

### Option 1: Using cURL
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'
```

### Option 2: Using Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Run:
```javascript
fetch('http://localhost:8000/api/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'your_password' })
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('token', data.access)
  console.log('Token saved!')
  location.reload()
})
```

### Option 3: Create Login Page (Recommended for Production)

Create `src/views/LoginPage.vue`:
```vue
<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-4">
        <div class="card shadow">
          <div class="card-body">
            <h3 class="text-center mb-4">Login</h3>
            <form @submit.prevent="login">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input v-model="username" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input v-model="password" type="password" class="form-control" required />
              </div>
              <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utility/axios'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

const login = async () => {
  try {
    const response = await api.post('/token/', {
      username: username.value,
      password: password.value
    })
    localStorage.setItem('token', response.data.access)
    router.push('/')
  } catch (err) {
    error.value = 'Invalid credentials'
  }
}
</script>
```

## 📊 Sample Data Setup

### Create Test Data via Django Admin

1. Go to: http://localhost:8000/admin
2. Login with superuser credentials
3. Create:
   - 1-2 Warehouses
   - 2-3 Suppliers
   - 2-3 Customers
   - 1-2 Categories
   - 1-2 Units (kg, piece, etc.)
   - 3-5 Products

### Or Use Django Shell
```bash
python manage.py shell
```

```python
from company.models import Company
from warehouse.models import Warehouse
from supplier.models import Supplier
from customer.models import Customer
from product.models import Category, Product, Unit, UnitCategory
from django.contrib.auth.models import User

# Get your company
user = User.objects.first()
company = Company.objects.first()

# Create Warehouse
warehouse = Warehouse.objects.create(
    name="Main Warehouse",
    location="Dhaka",
    company=company
)

# Create Supplier
supplier = Supplier.objects.create(
    name="ABC Supplier",
    email="supplier@example.com",
    phone="01711111111",
    company=company
)

# Create Customer
customer = Customer.objects.create(
    name="John Doe",
    email="john@example.com",
    phone="01722222222",
    company=company
)

# Create Category
category = Category.objects.create(
    name="Electronics",
    company=company
)

# Create Unit Category
unit_cat = UnitCategory.objects.create(
    name="Weight",
    company=company
)

# Create Unit
unit = Unit.objects.create(
    name="kg",
    company=company,
    unit_category=unit_cat,
    is_base_unit=True,
    conversion_factor=1.0
)

# Create Product
product = Product.objects.create(
    name="Rice",
    description="Premium Rice",
    category=category,
    base_unit=unit
)
```

## 🧪 Testing the Application

### 1. Dashboard
- Navigate to `/` 
- Should see stats cards with counts

### 2. Create a Purchase
- Go to Purchase page
- Click "New Purchase"
- Select supplier, warehouse
- Add items with quantity and price
- Save

### 3. Create a Sale
- Go to Sale page
- Click "New Sale"
- Select customer, warehouse
- Add items
- Save

### 4. Check Stock
- Go to Stock page
- View "Current Stock" tab
- View "Stock Transactions" tab

## ⚙️ Configuration

### Change Backend URL
Edit `src/utility/axios.js`:
```javascript
baseURL: "http://your-backend-url:8000/api/"
```

### Change Port
Edit `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000  // Change from default 5173
  }
})
```

## 🐛 Common Issues

### Issue: "Network Error" or "Failed to fetch"
**Solution:** 
- Check if backend is running
- Check CORS settings in Django
- Verify `baseURL` in axios.js

### Issue: "401 Unauthorized"
**Solution:**
- Get a new JWT token
- Check if token is in localStorage
- Token might be expired (get refresh token)

### Issue: "404 Not Found" on API calls
**Solution:**
- Verify backend URLs match frontend API calls
- Check Django `urls.py` configuration

### Issue: Empty dropdowns in forms
**Solution:**
- Create sample data (suppliers, customers, warehouses, products)
- Check browser console for API errors

## 📱 Responsive Design

The application is fully responsive:
- **Desktop:** Sidebar always visible
- **Tablet:** Sidebar toggleable
- **Mobile:** Sidebar collapsed by default

## 🎨 Customization

### Change Theme Colors
Edit `src/App.vue` or add to `src/style.css`:
```css
:root {
  --bs-primary: #your-color;
  --bs-success: #your-color;
}
```

### Add More Routes
1. Create view in `src/views/`
2. Add route to `src/router/index.js`
3. Add menu item to `src/App.vue`

## 📚 Documentation

- **Full README:** See README.md
- **Backend API:** See dokan-api/API_DOCUMENTATION.md
- **Vue 3 Docs:** https://vuejs.org/
- **Pinia Docs:** https://pinia.vuejs.org/
- **Bootstrap Docs:** https://getbootstrap.com/

## 🤝 Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs
3. Review this guide
4. Check README.md

---

**Happy Coding! 🚀**

