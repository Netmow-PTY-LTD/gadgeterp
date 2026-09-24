BUILD A COMPLETE GADGET MANAGEMENT SYSTEM

You are an expert frontend engineer and UI/UX designer. Build a complete, polished, responsive Gadget / Mobile Device Management System using only:

- HTML5
- CSS3
- Vanilla JavaScript
- No React
- No Vue
- No Angular
- No TypeScript
- No Bootstrap
- No Tailwind
- No jQuery
- No backend
- No database
- Use dummy/sample data
- Use localStorage for client-side persistence
- Use Unsplash images where product/device/store imagery is useful

The application must be a fully functional frontend prototype, NOT just a static UI mockup.

==================================================
1. APPLICATION OVERVIEW
==================================================

Build a management system for a gadget/mobile phone business that:

- Buys new and used devices
- Sells individual devices
- Accepts trade-ins/exchanges
- Refurbishes used devices
- Repairs customer devices
- Manages spare parts
- Tracks IMEI/Serial Numbers
- Manages multiple branches
- Tracks individual device costs
- Calculates profit/loss
- Tracks stock aging
- Identifies slow-moving stock
- Manages suppliers and purchasing
- Manages customers
- Manages membership/loyalty
- Generates business reports

Everything must work using dummy data and localStorage.

There must be NO requirement for a backend or database.

==================================================
2. CORE REQUIREMENT
==================================================

Do NOT create a static dashboard with fake buttons.

The application must actually work.

Users must be able to:

- Create records
- Read records
- Update records
- Delete records
- Search records
- Filter records
- Sort records
- View details
- Perform calculations
- Generate reports
- Export data
- Persist data using localStorage

When the browser is refreshed, data should remain available.

==================================================
3. APPLICATION LAYOUT
==================================================

Create a professional responsive admin dashboard.

Desktop layout:

- Left sidebar navigation
- Top header
- Main content area
- Breadcrumbs
- Page title
- Search
- Notifications
- User profile
- Branch selector
- Date range selector where relevant

Mobile layout:

- Sidebar becomes a slide-out drawer
- Responsive tables
- Horizontal scrolling where required
- Cards stack vertically
- Modals fit the viewport
- Forms remain usable

==================================================
4. VISUAL DESIGN
==================================================

Create a modern SaaS/ERP-style interface.

Design characteristics:

- Clean
- Professional
- Modern
- Minimal
- Business-focused
- High readability

Suggested colors:

Primary:
Deep Blue / Indigo

Secondary:
Emerald
Orange
Red
Purple

Use:

- White cards
- Light gray backgrounds
- Dark text
- Subtle borders
- Rounded corners
- Soft shadows
- Professional typography
- Status badges
- Progress bars
- Charts

Use CSS variables for:

- Colors
- Spacing
- Border radius
- Shadows
- Typography

Include:

- Hover states
- Focus states
- Active navigation
- Toast notifications
- Confirmation dialogs
- Form validation
- Empty states
- Loading states
- Error states

Avoid excessive gradients and flashy animations.

==================================================
5. SIDEBAR NAVIGATION
==================================================

Create the following navigation structure.

DASHBOARD

- Overview

INVENTORY

- New Gadgets
- Used Gadgets
- Individual Devices
- Spare Parts
- Stock Aging
- Slow Moving Stock
- Stock Take
- Stock Adjustment
- Barcode Management

PURCHASING

- Suppliers
- Purchase Orders
- Purchase Invoices
- Goods Received Notes

SALES

- Sales
- Individual Device Sales
- Customers
- Membership / Loyalty

TRADE-IN

- Trade-In / Exchange
- Trade-In Valuation

SERVICE

- Repairs
- Refurbishments
- Repair Parts Usage

BRANCHES

- Branch Management
- Branch Stock
- Branch Transfers

REPORTS

- Stock Report
- Sales Report
- Profit/Loss Report
- Trade-In Report
- Repair Report
- Refurbishment Report
- Branch Report
- Purchase Report
- Customer Report

SETTINGS

- Company Settings
- Currency
- Tax
- Stock Settings
- Loyalty Settings
- Demo Data Reset

==================================================
6. DASHBOARD
==================================================

Create a highly useful management dashboard.

KPI cards:

- Total Stock Value
- Total Selling Value
- Today's Sales
- This Month's Sales
- Gross Profit
- Pending Repairs
- Devices in Refurbishment
- Trade-Ins This Month
- Low Stock Items
- Slow Moving Items
- Total Customers
- Total Branches

Charts:

1. Sales Trend
2. Profit Trend
3. Sales by Branch
4. Sales by Brand
5. New vs Used Device Sales
6. Trade-In Volume
7. Repair Status
8. Stock Aging
9. Top Selling Devices

Dashboard filters:

- Branch
- Date Range
- New / Used
- Category

All dashboard metrics must be calculated dynamically from stored data.

==================================================
7. MULTI-BRANCH MANAGEMENT
==================================================

Create complete branch CRUD.

Branch fields:

- Branch ID
- Branch Name
- Branch Code
- Address
- Phone
- Email
- Manager
- Status
- Opening Date

Actions:

- Add Branch
- View Branch
- Edit Branch
- Delete Branch
- Activate Branch
- Deactivate Branch

Branch detail page should show:

- Current Stock
- Stock Value
- Sales
- Profit
- Repairs
- Trade-Ins
- Refurbishments
- Customers

Create a global branch selector in the header.

==================================================
8. NEW GADGET MANAGEMENT
==================================================

Create a complete CRUD module for new gadgets.

Fields:

- Product ID
- Brand
- Model
- Category
- Variant
- Color
- Storage
- RAM
- SKU
- Barcode
- IMEI / Serial Number
- Purchase Cost
- Selling Price
- Current Stock
- Minimum Stock
- Supplier
- Branch
- Purchase Date
- Warranty Period
- Warranty Expiry
- Status
- Product Image
- Notes

Statuses:

- In Stock
- Reserved
- Sold
- Returned
- Defective
- Transferred

Features:

- Add
- View
- Edit
- Delete
- Search
- Filter
- Sort
- Pagination
- Export CSV
- View Details

==================================================
9. USED GADGET MANAGEMENT
==================================================

Create a separate used-device module.

Every individual used device should have its own record.

Fields:

- Device ID
- Brand
- Model
- Variant
- Color
- Storage
- RAM
- IMEI
- Serial Number
- Battery Health
- Physical Condition
- Display Condition
- Camera Condition
- Speaker Condition
- Microphone Condition
- Face ID / Fingerprint Status
- Network Status
- Original Box
- Accessories
- Purchase Cost
- Repair Cost
- Refurbishment Cost
- Total Cost
- Target Selling Price
- Actual Selling Price
- Expected Profit
- Actual Profit
- Supplier / Seller
- Acquisition Date
- Branch
- Status
- Photos
- Notes

Condition:

- Excellent
- Very Good
- Good
- Fair
- Poor

==================================================
10. IMEI / SERIAL NUMBER COSTING
==================================================

This is a critical feature.

Every individual device must be traceable using:

- IMEI
- Serial Number
- Device ID

Create a detailed device profile.

Financial calculation:

Purchase Cost
+ Trade-In Cost
+ Repair Cost
+ Refurbishment Cost
+ Spare Parts Cost
+ Other Cost
=
TOTAL COST

Profit:

Selling Price - Total Cost = PROFIT

Profit Margin:

Profit / Selling Price × 100

Display a financial summary:

- Purchase Cost
- Trade-In Cost
- Repair Cost
- Refurbishment Cost
- Spare Parts Cost
- Other Cost
- Total Cost
- Selling Price
- Profit
- Profit Margin

Create a device timeline:

- Acquired
- Inspected
- Repaired
- Refurbished
- Listed
- Sold

==================================================
11. TRADE-IN / EXCHANGE MANAGEMENT
==================================================

Create complete trade-in functionality.

Fields:

- Trade-In ID
- Customer
- Existing Device
- IMEI
- Brand
- Model
- Condition
- Estimated Market Value
- Trade-In Value
- Adjustment
- Final Value
- New Device
- Customer Payment
- Staff Member
- Branch
- Date
- Status
- Notes

Statuses:

- Pending Evaluation
- Approved
- Rejected
- Received
- Refurbishment
- Ready for Sale
- Sold

Create a Trade-In Valuation form.

Suggested calculation:

Market Value
- Condition Adjustment
- Repair Estimate
- Desired Margin
=
Suggested Trade-In Value

Allow staff to manually override the suggested value.

==================================================
12. REFURBISHMENT MANAGEMENT
==================================================

Create a refurbishment workflow.

Fields:

- Refurbishment ID
- Device ID
- IMEI
- Device
- Branch
- Technician
- Start Date
- Expected Completion
- Completion Date
- Refurbishment Cost
- Parts Cost
- Labor Cost
- Total Cost
- Condition Before
- Condition After
- Status
- Notes

Statuses:

- Pending
- In Progress
- Quality Check
- Completed
- Failed
- Ready for Sale

Show refurbishment history for each device.

==================================================
13. SPARE PARTS MANAGEMENT
==================================================

Create complete CRUD.

Fields:

- Part ID
- Part Name
- Part Number
- Category
- Compatible Brand
- Compatible Model
- Supplier
- Purchase Cost
- Selling Price
- Stock
- Minimum Stock
- Branch
- Barcode
- Location
- Status

Features:

- Add
- Edit
- Delete
- Search
- Filter
- Low Stock Alerts
- Stock Value
- Usage History

==================================================
14. REPAIR MANAGEMENT
==================================================

Create a complete repair ticket system.

Fields:

- Repair ID
- Customer
- Device
- IMEI
- Brand
- Model
- Problem Description
- Diagnosis
- Estimated Cost
- Parts Cost
- Labor Cost
- Total Cost
- Customer Price
- Technician
- Branch
- Received Date
- Expected Date
- Completion Date
- Status
- Warranty
- Notes

Statuses:

- Received
- Diagnosing
- Waiting for Approval
- Waiting for Parts
- In Progress
- Quality Check
- Ready for Pickup
- Completed
- Cancelled
- Returned

Create repair detail page with:

- Customer information
- Device information
- Problem
- Diagnosis
- Parts
- Labor
- Costs
- Payment
- Technician
- Timeline
- Status history

==================================================
15. INDIVIDUAL DEVICE SALES
==================================================

Every individual device sale must be traceable.

Sale fields:

- Invoice Number
- Sale Date
- Customer
- Device ID
- IMEI
- Product
- Purchase Cost
- Additional Costs
- Total Cost
- Selling Price
- Discount
- Final Selling Price
- Profit
- Payment Method
- Staff
- Branch

Payment methods:

- Cash
- Card
- Bank Transfer
- Mobile Payment
- Other

When a device is sold:

1. Change device status to Sold
2. Remove it from available inventory
3. Create sale record
4. Record revenue
5. Record profit
6. Add transaction to device history
7. Update dashboard metrics

==================================================
16. STOCK AGING
==================================================

Calculate stock age from acquisition/purchase date.

Categories:

- 0–30 Days
- 31–60 Days
- 61–90 Days
- 91–180 Days
- 181–365 Days
- 365+ Days

Show:

- Device
- IMEI
- Branch
- Purchase Date
- Days in Stock
- Cost
- Selling Price
- Status

Use color-coded aging indicators.

==================================================
17. SLOW MOVING STOCK
==================================================

Identify products/devices that have remained unsold for configurable periods.

Allow:

- 30 Days
- 60 Days
- 90 Days
- 120 Days
- 180 Days

Show:

- Product
- IMEI
- Days in Stock
- Cost
- Current Price
- Potential Profit
- Branch

Actions:

- View Device
- Edit Price
- Mark for Promotion
- Transfer Branch
- Mark Clearance

==================================================
18. STOCK TAKE
==================================================

Create a stock-taking module.

Allow users to:

- Start Stock Take
- Select Branch
- Select Category
- Record Physical Quantity
- Compare System Quantity
- Show Variance
- Approve Adjustment

Example:

System Quantity: 10
Physical Quantity: 8
Variance: -2

For individual devices allow:

- IMEI entry
- Serial Number entry
- Barcode entry

==================================================
19. STOCK ADJUSTMENT
==================================================

Create stock adjustment CRUD.

Fields:

- Adjustment ID
- Date
- Branch
- Product
- IMEI / Serial
- Previous Quantity
- Adjustment Quantity
- New Quantity
- Reason
- User
- Notes

Reasons:

- Damaged
- Lost
- Found
- Stock Take Difference
- Correction
- Internal Use
- Other

==================================================
20. PURCHASE ORDERS
==================================================

Create purchase order management.

Fields:

- PO Number
- Supplier
- Branch
- Order Date
- Expected Delivery
- Items
- Quantity
- Unit Cost
- Total
- Status
- Notes

Statuses:

- Draft
- Sent
- Partially Received
- Received
- Cancelled

Allow multiple products per purchase order.

Automatically calculate:

- Subtotal
- Discount
- Tax
- Grand Total

==================================================
21. PURCHASE INVOICES
==================================================

Fields:

- Invoice Number
- Supplier
- PO Number
- Invoice Date
- Due Date
- Branch
- Items
- Subtotal
- Discount
- Tax
- Total
- Paid
- Due
- Payment Status

Statuses:

- Unpaid
- Partially Paid
- Paid
- Overdue

==================================================
22. GOODS RECEIVED NOTE
==================================================

Create GRN functionality.

Fields:

- GRN Number
- PO Number
- Supplier
- Received Date
- Branch
- Received By
- Items
- Ordered Quantity
- Received Quantity
- Damaged Quantity
- Accepted Quantity
- Notes

When GRN is completed:

- Update stock
- Update PO status
- Add received stock
- For individual devices capture IMEI/Serial
- Record purchase cost
- Record condition

==================================================
23. SUPPLIER MANAGEMENT
==================================================

Create supplier CRUD.

Fields:

- Supplier ID
- Company Name
- Contact Person
- Phone
- Email
- Address
- Tax/VAT ID
- Payment Terms
- Status
- Notes

Supplier detail page:

- Purchase Orders
- Purchase Invoices
- Outstanding Balance
- Products Purchased
- Total Purchases

==================================================
24. BARCODE MANAGEMENT
==================================================

Create barcode management.

Features:

- Generate barcode values
- Assign barcode to products
- Search barcode
- View barcode
- Print-style barcode label preview

Search by:

- Barcode
- SKU
- IMEI
- Serial Number

Since this is frontend-only, create realistic dummy barcode values and a visual barcode-style representation using CSS/SVG/Canvas.

==================================================
25. CUSTOMER MANAGEMENT
==================================================

Create customer CRUD.

Fields:

- Customer ID
- Name
- Phone
- Email
- Address
- Date of Birth
- Customer Type
- Membership Level
- Total Purchases
- Total Spent
- Total Repairs
- Total Trade-Ins
- Loyalty Points
- Status

Customer detail page:

- Purchase History
- Repair History
- Trade-In History
- Loyalty Points
- Device History
- Outstanding Balances

==================================================
26. MEMBERSHIP / LOYALTY
==================================================

Create membership levels:

- Regular
- Silver
- Gold
- Platinum

Each level can have:

- Minimum Spend
- Discount Percentage
- Loyalty Point Multiplier
- Benefits

Create loyalty transaction history.

Example:

Sale: $500
Points Earned: 500

Allow:

- Earn Points
- Redeem Points
- Adjust Points
- View History

==================================================
27. REPORTS
==================================================

Create a professional reports section.

STOCK REPORT

Show:

- Current Stock
- Stock Value
- Stock by Branch
- Stock by Brand
- Stock by Category

SALES REPORT

Show:

- Daily Sales
- Monthly Sales
- Sales by Branch
- Sales by Product
- Sales by Employee
- New vs Used

PROFIT/LOSS REPORT

Show:

- Revenue
- Cost of Goods Sold
- Repair Costs
- Refurbishment Costs
- Spare Parts Costs
- Other Costs
- Gross Profit
- Net Profit

TRADE-IN REPORT

Show:

- Number of Trade-Ins
- Trade-In Value
- Devices Acquired
- Devices Sold
- Profit

REPAIR REPORT

Show:

- Repairs Received
- Completed
- Pending
- Revenue
- Parts Cost
- Labor Cost
- Profit

REFURBISHMENT REPORT

Show:

- Devices Refurbished
- Refurbishment Cost
- Parts Cost
- Labor Cost
- Selling Value
- Profit

BRANCH REPORT

Show:

- Sales
- Stock
- Stock Value
- Profit
- Repairs
- Trade-Ins
- Refurbishments

All reports should be dynamically calculated.

==================================================
28. CRUD ARCHITECTURE
==================================================

Every major entity must support:

- CREATE
- READ
- UPDATE
- DELETE

Create reusable JavaScript data functions.

Example:

addRecord()
getRecords()
getRecordById()
updateRecord()
deleteRecord()

Create a reusable storage service:

StorageService.save("devices", data);

StorageService.get("devices");

StorageService.update("devices", id, data);

StorageService.delete("devices", id);

All data should be stored in localStorage.

==================================================
29. DUMMY DATA
==================================================

Pre-populate the application with realistic fictional data.

Minimum:

- 4 branches
- 15 customers
- 10 suppliers
- 30 new devices
- 30 used devices
- 40 individual device records
- 20 spare parts
- 20 repair tickets
- 15 refurbishment records
- 20 trade-in records
- 20 sales
- 10 purchase orders
- 10 purchase invoices
- 10 GRNs
- 10 stock adjustments
- 10 loyalty transactions

Brands can include:

- Apple
- Samsung
- Google
- OnePlus
- Xiaomi
- Oppo
- Vivo
- Huawei

Use realistic fictional device models, prices, IMEI numbers and serial numbers.

All dummy information must be fictional.

==================================================
30. SEARCH / FILTER / SORT
==================================================

All major tables should support:

- Search
- Column sorting
- Pagination
- Status filtering
- Branch filtering
- Date filtering
- Brand filtering
- Category filtering

Create reusable table functionality where possible.

==================================================
31. MODAL FORMS
==================================================

Use modal dialogs for:

- Add
- Edit
- Delete Confirmation
- Quick View

Forms should include:

- Labels
- Required fields
- Validation
- Helpful placeholders
- Error messages
- Submit button
- Cancel button

After saving:

1. Update localStorage
2. Update UI
3. Show success toast

==================================================
32. DEVICE DETAIL PAGE
==================================================

Create a detailed individual device profile.

DEVICE INFORMATION

- Image
- Brand
- Model
- IMEI
- Serial Number
- Storage
- RAM
- Color
- Condition
- Status

FINANCIAL SUMMARY

- Purchase Cost
- Trade-In Cost
- Repair Cost
- Refurbishment Cost
- Parts Cost
- Other Cost
- Total Cost
- Selling Price
- Profit
- Margin

TIMELINE

- Purchased
- Trade-In
- Inspection
- Repair
- Refurbishment
- Listed
- Sold

HISTORY

- Cost Changes
- Status Changes
- Branch Transfers
- Repairs
- Parts
- Sales

==================================================
33. BRANCH TRANSFER
==================================================

Create branch transfer functionality.

Fields:

- Transfer ID
- From Branch
- To Branch
- Product
- IMEI / Serial
- Transfer Date
- Requested By
- Approved By
- Status
- Notes

Statuses:

- Requested
- Approved
- In Transit
- Received
- Cancelled

When completed:

- Remove device from source branch
- Add device to destination branch
- Update device history

==================================================
34. NOTIFICATIONS
==================================================

Create notification dropdown.

Examples:

- 5 devices are over 90 days old
- iPhone 14 stock is below minimum
- 3 repairs are ready for pickup
- 2 purchase invoices are overdue
- 4 devices require refurbishment QC

Generate notifications dynamically from dummy data.

==================================================
35. CSV EXPORT
==================================================

Allow exporting table/report data to CSV.

Create reusable function:

exportToCSV(data, filename)

Add Export buttons to:

- Inventory
- Sales
- Repairs
- Trade-ins
- Refurbishments
- Customers
- Suppliers
- Reports

==================================================
36. RESET DEMO DATA
==================================================

Create:

RESET DEMO DATA

Workflow:

1. Show confirmation
2. Clear application localStorage
3. Reinsert initial dummy data
4. Reload application

Also create:

CLEAR ALL DATA

with a stronger confirmation.

==================================================
37. SETTINGS
==================================================

Create settings page.

Settings:

- Company Name
- Company Logo
- Currency
- Tax Rate
- Default Branch
- Stock Aging Thresholds
- Low Stock Threshold
- Loyalty Settings
- Theme Preference

Persist settings using localStorage.

==================================================
38. CURRENCY
==================================================

Make currency configurable.

Default:

USD

Supported:

- USD
- EUR
- GBP
- BDT
- INR
- AED
- SAR

Create reusable currency formatter.

Example:

formatCurrency(value)

==================================================
39. USER INTERFACE COMPONENTS
==================================================

Use reusable components:

- KPI Cards
- Data Tables
- Charts
- Tabs
- Dropdowns
- Badges
- Tooltips
- Toasts
- Confirmation Modals
- Side Panels
- Detail Drawers
- Progress Bars
- Timelines
- Empty States
- Loading States

==================================================
40. IMAGE USAGE
==================================================

Use Unsplash images where useful for:

- Device thumbnails
- Store/branch imagery
- Dashboard visuals

Do not make core functionality dependent on remote images.

If an image fails to load, show a fallback placeholder.

==================================================
41. DEMO LOGIN
==================================================

Create a frontend-only demo login screen.

Credentials:

Email:
admin@example.com

Password:
admin123

This is NOT real authentication.

Store login state in localStorage.

Display example roles:

- Admin
- Manager
- Staff
- Technician

Frontend role restrictions may be simulated.

Clearly understand that this is only a frontend demo.

==================================================
42. DATA RELATIONSHIPS
==================================================

Create logical relationships.

Customer -> Sales
Customer -> Repairs
Customer -> Trade-ins

Supplier -> Purchase Orders
Purchase Order -> GRN
Purchase Order -> Purchase Invoice

Device -> Trade-in
Device -> Repair
Device -> Refurbishment
Device -> Sale
Device -> Branch
Device -> Cost History

Spare Part -> Repair

Branch -> Inventory
Branch -> Sales
Branch -> Repairs
Branch -> Trade-ins

Use IDs to establish relationships.

Avoid unnecessary duplication.

==================================================
43. FINANCIAL CALCULATIONS
==================================================

For individual devices:

Total Cost =
Purchase Cost
+ Trade-In Cost
+ Repair Cost
+ Refurbishment Cost
+ Parts Cost
+ Other Cost

Gross Profit =
Selling Price - Total Cost

Profit Margin =
Gross Profit / Selling Price × 100

For sales:

Final Selling Price =
Selling Price - Discount

All calculations must be dynamic.

Never hard-code calculated financial values.

==================================================
44. UX REQUIREMENTS
==================================================

The application should be understandable without documentation.

Use:

- Clear labels
- Helpful empty states
- Tooltips
- Confirmation messages
- Consistent terminology
- Status colors
- Human-readable dates
- Form validation

Avoid unnecessary complexity.

==================================================
45. FILE STRUCTURE
==================================================

Prefer a structure similar to:

/
├── index.html
├── css/
│   ├── style.css
│   ├── responsive.css
│   └── components.css
├── js/
│   ├── app.js
│   ├── data.js
│   ├── storage.js
│   ├── utils.js
│   ├── dashboard.js
│   ├── inventory.js
│   ├── sales.js
│   ├── tradein.js
│   ├── repair.js
│   ├── refurbishment.js
│   ├── purchasing.js
│   ├── customers.js
│   ├── suppliers.js
│   ├── branches.js
│   └── reports.js
└── assets/

If a single-page application architecture is more practical, implement view switching/routing using vanilla JavaScript.

Keep the code modular and maintainable.

==================================================
46. TECHNICAL REQUIREMENTS
==================================================

The application must actually work.

Example:

When creating a device:

1. Open Add Device modal
2. Enter information
3. Validate
4. Save to localStorage
5. Update inventory
6. Update dashboard
7. Show success notification
8. Display new record

When editing:

1. Load existing record
2. Populate form
3. Edit data
4. Save
5. Update localStorage
6. Refresh UI

When deleting:

1. Ask for confirmation
2. Delete record
3. Update localStorage
4. Refresh UI
5. Show toast

==================================================
47. IMPORTANT DEVICE WORKFLOW
==================================================

A device should be traceable through its complete lifecycle.

Example:

PURCHASED
    ↓
RECEIVED
    ↓
INSPECTED
    ↓
TRADE-IN / USED DEVICE
    ↓
REPAIR
    ↓
REFURBISHMENT
    ↓
QUALITY CHECK
    ↓
READY FOR SALE
    ↓
SOLD

Not every device needs every stage.

The system should maintain a history for each individual device.

==================================================
48. DASHBOARD CALCULATIONS
==================================================

Dashboard statistics must be generated from stored records.

For example:

Total Stock Value =
Sum of current inventory costs

Total Selling Value =
Sum of available inventory selling prices

Total Sales =
Sum of completed sales

Total Profit =
Sum of individual sale profits

Pending Repairs =
Count repairs where status is not Completed/Cancelled

Slow Moving Stock =
Devices exceeding configured aging threshold

Low Stock =
Products where current stock <= minimum stock

==================================================
49. RESPONSIVENESS
==================================================

Test the UI at:

- 1920px
- 1440px
- 1280px
- 1024px
- 768px
- 480px
- 375px

Make sure:

- No major horizontal overflow
- Sidebar works on mobile
- Tables remain usable
- Forms are responsive
- Modals fit screens
- Charts resize correctly

==================================================
50. ACCESSIBILITY
==================================================

Use:

- Semantic HTML
- Proper labels
- Keyboard-accessible buttons
- Visible focus states
- ARIA attributes where appropriate
- Good color contrast

==================================================
51. PERFORMANCE
==================================================

Keep the application lightweight.

Avoid unnecessary libraries.

Use modular JavaScript.

Avoid excessive DOM manipulation.

Use event delegation where practical.

Do not load huge external assets unnecessarily.

==================================================
52. CODE QUALITY
==================================================

Write clean maintainable code.

Avoid:

- Duplicate code
- Inline JavaScript where possible
- Global variables everywhere
- Hard-coded calculations
- Broken buttons
- Placeholder-only pages

Create reusable utilities for:

- Storage
- Formatting
- Tables
- Modals
- Toasts
- Validation
- CSV export
- Currency
- Dates
- IDs

==================================================
53. ERROR HANDLING
==================================================

Handle:

- Empty forms
- Invalid data
- Missing records
- Invalid numeric values
- Duplicate IMEI
- Duplicate Serial Number
- Duplicate SKU
- Duplicate barcode
- Missing customer
- Missing supplier
- Invalid relationships

Prevent duplicate IMEI and serial numbers for individual devices.

Show user-friendly error messages.

==================================================
54. TESTING CHECKLIST
==================================================

Before completing the project, test:

- Login
- Dashboard
- Add device
- Edit device
- Delete device
- Search device
- Filter device
- View device details
- Add customer
- Edit customer
- Delete customer
- Create sale
- Calculate profit
- Create trade-in
- Update trade-in
- Create repair
- Update repair status
- Create refurbishment
- Update refurbishment
- Add spare part
- Update spare part stock
- Create purchase order
- Create GRN
- Update stock
- Create stock adjustment
- Transfer device between branches
- Create supplier
- Create customer
- Loyalty points
- Generate reports
- Export CSV
- Reset demo data
- Refresh browser
- Verify localStorage persistence
- Responsive mobile layout

Fix all console errors.

Do not leave broken buttons.

Every visible action must work or be clearly disabled with an explanation.

==================================================
55. IMPORTANT: DO NOT FAKE FUNCTIONALITY
==================================================

Do NOT make buttons that simply show:

"Coming Soon"

for the major features.

Implement functional CRUD and workflows.

If a feature cannot be fully implemented because there is no backend, simulate the business logic locally using JavaScript and localStorage.

Examples:

- Database -> localStorage
- Backend API -> JavaScript functions
- Authentication -> frontend demo login
- Barcode generation -> SVG/CSS/Canvas
- Reports -> calculated from local data
- Notifications -> calculated from local data

==================================================
56. FINAL PRODUCT
==================================================

The finished application should feel like a real:

GADGET RETAIL
+
USED DEVICE
+
TRADE-IN
+
REFURBISHMENT
+
REPAIR
+
INVENTORY
+
PURCHASING
+
CUSTOMER
+
MULTI-BRANCH
+
PROFIT/LOSS
+
REPORTING

ERP / MANAGEMENT SYSTEM.

The first screen after demo login should be the Dashboard.

Prioritize:

1. FUNCTIONALITY
2. DATA RELATIONSHIPS
3. CRUD OPERATIONS
4. ACCURATE CALCULATIONS
5. GOOD UX
6. RESPONSIVE DESIGN
7. VISUAL POLISH

Do not build only the dashboard and placeholder pages.

Implement functional versions of all major modules using dummy data and localStorage.

==================================================
57. FINAL RESPONSE FROM THE CODING AGENT
==================================================

After completing the application, provide a concise summary containing:

- Files created
- Features implemented
- Demo login credentials
- localStorage collections used
- Major workflows implemented
- Known limitations caused by the no-backend requirement

Do not provide a long explanation.

Build the application now.
