# Dokan Frontend - Inventory Management System

A modern, responsive inventory management system built with Vue 3, Vite, Pinia, and Bootstrap 5.

## 🚀 Tech Stack

- **Vue 3** (Composition API)
- **Vite** - Fast build tool
- **Pinia v3** - State management
- **Bootstrap 5.3** - UI framework
- **Bootstrap Icons** - Icon library
- **Axios** - HTTP client
- **Vue Router 4** - Routing

## 📋 Features

### Core Modules

1. **Dashboard** - Overview of inventory metrics and recent activities
2. **Purchase Management** - Create and manage purchase orders
3. **Sale Management** - Create and manage sales
4. **Product Management** - Manage products, categories, and units
5. **Stock Management** - View current stock levels and transaction history
6. **Supplier Management** - Maintain supplier information
7. **Customer Management** - Maintain customer information
8. **Warehouse Management** - Manage warehouse locations
9. **Payment Management** - Track payments (existing)

## 🏗️ Project Structure

```
dokan-frontend/
├── public/
├── src/
│   ├── api/              # API service files (legacy)
│   ├── assets/           # Static assets
│   ├── components/       # Reusable Vue components
│   ├── router/           # Vue Router configuration
│   │   └── index.js      # Route definitions
│   ├── stores/           # Pinia stores
│   │   ├── product.store.js
│   │   ├── purchase.store.js
│   │   ├── sale.store.js
│   │   ├── stock.store.js
│   │   ├── supplier.store.js
│   │   ├── customer.store.js
│   │   └── warehouse.store.js
│   ├── utility/
│   │   └── axios.js      # Axios instance with JWT interceptor
│   ├── views/            # Page components
│   │   ├── DashboardPage.vue
│   │   ├── ProductPage.vue
│   │   ├── PurchasePage.vue
│   │   ├── SalePage.vue
│   │   ├── StockPage.vue
│   │   ├── SupplierPage.vue
│   │   ├── CustomerPage.vue
│   │   ├── WarehousePage.vue
│   │   └── PaymentPage.vue
│   ├── App.vue           # Root component with sidebar
│   ├── main.js           # Application entry point
│   └── style.css         # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 Setup and Installation

### Prerequisites

- Node.js (v16 or higher)
- pnpm, npm, or yarn
- Backend API running on `http://localhost:8000`

### Installation Steps

1. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Configure API URL:**
   
   Edit `src/utility/axios.js` if your backend is not at `http://localhost:8000`:
   ```javascript
   baseURL: "http://your-backend-url/api/"
   ```

3. **Run development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Build for production:**
   ```bash
   pnpm build
   # or
   npm run build
   ```

## 🗄️ Pinia Stores

All stores follow the Composition API pattern and include:

- **State:** Reactive data (items list, loading, error)
- **Actions:** Async methods for CRUD operations
- **Automatic token handling:** JWT token from localStorage

### Store Methods Pattern

Each store includes:
- `fetch[Items]()` - Get all items
- `fetch[Item](id)` - Get single item
- `create[Item](data)` - Create new item
- `update[Item](id, data)` - Update existing item
- `delete[Item](id)` - Delete item

## 🔐 Authentication

JWT token is stored in `localStorage` and automatically attached to all API requests via Axios interceptor.

```javascript
// Login example (implement your login page)
const response = await axios.post('/api/token/', {
  username: 'user',
  password: 'pass'
})
localStorage.setItem('token', response.data.access)
```

## 🎨 UI Components

All pages use Bootstrap 5 classes:
- **Cards** for content sections
- **Modals** for create/edit forms
- **Tables** for data display
- **Badges** for status indicators
- **Buttons** with icons

## 📡 API Endpoints

The frontend expects the following backend endpoints:

### Products
- `GET /api/products/list/` - List all products
- `POST /api/products/list/` - Create product
- `GET /api/products/{id}/` - Get product
- `PUT /api/products/{id}/` - Update product
- `DELETE /api/products/{id}/` - Delete product
- `GET /api/products/{id}/units/` - Get product units

### Purchases
- `GET /api/purchases/` - List all purchases
- `POST /api/purchases/` - Create purchase
- `GET /api/purchases/{id}/` - Get purchase
- `PUT /api/purchases/{id}/` - Update purchase
- `DELETE /api/purchases/{id}/` - Delete purchase

### Sales
- `GET /api/sales/` - List all sales
- `POST /api/sales/` - Create sale
- `GET /api/sales/{id}/` - Get sale
- `PUT /api/sales/{id}/` - Update sale
- `DELETE /api/sales/{id}/` - Delete sale

### Stock
- `GET /api/inventory/stocks/` - List all stocks
- `GET /api/inventory/transactions/` - List stock transactions

### Suppliers
- `GET /api/suppliers/` - List all suppliers
- `POST /api/suppliers/` - Create supplier
- `GET /api/suppliers/{id}/` - Get supplier
- `PUT /api/suppliers/{id}/` - Update supplier
- `DELETE /api/suppliers/{id}/` - Delete supplier

### Customers
- `GET /api/customers/` - List all customers
- `POST /api/customers/` - Create customer
- `GET /api/customers/{id}/` - Get customer
- `PUT /api/customers/{id}/` - Update customer
- `DELETE /api/customers/{id}/` - Delete customer

### Warehouses
- `GET /api/warehouses/` - List all warehouses
- `POST /api/warehouses/` - Create warehouse
- `GET /api/warehouses/{id}/` - Get warehouse
- `PUT /api/warehouses/{id}/` - Update warehouse
- `DELETE /api/warehouses/{id}/` - Delete warehouse

## 🎯 Key Features

### Purchase Module
- Multi-item purchase orders
- Real-time line total calculation
- Supplier and warehouse selection
- Status tracking (pending, completed, cancelled)
- Automatic stock updates on backend

### Sale Module
- Multi-item sales
- Customer and warehouse selection
- Real-time totals
- Status tracking (pending, delivered, cancelled)
- Automatic stock deduction on backend

### Stock Module
- View current stock levels by product and warehouse
- Track all stock transactions
- Transaction types: Purchase, Sale, Transfer, Adjustment
- Balance history

### Product Module
- Product CRUD operations
- Category management
- Unit management with conversion factors
- Base unit tracking

## 🚨 Error Handling

All stores include error handling:
```javascript
try {
  await store.createItem(data)
  // Success
} catch (error) {
  // Error message from backend or generic message
  alert(error.response?.data?.message || 'Operation failed')
}
```

## 🔄 State Management Pattern

```javascript
// Example: Using a store in a component
import { useProductStore } from '@/stores/product.store'

const productStore = useProductStore()

// In onMounted or on user action
await productStore.fetchProducts()

// Access state
console.log(productStore.products)
console.log(productStore.loading)
console.log(productStore.error)
```

## 🎨 Styling

The application uses Bootstrap 5 utility classes throughout. Custom styles are minimal and scoped to components.

### Sidebar
- Fixed left sidebar
- Responsive (collapsible on mobile)
- Active route highlighting

### Theme
- Primary: Bootstrap blue
- Success: Bootstrap green
- Info: Bootstrap cyan
- Warning: Bootstrap yellow
- Danger: Bootstrap red

## 🐛 Debugging

1. **Check browser console** for errors
2. **Check Network tab** for API responses
3. **Verify JWT token** in localStorage
4. **Ensure backend is running** on correct port
5. **Check CORS settings** on backend

## 📝 Backend Model Alignment

All Pinia stores match the backend Django models:

- **Product** → `product/models.py`
- **Purchase** → `purchase/models.py`
- **Sale** → `sale/models.py`
- **Stock** → `inventory/models.py`
- **Supplier** → `supplier/models.py`
- **Customer** → `customer/models.py`
- **Warehouse** → `warehouse/models.py`

## 🔮 Future Enhancements

- [ ] User authentication UI
- [ ] Advanced filtering and search
- [ ] Export to Excel/PDF
- [ ] Charts and analytics
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Notifications/Toast messages
- [ ] Form validation with VeeValidate
- [ ] Barcode scanning
- [ ] Print invoices

## 📄 License

This project is part of the Dokan inventory management system.

## 👨‍💻 Development

Built with ❤️ using Vue 3 Composition API and Bootstrap 5.

---

**Note:** Make sure your backend API is running and accessible before starting the frontend application.
