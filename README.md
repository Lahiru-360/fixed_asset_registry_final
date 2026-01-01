# Fixed Asset Registry & Procurement Management System

A full-stack **Fixed Asset Registry and Procurement Management System** designed to model real-world enterprise workflows, from employee asset requests through procurement, asset capitalization, depreciation, and financial reporting.

This application prioritizes **correct accounting logic**, **clear role separation**, and **production-style workflows**, rather than simple CRUD functionality.

---

## Overview

The system manages the **complete lifecycle of a fixed asset**, including:

1. Employee asset requests
2. Administrative approval and quotation evaluation
3. Purchase order generation and vendor communication
4. Goods receipt confirmation (GRN)
5. Asset registration into the fixed asset register
6. Depreciation calculation
7. Financial reporting (Depreciation Schedules and SOFP)

---

## End-to-End Workflow

### 1. Employee Asset Request

Employees submit asset requests specifying:

* Asset name
* Quantity
* Business justification

Employees can track the request status throughout the approval process.

---

### 2. Admin Review and Approval

Administrators review submitted requests and either approve or reject them.

* Approved requests move to the quotation stage
* Status changes are visible to employees for transparency

---

### 3. Quotation Management

For each approved request:

* Multiple vendor quotations can be uploaded
* Each quotation includes:

  * Vendor name
  * Vendor email
  * Price
  * Uploaded quotation document

One quotation is selected as the **final quotation**.
Once finalized, quotation details are locked to preserve audit integrity.

---

### 4. Purchase Order (PO)

A Purchase Order is generated from the finalized quotation.

Administrators can:

* Download the PO as a PDF
* Send the PO directly to the vendor via email

The PO lifecycle is tracked as:

* Created
* Sent
* Received

---

### 5. Goods Received Note (GRN)

Upon delivery confirmation:

* Goods receipt is recorded by the admin
* The system generates:

  * A production-safe GRN number
  * A GRN PDF document

Each GRN is permanently linked to its corresponding PO.

---

### 6. Asset Registration

Received items are registered as **individual asset records**.

Example:
If quantity = 5, the system creates **5 separate asset entries**.

Each asset includes:

* Cost
* Category
* Useful life
* Depreciation rate
* Residual value
* Acquisition date

Assets are now part of the official fixed asset register.

---

### 7. Depreciation Engine

The system supports:

* Straight-line depreciation
* Mid-month convention

  * 50% depreciation applied in the acquisition month

Features include:

* Monthly depreciation schedules
* Automatic detection of fully depreciated assets
* Accurate accumulated depreciation and NBV calculations

---

### 8. Financial Reporting

The system generates:

* Monthly Depreciation Reports (PDF)
* Statement of Financial Position (SOFP), grouped by asset category

Each SOFP displays:

* Total cost
* Accumulated depreciation
* Net book value (NBV)

Reports can be generated for any selected reporting period.

---

## System Architecture

### Authentication

* Firebase Authentication
* Email Verification
* Secure token-based access
* Role-based authorization (Admin / Employee)
* Forgot Password

---

### File Storage

* Supabase Storage
* Used for:

  * Vendor quotations
  * Purchase Orders
  * GRNs

Files are accessed through secure backend-controlled routes.

---

### Backend

* Node.js with Express
* MVC architecture
* PostgreSQL database
* Server-side pagination, filtering, and searching
* Production-safe sequence generation for PO and GRN numbers

---

### Frontend

* React
* Separate dashboards for Admins and Employees
* URL-based state persistence
* Search, filter, and pagination across major tables
* Responsive layouts designed for real-world datasets

---

## Accounting and Design Principles

* Real-world procurement and capitalization flow
* Clear audit trail:
  Request → Quotation → PO → GRN → Asset
* No asset backdating
* Correct handling of acquisition dates
* Industry-aligned depreciation logic
* Separation between operational workflows and financial reporting

---

## Purpose of This Project

This is **not a simple demo application**.

It demonstrates:

* Understanding of enterprise procurement workflows
* Correct application of accounting concepts
* Strong backend–frontend contract discipline
* Attention to performance, UX, and data consistency
* Ability to design systems that evolve across operational and financial stages

---

## Tech Stack

* Frontend: React
* Backend: Node.js, Express
* Database: PostgreSQL
* Authentication: Firebase Authentication
* Storage: Supabase Storage
* PDF Generation: PDFKit
* Email: Nodemailer (Gmail SMTP)

---

## Possible Enhancements

* Asset disposal and revaluation
* Multi-level approval workflows
* Serial number tracking
* IFRS-aligned depreciation methods
* Multi-currency support

**Author**: Lahiru Hettiarachchi (Developer)
