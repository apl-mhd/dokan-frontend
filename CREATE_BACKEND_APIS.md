# Creating Missing Backend APIs

Your frontend is ready, but you need to create these backend APIs first:

## 1. Customer API

### Step 1: Create `customer/serializer.py`
```python
from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
```

### Step 2: Create `customer/views.py`
```python
from rest_framework import viewsets
from .models import Customer
from .serializer import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
```

### Step 3: Create `customer/urls.py`
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.CustomerViewSet, basename='customer')

urlpatterns = router.urls
```

### Step 4: Add to `dokan/urls.py`
```python
path('api/customers/', include('customer.urls')),
```

## 2. Warehouse API

### Step 1: Create `warehouse/serializers.py`
```python
from rest_framework import serializers
from .models import Warehouse

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = '__all__'
```

### Step 2: Create `warehouse/views.py`
```python
from rest_framework import viewsets
from .models import Warehouse
from .serializers import WarehouseSerializer

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
```

### Step 3: Create `warehouse/urls.py`
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.WarehouseViewSet, basename='warehouse')

urlpatterns = router.urls
```

### Step 4: Add to `dokan/urls.py`
```python
path('api/warehouses/', include('warehouse.urls')),
```

## 3. Inventory/Stock API

### Step 1: Create `inventory/serializers.py`
```python
from rest_framework import serializers
from .models import Stock, StockTransaction

class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    
    class Meta:
        model = Stock
        fields = '__all__'

class StockTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    
    class Meta:
        model = StockTransaction
        fields = '__all__'
```

### Step 2: Create `inventory/views.py`
```python
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Stock, StockTransaction
from .serializers import StockSerializer, StockTransactionSerializer

class StockViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for stock - stock is managed through purchases/sales"""
    queryset = Stock.objects.all().select_related('product', 'warehouse', 'company')
    serializer_class = StockSerializer
    
    def list(self, request):
        queryset = self.get_queryset()
        if hasattr(request, 'company') and request.company:
            queryset = queryset.filter(company=request.company)
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "message": "Stocks retrieved successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

class StockTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for stock transactions"""
    queryset = StockTransaction.objects.all().select_related('product', 'stock', 'unit', 'company')
    serializer_class = StockTransactionSerializer
    
    def list(self, request):
        queryset = self.get_queryset().order_by('-created_at')
        if hasattr(request, 'company') and request.company:
            queryset = queryset.filter(company=request.company)
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "message": "Stock transactions retrieved successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
```

### Step 3: Create `inventory/urls.py`
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'stocks', views.StockViewSet, basename='stock')
router.register(r'transactions', views.StockTransactionViewSet, basename='stock-transaction')

urlpatterns = router.urls
```

### Step 4: Add to `dokan/urls.py`
```python
path('api/inventory/', include('inventory.urls')),
```

## Final `dokan/urls.py`

Your complete urls.py should look like:

```python
from django.urls import re_path, path, include
from django.contrib import admin
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

schema_view = get_schema_view(
    openapi.Info(
        title="Dokan API",
        default_version='v1',
        description="API documentation for Dokan project",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Main APIs
    path('api/purchases/', include('purchase.urls')),
    path('api/sales/', include('sale.urls')),
    path('api/products/', include('product.urls')),
    path('api/suppliers/', include('supplier.urls')),
    path('api/customers/', include('customer.urls')),          # NEW
    path('api/warehouses/', include('warehouse.urls')),        # NEW
    path('api/inventory/', include('inventory.urls')),         # NEW
    
    # Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Documentation
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0),
         name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0),
         name='schema-redoc'),
]
```

## Quick Commands

Run these after creating the files:

```bash
# No migrations needed (models already exist)

# Test the APIs
python manage.py runserver

# Test endpoints:
curl http://localhost:8000/api/customers/
curl http://localhost:8000/api/warehouses/
curl http://localhost:8000/api/inventory/stocks/
curl http://localhost:8000/api/inventory/transactions/
```

## ✅ After Implementation

Once these APIs are created, your frontend will work perfectly without any changes!

The frontend is already configured to call these endpoints.

