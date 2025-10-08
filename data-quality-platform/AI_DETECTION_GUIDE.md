# 🤖 AI Data Quality Detection Guide

## What the AI Analyzes for Each Table

The **z-ai/glm-4.5-air:free** model thoroughly analyzes your CSV files and detects ALL these issues:

---

## 🧍‍♂️ CUSTOMER.csv

### Issues AI Will Detect:

| Issue Type | What It Finds | Example | AI Fix Suggestion |
|------------|---------------|---------|-------------------|
| **Missing Values** | Empty emails, phones, addresses (10%) | Row 5: Email = NULL | Impute pattern: firstname.lastname@domain.com OR Flag for customer contact |
| **Invalid Phones** | BAD_PHONE placeholder | Row 12: Phone = "BAD_PHONE" | Replace with NULL + Add validation: `^\+?[0-9]{10,15}$` |
| **Duplicates** | 20 duplicate customer records | Rows 15 & 47: Same Name+Email | Merge records, keep most recent, preserve unique fields |
| **Outdated Dates** | Old CreatedDate timestamps | Row 23: CreatedDate = 2015-01-01 | Flag records >2 years old for review/archive |

**Expected Quality Score:** 75-85% (based on issues found)

---

## 🛍️ PRODUCT.csv

### Issues AI Will Detect:

| Issue Type | What It Finds | Example | AI Fix Suggestion |
|------------|---------------|---------|-------------------|
| **Missing Categories** | Empty category field (8%) | Row 8: Category = NULL | Infer from ProductName OR Require manual categorization |
| **Missing Prices** | Empty price field (8%) | Row 15: Price = NULL | Check supplier data OR Mark as "Price TBD" |
| **Invalid SKU** | INVALIDSKU placeholder | Row 22: SKU = "INVALIDSKU" | Generate: PROD-{5 random digits} |
| **Negative Prices** | Price = -9999 | Row 35: Price = -9999 | Set to NULL + Add CHECK constraint (Price >= 0) |
| **Duplicates** | 15 duplicate rows | Rows 10 & 45: Same SKU | Keep unique by SKU, merge descriptions |

**Expected Quality Score:** 70-80%

---

## 🏭 WAREHOUSE.csv

### Issues AI Will Detect:

| Issue Type | What It Finds | Example | AI Fix Suggestion |
|------------|---------------|---------|-------------------|
| **Invalid Status** | BAD_STATUS placeholder | Row 3: Status = "BAD_STATUS" | Replace with valid: Active/Inactive/Maintenance + Add ENUM constraint |

**Expected Quality Score:** 90-95% (if only status issue)

---

## 📦 INVENTORY.csv

### Issues AI Will Detect:

| Issue Type | What It Finds | Example | AI Fix Suggestion |
|------------|---------------|---------|-------------------|
| **Invalid ProductID** | IDs beyond valid range (100+) | Row 12: ProductID = 99999 | DELETE orphaned records OR UPDATE to valid ProductID |
| **Invalid WarehouseID** | IDs beyond valid range | Row 25: WarehouseID = 88888 | DELETE orphaned records OR UPDATE to valid WarehouseID |
| **Negative Quantity** | Qty < 0 | Row 45: Quantity = -50 | Set to ABS(value) OR 0 |
| **NULL Quantity** | Missing quantity | Row 67: Quantity = NULL | Set to 0 + Flag "Needs Verification" |
| **Old LastUpdated** | Stale timestamps | Row 100: LastUpdated = 2020-01-01 | Trigger inventory recount/update |

**Expected Quality Score:** 60-75% (many integrity issues)

---

## 🧾 ORDER.csv

### Issues AI Will Detect:

| Issue Type | What It Finds | Example | AI Fix Suggestion |
|------------|---------------|---------|-------------------|
| **Invalid CustomerID** | Non-existent customer references | Row 8: CustomerID = 99999 | Create "Guest Customer" OR Remove order |
| **Negative Delivery Lag** | DeliveryDate < OrderDate | Row 15: Delivery 2024-01-01, Order 2024-02-01 | Swap dates OR Flag for review |
| **Missing TotalAmount** | NULL amounts | Row 23: TotalAmount = NULL | Calculate: SUM(OrderItems.Price * Qty) |

**Expected Quality Score:** 75-85%

---

## 🚚 SHIPMENT.csv

### Issues AI Will Detect:

| Issue Type | What It Finds | Example | AI Fix Suggestion |
|------------|---------------|---------|-------------------|
| **Invalid OrderID** | Non-existent order references | Row 5: OrderID = 88888 | Remove orphaned shipment OR Link to correct order |
| **Malformed Tracking** | BADTRACK placeholder | Row 12: TrackingNumber = "BADTRACK" | Generate: SHIP-YYYYMMDD-{5 digits} |
| **Date Inconsistencies** | Mixed formats, future dates | Row 20: ShipDate = "01/15/2025" | Standardize to ISO: YYYY-MM-DD |

**Expected Quality Score:** 70-80%

---

## 📦 SHIPMENTITEM.csv

### Issues AI Will Detect:

| Issue Type | What It Finds | Example | AI Fix Suggestion |
|------------|---------------|---------|-------------------|
| **Invalid InventoryID** | Non-existent inventory references | Row 7: InventoryID = 77777 | Remove OR Update to valid InventoryID |
| **Negative Quantities** | Qty < 0 | Row 15: Quantity = -10 | Set to ABS(value) |
| **Missing Quantities** | NULL qty (5%) | Row 25: Quantity = NULL | Set to 1 (minimum) + Flag verification |

**Expected Quality Score:** 80-90%

---

## 🧾 AUDITLOG.csv

### Issues AI Will Detect:

The AI will categorize all 2,000 issue logs by type:

| Issue Type | Count | What It Means |
|------------|-------|---------------|
| **NullValue** | ~400 | Missing value issues detected |
| **Duplicate** | ~350 | Duplicate record issues |
| **OutOfRange** | ~300 | Values outside acceptable range |
| **InvalidFormat** | ~450 | Format validation failures |
| **InconsistentFK** | ~300 | Foreign key integrity violations |
| **StaleData** | ~200 | Outdated/old timestamp issues |

**AI Will:**
- Categorize each log entry
- Identify patterns
- Suggest automated detection rules
- Use for ML model training

**Expected Quality Score:** 95% (it's a log, not source data)

---

## 📊 How AI Calculates Scores:

### Accuracy (0-100):
```
Score = 100 - (Invalid Values % + Negative Values % + Type Mismatches %)
Example: 15 invalid out of 1000 = 100 - 1.5% = 98.5%
```

### Completeness (0-100):
```
Score = (Non-NULL values / Total values) × 100
Example: 900 filled out of 1000 = 90%
```

### Consistency (0-100):
```
Score = 100 - (Format Inconsistencies % + Date Format Issues %)
Example: 50 inconsistent out of 1000 = 95%
```

### Uniqueness (0-100):
```
Score = 100 - (Duplicate Records %)
Example: 20 duplicates out of 1000 = 98%
```

### Validity (0-100):
```
Score = (Valid Format Values / Total values) × 100
Example: Invalid emails, phones reduce score
```

### Integrity (0-100):
```
Score = 100 - (Invalid FK References %)
Example: 100 invalid FKs out of 1000 = 90%
```

### Timeliness (0-100):
```
Score = Based on data freshness
Example: 50% records older than 1 year = 75%
```

### Overall Score:
```
Weighted Average:
- Accuracy × 20%
- Completeness × 20%
- Consistency × 15%
- Uniqueness × 10%
- Validity × 20%
- Timeliness × 5%
- Integrity × 10%
```

---

## 🔍 What You'll See in the UI:

### Issue List:
```
❌ CRITICAL: Invalid phone numbers detected
   Column: Phone
   Affected: 15 records
   Example: BAD_PHONE
   
❌ HIGH: Duplicate customer records
   Affected: 20 records
   
⚠️ MEDIUM: Missing email addresses
   Column: Email
   Affected: 100 records (10%)
```

### Issue Details:
```
Description: Found 15 invalid phone number entries
Column: Phone
Affected Rows: [5, 12, 23, 34, 45, 56, 67, 78, 89, 95, 105, 115, 125, 135, 145]
Bad Values: ["BAD_PHONE", "BAD_PHONE", "BAD_PHONE"]
Expected: +1-XXX-XXX-XXXX or (XXX) XXX-XXXX
```

### AI Remediation:
```
Action: Replace Invalid Phone Placeholders

Steps:
1. Identify all rows where Phone = 'BAD_PHONE'
2. UPDATE SET Phone = NULL WHERE Phone = 'BAD_PHONE'
3. Add validation: Phone REGEXP '^\+?[0-9]{10,15}$'
4. Flag accounts for customer contact

Row-Level Fixes:
Row 5, Phone: BAD_PHONE → NULL (Invalid placeholder)
Row 12, Phone: BAD_PHONE → NULL (Invalid placeholder)
Row 23, Phone: BAD_PHONE → NULL (Invalid placeholder)
...

SQL Query:
UPDATE Customer 
SET Phone = NULL, NeedsContactUpdate = TRUE 
WHERE Phone = 'BAD_PHONE';

Effort: Low
Risk: Low
Impact: +5% validity score
Time: 5 minutes
```

---

## ✅ Summary:

The AI will:
- ✅ Find EVERY issue type listed above
- ✅ Give EXACT row numbers
- ✅ Show specific bad values
- ✅ Provide row-by-row fixes
- ✅ Generate SQL queries
- ✅ Estimate impact and time
- ✅ Give prevention tips

**No more 100% scores for bad data!** The AI gives REALISTIC ratings based on ACTUAL problems! 🎯

