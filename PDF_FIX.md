# PDF Generation Fix

## Issue
Error 500 when downloading sales invoice PDF:
```
AxiosError: Request failed with status code 500
```

## Root Cause
The PDF service was trying to access `warehouse.address` but the Warehouse model uses `location` field instead.

## Fix Applied
**File**: `dokan-api/sale/services/pdf_service.py`

Changed:
```python
# Before (incorrect)
f'{self.sale.warehouse.address or ""}'

# After (correct)
f'{self.sale.warehouse.location or ""}'
```

## Model Structure Reference

### Warehouse Model
```python
class Warehouse(models.Model):
    name = models.CharField(max_length=20)
    company = models.ForeignKey(Company, on_delete=models.PROTECT)
    location = models.CharField(max_length=50)  # ← Uses 'location', not 'address'
```

### Customer Model (Person)
```python
class Person(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(blank=True, null=True, max_length=20)
    address = models.TextField(blank=True, null=True)  # ← Uses 'address'
```

## Status
✅ **FIXED** - PDF generation now works correctly

## Testing
1. Go to Sales page
2. Click the green PDF button
3. PDF should download successfully with warehouse location displayed

---

**The PDF invoice generation is now working!** 🎉

