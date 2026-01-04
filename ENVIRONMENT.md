# Environment Configuration

## Backend API URL

The frontend is configured to connect to your backend at:
```
http://localhost:8000/api/
```

If your backend runs on a different URL or port, update the file:

**File:** `src/utility/axios.js`

```javascript
const api = axios.create({
  baseURL: "http://localhost:8000/api/",  // Change this line
  headers: {
    "Content-Type": "application/json",
  },
});
```

## Common Backend URLs

### Development
```
Local: http://localhost:8000/api/
```

### Production
```
Production: https://your-domain.com/api/
```

## CORS Configuration

Make sure your Django backend has CORS configured to allow the frontend origin.

In `dokan-api/dokan/settings/dev.py` or `base.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",  # Alternative port
    "http://127.0.0.1:5173",
]

# Or for development only:
CORS_ALLOW_ALL_ORIGINS = True
```

## JWT Token Configuration

Tokens are stored in browser localStorage and automatically attached to requests.

### Token Key
```
localStorage.getItem('token')
```

### Clear Token (Logout)
```javascript
localStorage.removeItem('token')
```

## Environment Variables (Optional)

For production, you can create environment variable support:

1. Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api/
```

2. Update `src/utility/axios.js`:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});
```

3. Create `.env.production`:
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/
```

## Port Configuration

To change the frontend development port, edit `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,  // Change from default 5173
    host: true   // Expose to network
  }
})
```

## Build Configuration

### Build for Production
```bash
pnpm build
```

Output will be in `dist/` folder.

### Preview Production Build
```bash
pnpm preview
```

### Deploy
Copy contents of `dist/` folder to your web server.

## Troubleshooting

### Can't connect to backend
1. Check backend is running
2. Verify URL in `axios.js`
3. Check CORS settings
4. Check browser console for errors

### 401 Unauthorized
1. Check JWT token exists in localStorage
2. Token might be expired - get a new one
3. Check backend authentication middleware

### Changes not reflecting
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Restart Vite dev server
4. Check if file is saved

---

**Note:** Never commit `.env` files with production credentials to Git!

