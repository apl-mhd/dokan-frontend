# Product Module Guide

## Overview

This document provides a comprehensive guide to the Product Module CRUD operations in the Dokan inventory management system. The module includes management for **Products**, **Categories**, **Units**, and **Unit Categories**.

---

## Architecture

### Backend API Endpoints

All endpoints are prefixed with `/api/products/`

#### Category Endpoints
- `GET /api/products/categories/` - List all categories
- `GET /api/products/categories/{id}/` - Get single category
- `POST /api/products/categories/` - Create category
- `PUT /api/products/categories/{id}/` - Update category
- `DELETE /api/products/categories/{id}/` - Delete category

#### Unit Category Endpoints
- `GET /api/products/unit-categories/` - List all unit categories
- `GET /api/products/unit-categories/{id}/` - Get single unit category
- `POST /api/products/unit-categories/` - Create unit category
- `PUT /api/products/unit-categories/{id}/` - Update unit category
- `DELETE /api/products/unit-categories/{id}/` - Delete unit category

#### Unit Endpoints
- `GET /api/products/units/` - List all units
- `GET /api/products/units/{id}/` - Get single unit
- `POST /api/products/units/` - Create unit
- `PUT /api/products/units/{id}/` - Update unit
- `DELETE /api/products/units/{id}/` - Delete unit

#### Product Endpoints
- `GET /api/products/list/` - List all products
- `GET /api/products/{id}/` - Get single product
- `POST /api/products/list/` - Create product
- `PUT /api/products/{id}/` - Update product
- `DELETE /api/products/{id}/` - Delete product

---

## Frontend Structure

### Pinia Stores

#### 1. Category Store (`stores/category.store.js`)
Manages category state and API interactions.

**State:**
- `categories`: Array of category objects
- `loading`: Boolean loading state
- `error`: Error message string

**Actions:**
- `fetchCategories()`: Get all categories
- `fetchCategory(id)`: Get single category
- `createCategory(data)`: Create new category
- `updateCategory(id, data)`: Update category
- `deleteCategory(id)`: Delete category

#### 2. Unit Store (`stores/unit.store.js`)
Manages units and unit categories.

**State:**
- `units`: Array of unit objects
- `unitCategories`: Array of unit category objects
- `loading`: Boolean loading state
- `error`: Error message string

**Actions:**
- `fetchUnits()`: Get all units
- `createUnit(data)`: Create new unit
- `updateUnit(id, data)`: Update unit
- `deleteUnit(id)`: Delete unit
- `fetchUnitCategories()`: Get all unit categories
- `createUnitCategory(data)`: Create new unit category
- `updateUnitCategory(id, data)`: Update unit category
- `deleteUnitCategory(id)`: Delete unit category

#### 3. Product Store (`stores/product.store.js`)
Manages products and their operations.

**State:**
- `products`: Array of product objects
- `loading`: Boolean loading state
- `error`: Error message string

**Actions:**
- `fetchProducts()`: Get all products
- `fetchProduct(id)`: Get single product
- `createProduct(data)`: Create new product
- `updateProduct(id, data)`: Update product
- `deleteProduct(id)`: Delete product

---

### Vue Components

#### 1. CategoryPage.vue (`/categories`)
**Features:**
- Grid-based card layout for categories
- Create/Edit modal for category management
- Delete confirmation
- Displays category name, description, and creation date
- Responsive Bootstrap 5 design with hover effects

**Form Fields:**
- Name (required, max 128 characters)
- Description (optional)

#### 2. UnitPage.vue (`/units`)
**Features:**
- Tabbed interface for Units and Unit Categories
- Table view for units with detailed information
- Card grid for unit categories
- Create/Edit modals for both units and unit categories
- Conversion factor management
- Base unit designation

**Unit Form Fields:**
- Name (required)
- Unit Category (optional)
- Conversion Factor (required, decimal)
- Is Base Unit (checkbox)

**Unit Category Form Fields:**
- Name (required, max 50 characters)

#### 3. ProductManagementPage.vue (`/products`)
**Features:**
- Comprehensive product listing table
- Advanced search and filtering
- Create/Edit modal with full product details
- View modal for detailed product information
- Stock level indicators with color coding
- Currency formatting for prices
- Category and unit integration

**Form Fields:**
- Name (required)
- SKU (required, unique)
- Category (required, dropdown)
- Base Unit (required, dropdown)
- Purchase Price (required, decimal)
- Sale Price (required, decimal)
- Description (optional)
- Is Active (checkbox)

**Search & Filter:**
- Text search (name and SKU)
- Filter by category
- Filter by unit
- Clear all filters button

---

## Data Models

### Category
```javascript
{
  id: number,
  name: string,
  description: string,
  company: number,
  company_name: string,
  created_at: datetime,
  updated_at: datetime
}
```

### Unit Category
```javascript
{
  id: number,
  name: string,
  company: number,
  company_name: string,
  created_at: datetime,
  updated_at: datetime
}
```

### Unit
```javascript
{
  id: number,
  name: string,
  unit_category: number,
  unit_category_name: string,
  conversion_factor: decimal,
  is_base_unit: boolean,
  company: number,
  company_name: string,
  created_at: datetime,
  updated_at: datetime
}
```

### Product
```javascript
{
  id: number,
  name: string,
  sku: string,
  category: number,
  category_name: string,
  base_unit: number,
  base_unit_name: string,
  purchase_price: decimal,
  sale_price: decimal,
  description: string,
  is_active: boolean,
  total_stock: number,
  company: number,
  company_name: string,
  created_at: datetime,
  updated_at: datetime
}
```

---

## Usage Guide

### Setting Up Categories

1. Navigate to `/categories`
2. Click "Add Category"
3. Enter category name and optional description
4. Click "Save"

**Example Categories:**
- Electronics
- Clothing
- Food & Beverages
- Office Supplies

### Setting Up Unit Categories and Units

1. Navigate to `/units`
2. Switch to "Unit Categories" tab
3. Create unit categories (e.g., Weight, Volume, Length)
4. Switch back to "Units" tab
5. Create units with:
   - Name (e.g., kg, liter, piece)
   - Select unit category
   - Set conversion factor
   - Mark as base unit if applicable

**Example Unit Setup:**

**Weight Category:**
- kg (1.0000, base unit)
- gram (0.001)
- ton (1000)

**Volume Category:**
- liter (1.0000, base unit)
- ml (0.001)
- gallon (3.785)

### Creating Products

1. Navigate to `/products`
2. Click "Add Product"
3. Fill in all required fields:
   - Product name
   - Unique SKU
   - Select category
   - Select base unit
   - Enter purchase and sale prices
   - Add description
   - Set active status
4. Click "Save"

### Managing Products

**View Product:**
- Click the eye icon to view full product details

**Edit Product:**
- Click the pencil icon to open edit modal
- Modify fields and save

**Delete Product:**
- Click the trash icon
- Confirm deletion

**Search & Filter:**
- Use search box to find products by name or SKU
- Filter by category or unit
- Click "Clear" to reset filters

---

## Multi-Tenancy

All entities (Products, Categories, Units, Unit Categories) are **company-aware**:

- Data is automatically filtered by the logged-in user's company
- Company field is auto-set on creation
- Cross-company data access is prevented
- Related entities must belong to the same company

---

## Stock Level Indicators

Products display stock levels with color coding:

- **Red Badge**: Out of stock (0 units)
- **Yellow Badge**: Low stock (< 10 units)
- **Green Badge**: In stock (≥ 10 units)

---

## UI/UX Features

### Design Elements
- Bootstrap 5.3 for responsive design
- Bootstrap Icons for visual clarity
- Card-based layouts for categories and unit categories
- Table-based layouts for units and products
- Modal dialogs for create/edit operations
- Hover effects and smooth transitions

### Responsive Behavior
- Mobile-friendly layouts
- Collapsible sidebar
- Responsive tables
- Touch-friendly buttons

### User Feedback
- Loading spinners during API calls
- Error alerts for failed operations
- Success feedback after operations
- Confirmation dialogs for destructive actions

---

## Best Practices

1. **Category Setup First**: Create categories before adding products
2. **Unit System**: Set up unit categories and units before creating products
3. **Base Units**: Always designate one base unit per unit category
4. **SKU Uniqueness**: Ensure SKUs are unique across all products
5. **Price Validation**: Sale price should typically be higher than purchase price
6. **Stock Management**: Regularly monitor low stock alerts

---

## Navigation

Access the product module through the sidebar:

- **Products** (`/products`) - Main product management
- **Categories** (`/categories`) - Category management
- **Units** (`/units`) - Unit and unit category management

---

## Troubleshooting

### Common Issues

**Category not showing in product form:**
- Ensure categories are created first
- Check that category belongs to your company
- Refresh the page

**Unit not available in product form:**
- Create units before adding products
- Verify unit is active
- Check company association

**Product creation fails:**
- Verify all required fields are filled
- Ensure SKU is unique
- Check that category and unit exist

**Stock not updating:**
- Stock is managed through Purchase and Sale modules
- Product CRUD only manages product information
- Check Stock page for inventory details

---

## Next Steps

After setting up the product module:

1. Configure **Warehouses** for multi-location inventory
2. Set up **Suppliers** for purchase operations
3. Add **Customers** for sales
4. Create **Purchase Orders** to add stock
5. Process **Sales** to reduce stock
6. Monitor **Stock Levels** and reorder as needed

---

## Technical Notes

### Backend Files Modified
- `dokan-api/product/views_extended.py` - New ViewSets
- `dokan-api/product/urls.py` - Added routes
- `dokan-api/product/serializers.py` - Added CategorySerializer

### Frontend Files Created
- `src/stores/category.store.js`
- `src/stores/unit.store.js`
- `src/views/CategoryPage.vue`
- `src/views/UnitPage.vue`
- `src/views/ProductManagementPage.vue`

### Router Updates
- Added `/categories` route
- Added `/units` route
- Added `/products` route

### Sidebar Updates
- Added Category, Unit, and Products navigation links

---

## API Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

---

## Support

For issues or questions:
1. Check this guide first
2. Review backend API documentation
3. Check browser console for errors
4. Verify network requests in DevTools

---

**Last Updated:** January 2026  
**Version:** 1.0.0

