# Sales Invoice PDF - Quick Reference

## UI Button Location

In the Sales table, each row now has a **green PDF button**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Invoice No. │ Customer  │ Warehouse │ Date       │ Status │ Total │ Actions │
├─────────────────────────────────────────────────────────────────────────┤
│ INV-001     │ John Doe  │ Main WH   │ 2026-01-05 │ ✓ Done │ ৳2000 │ [📄][👁][✏][🗑] │
│ INV-002     │ Jane Smith│ Main WH   │ 2026-01-04 │ Pending│ ৳1500 │ [📄][👁][✏][🗑] │
└─────────────────────────────────────────────────────────────────────────┘
                                                                         ↑
                                                              New PDF Download Button!
```

## Button Colors

- **📄 Green** (PDF) - Download invoice
- **👁 Cyan** (Eye) - View details  
- **✏ Blue** (Pencil) - Edit sale
- **🗑 Red** (Trash) - Delete sale

## How to Use

1. **Click the green PDF button** (📄)
2. **PDF downloads automatically** to your Downloads folder
3. **Filename**: `invoice_INV-001.pdf`

## API Endpoint

```
GET /api/sales/{id}/pdf/
```

**Response**: PDF file (application/pdf)

## Code Snippet

```vue
<!-- Button in Vue template -->
<button
  class="btn btn-sm btn-outline-success me-2"
  @click="handleDownloadPDF(sale)"
  title="Download PDF"
>
  <i class="bi bi-file-pdf"></i>
</button>
```

```javascript
// Handler function
const handleDownloadPDF = async (sale) => {
  const response = await api.get(`/sales/${sale.id}/pdf/`, {
    responseType: 'blob'
  })
  
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `invoice_${sale.invoice_number || sale.id}.pdf`
  link.click()
}
```

## Features

✅ One-click download  
✅ Automatic file naming  
✅ Professional PDF layout  
✅ Company branding  
✅ Complete invoice details  
✅ Mobile friendly  

---

**That's it! Sales invoices are now downloadable as PDF!** 🎉

