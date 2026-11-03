# Public Grievance Redressal Portal (PGRP)

An enterprise-grade, transparent, and responsive full-stack civic complaint management web application built for municipal authorities and citizens.

---

## 🏛️ Project Overview

The **Public Grievance Redressal Portal** provides a transparent, accountable, and centralized platform connecting citizens with municipal departments and administrative authorities. Citizens can report civic infrastructure breakdowns (such as road damage, contaminated water, overflowing garbage, and broken streetlights), attach photographic evidence, track status in real time via unique reference IDs, and provide audited feedback upon resolution.

Municipal engineers and department officers receive filtered work queues, dispatch field maintenance squads, post progress updates, and mark grievances resolved. Administrators oversee city-wide resolution metrics, assign complaints to specific divisions, manage officers, configure categories, and export audit reports.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js (v18+) with Vite
- **Language:** JavaScript (ES6+), HTML5, CSS3
- **Routing:** React Router DOM (v6)
- **API Client:** Axios (configured with JWT interceptors)
- **UI Architecture:** Custom Civic Design System, accessible components, responsive grid, dynamic SVG charts, step-by-step audit timelines

### Backend
- **Framework:** Python 3.11+, Django 5+, Django REST Framework 3.14+
- **Authentication:** Custom JSON Web Tokens (PyJWT) with role-based permissions
- **File & Media Handling:** Pillow for civic photographic evidence storage
- **CORS Support:** `django-cors-headers`

### Database
- **Engine:** MySQL (Database: `grievance_portal`)
- **Connector:** PyMySQL (`pymysql.install_as_MySQLdb()`)
- **Schema Management:** Django ORM Migrations & Standalone `grievance_portal.sql` DDL
- **Resilience:** Automatic fallback to SQLite if MySQL daemon is temporarily unreachable during offline testing

---

## 👥 User Roles & Seed Demo Credentials

The database comes pre-seeded with realistic civic records, departments, and credentials for all three roles:

| Role | Name | Email | Password | Access / Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Chief Admin Officer | `admin@pgrp.gov.in` | `Admin@123` | City-wide triage, user management, department administration, reports |
| **Department Officer** | Er. Vikram Malhotra (Roads) | `officer.roads@pgrp.gov.in` | `Officer@123` | Roads & Bridges inspection queue, status updates, repairs |
| **Department Officer** | Er. Venkat Raman (Water) | `officer.water@pgrp.gov.in` | `Officer@123` | Water supply & pipeline contamination queue, remarks |
| **Citizen** | Ramesh Kumar | `citizen.ramesh@gmail.com` | `Citizen@123` | Lodge complaints, track status, reopen resolved grievances |
| **Citizen** | Ananya Singh | `citizen.ananya@gmail.com` | `Citizen@123` | Lodge complaints, upload photos, submit 5-star feedback |

> 💡 **Tip:** The sign-in page features **One-Click Quick Login** buttons to fill these credentials instantly.

---

## 🗄️ Database Architecture & Tables

The schema is mapped to the MySQL database named `grievance_portal`:

1. **`Users`**: Custom user identity table storing role (`citizen`, `officer`, `admin`), designation, department foreign key, phone number, and address.
2. **`Departments`**: Municipal divisions (`ROADS`, `WATER`, `WASTE`, `DRAIN`, `ELECT`, `HEALTH`), head officer details, and contact directory.
3. **`ComplaintCategories`**: 8 predefined civic complaint types with default department routing and SLA resolution limits.
4. **`Complaints`**: Unique tracking IDs (`PGRP-YYYYMM-XXXX`), description, evidence photo, geolocation/address, priority, current status, authority remarks, resolution notes, and reopen reasons.
5. **`ComplaintAssignments`**: Audit log of administrative dispatches to departments and specific officers.
6. **`ComplaintHistory`**: Comprehensive timeline capturing every status change, actor, timestamp, and remark.
7. **`Feedback`**: Citizen satisfaction ratings (1–5 stars) and review comments for resolved grievances.

---

## 📂 Project Directory Structure

```text
PublicGrievancePortal/
│
├── backend/
│   ├── config/
│   │   ├── __init__.py       # PyMySQL installer hook
│   │   ├── settings.py       # Django settings, MySQL config, JWT & CORS
│   │   ├── urls.py           # Root URL dispatch
│   │   └── wsgi.py           # WSGI entry point
│   ├── users/                # User authentication, profiles, role permissions
│   ├── departments/          # Municipal department management
│   ├── complaints/           # Grievance submission, triage, audit history
│   ├── feedback/             # Citizen resolution ratings & reviews
│   ├── media/                # Storage for uploaded evidence photographs
│   ├── manage.py             # Django management CLI
│   ├── requirements.txt      # Python dependencies
│   ├── seed_data.py          # Database seeder with realistic test data
│   └── grievance_portal.sql  # Complete MySQL DDL schema and seed queries
│
├── frontend/
│   ├── public/               # Public assets
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, StatusBadge, PriorityBadge, ProtectedRoute
│   │   ├── context/          # AuthContext (JWT storage & session management)
│   │   ├── layouts/          # DashboardLayout
│   │   ├── pages/            # All 15 required pages
│   │   ├── services/         # Axios API clients
│   │   ├── App.jsx           # Master route configuration
│   │   ├── App.js            # Module entry
│   │   ├── index.jsx         # React DOM mount point
│   │   └── index.css         # Gov Civic design stylesheet
│   ├── index.html            # Vite HTML template
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite build & proxy configuration
│
└── README.md
```

---

## 📄 Complete List of Pages (15 Pages)

1. **Home Page (`/`)**: Civic hero banner, quick tracking ID search bar, live city statistics ribbon, 8 civic categories overview, 4-step workflow guide, role portal shortcuts.
2. **Citizen Registration Page (`/register`)**: New citizen onboarding with input validation and instant account generation.
3. **Login Page (`/login`)**: Secure authentication with role-based auto-routing and 1-click demo credential autofill.
4. **Citizen Dashboard (`/citizen/dashboard`)**: Metric cards (Total, Pending, In Progress, Resolved), "+ Lodge Grievance" CTA, recent submissions table, search and status filter.
5. **Submit Complaint Page (`/citizen/submit-complaint`)**: Category selection (8 predefined types), title, detailed description, landmark, address, photographic evidence upload with preview.
6. **My Complaints Page (`/citizen/my-complaints`)**: Complete historical repository of user complaints with category and status dropdown filters.
7. **Complaint Details and Tracking Page (`/complaints/:id` & `/track/:id`)**: Visual stepper progress bar, evidence photo preview, department notes, complete audit history log, citizen feedback submission modal, reopen complaint modal.
8. **Officer Dashboard (`/officer/dashboard`)**: Departmental action queue, urgent high-priority alert banner, workload metrics.
9. **Assigned Complaints Page (`/officer/assigned-complaints`)**: Engineering workspace table with priority/status filters, "assigned to me" toggle, and quick status/remarks update modal.
10. **Admin Dashboard (`/admin/dashboard`)**: Municipal command center, top metric cards, SVG-based category volume bars, department workload distribution chart, recent submissions.
11. **Manage Users Page (`/admin/users`)**: Citizen and officer directory, role filters, search bar, active/deactivated status toggling, and "Add Department Officer" modal.
12. **Manage Departments Page (`/admin/departments`)**: Municipal boards overview, head engineer details, active workload counts, create/edit department modal, toggle active status.
13. **Complaint Assignment Page (`/admin/assignments`)**: Administrative triage center, department and officer dispatch, priority setting, administrative directives.
14. **Reports and Analytics Page (`/admin/reports`)**: Executive scorecard, resolution rates, category volume analysis, dynamic CSV report export, and printable audit sheet.
15. **User Profile Page (`/profile`)**: Account details, designation/role badge, contact updates (name, phone, address), secure password change form.

---

## 🚀 Installation & Setup Instructions

### 1. Prerequisites
- Python 3.10+
- Node.js v18+ and npm
- MySQL Server 8.0+ (Optional; app includes resilient SQLite fallback if MySQL is offline)

---

### 2. Database Setup (MySQL)

1. Start your local MySQL server.
2. Log in to MySQL and create the database:
   ```sql
   CREATE DATABASE grievance_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. *(Optional direct SQL import)*:
   ```bash
   mysql -u root -p grievance_portal < backend/grievance_portal.sql
   ```

---

### 3. Backend Setup (Django & DRF)

1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure database connection parameters in environment or `backend/config/settings.py` (Default: `DB_NAME='grievance_portal'`, `DB_USER='root'`, `DB_PASSWORD=''`, `DB_HOST='localhost'`, `DB_PORT='3306'`).
5. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. Populate seed data (categories, departments, demo accounts, sample grievances):
   ```bash
   python seed_data.py
   ```
7. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
   *The backend will be live at `http://127.0.0.1:8000`.*

---

### 4. Frontend Setup (React.js & Vite)

1. Open a new terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:3000` or `http://localhost:5173`.*

---

## 🔌 Core REST API Endpoints

### Authentication & Users (`/api/auth/`)
- `POST /api/auth/register/` - Citizen account registration
- `POST /api/auth/login/` - User authentication (returns user record & JWT token)
- `GET /api/auth/profile/` - Fetch authenticated user details
- `PUT /api/auth/profile/` - Update profile details (phone, address, name)
- `POST /api/auth/change-password/` - Update password
- `GET /api/auth/officers/` - List department officers (optional department filter)
- `GET /api/auth/admin/users/` - Admin user directory (filter by role & search)
- `POST /api/auth/admin/users/` - Admin creates new department officer
- `PATCH /api/auth/admin/users/<id>/` - Admin toggles user active status

### Departments (`/api/departments/`)
- `GET /api/departments/` - List active municipal departments
- `POST /api/departments/` - Admin adds department
- `PUT /api/departments/<id>/` - Admin updates department details
- `POST /api/departments/<id>/toggle_status/` - Admin enables/disables department

### Complaints & Triage (`/api/complaints/`)
- `GET /api/complaints/` - List complaints scoped to user role & filters
- `POST /api/complaints/` - Citizen lodges new complaint (multipart with image)
- `GET /api/complaints/<id>/` - Detailed complaint file with history and feedback
- `GET /api/complaints/track/<tracking_id>/` - Lookup by public tracking ID
- `POST /api/complaints/<id>/assign/` - Admin assigns department, officer, priority
- `POST /api/complaints/<id>/update_status/` - Officer/Admin updates status & remarks
- `POST /api/complaints/<id>/reopen/` - Citizen reopens grievance with explanation
- `GET /api/complaints/categories/` - Predefined civic categories
- `GET /api/complaints/stats/dashboard/` - Real-time role-specific dashboard metrics
- `GET /api/complaints/reports/analytics/` - Comprehensive performance report data

### Feedback (`/api/feedback/`)
- `POST /api/feedback/submit/` - Citizen submits 1–5 star rating and comments
- `GET /api/feedback/complaint/<complaint_id>/` - Fetch feedback for a complaint

---

## 🔒 Security & Data Integrity

- **Password Encryption:** Passwords are hashed using Django's PBKDF2 with SHA-256 algorithm.
- **Session Protection:** PyJWT tokens expire automatically after 7 days and validate every API call.
- **Role Scoping:**
  - Citizens can only inspect or modify their own grievances.
  - Department officers can only update grievances assigned to their department.
  - Administrators maintain governance over accounts and triage.
- **Media Validation:** Image uploads validate file size (≤ 5MB) and mime-types.
- **Safe Account Management:** User deletion uses deactivation flags, ensuring existing complaint audit logs and history references remain intact.

---

## 🧪 Verification & Acceptance Testing

1. **Citizen Flow:**
   - Sign in as `citizen.ramesh@gmail.com` / `Citizen@123`.
   - Click **"+ Lodge Grievance"**, select "Road Damage", fill location, upload a photo, and submit.
   - Note the generated tracking ID (e.g., `PGRP-202611-XXXX`).
   - Track progress in **"My Grievances"** and inspect the audit timeline.
2. **Administrator Triage:**
   - Sign in as `admin@pgrp.gov.in` / `Admin@123`.
   - Open **"Grievance Triage & Assignment"** (`/admin/assignments`).
   - Locate the newly submitted grievance, click **"Assign Now"**, choose "Roads & Bridges Department", assign Officer Vikram Malhotra, and set priority to "High".
3. **Officer Action:**
   - Sign in as `officer.roads@pgrp.gov.in` / `Officer@123`.
   - Open **"Department Grievance Queue"** (`/officer/assigned-complaints`).
   - Click **"Update Status"**, select "In Progress", add field inspection notes, and save.
   - Click **"Update Status"** again, select "Resolved", add resolution notes, and save.
4. **Citizen Audit & Feedback:**
   - Sign back in as the citizen.
   - Check the complaint details page—stepper indicates **"Resolved"** with officer remarks.
   - Click **"Rate Resolution"**, give 5 stars with comments, and submit.
