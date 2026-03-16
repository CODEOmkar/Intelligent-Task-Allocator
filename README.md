# Intelligent Task Allocator (ITA)

Optimize workforce efficiency, streamline project execution, and balance workloads effortlessly.

Intelligent Task Allocator (ITA) is a robust, enterprise-grade full-stack management application designed to eliminate bottlenecks in team coordination. Whether you are leading a massive software development lifecycle, tracking cross-departmental initiatives, or balancing resource allocation, ITA provides a seamless, transparent, and secure dashboard to govern every phase of a project.

## 🚀 Purpose & Vision

The core purpose of ITA is to bring clarity and accountability to enterprise workflows. By supplying a centralized platform for task tracking and intelligent assignment, ITA ensures that:

- High-priority tasks are never delayed.
- The right employee with the correct skill set is matched to the specific task.
- Employees are protected from burnout via real-time utilization analytics.
- Department Heads and Project Managers instantly grasp operational health.

## ✨ Exceptional User Experience (UX)

The frontend is built with Angular 16, focusing on rapid rendering, sophisticated aesthetics, and intuitive corporate workflows.

### 🎨 Intuitive Dashboards
- **Role-Based Views**: Tailored interfaces specifically for Project Managers, Department Heads, Team Leads, and regular Employees.
- **At-a-Glance Metrics**: Instantly see team capacity, pending approvals, and project completion rates within visually distinct KPI cards.
- **Visual Cues**: Color-coded utilization bars (Green for optimal, Red for overloaded, Gray for underutilized) make resource management immediately understandable.

### 💸 Smart Task Splitting & Allocation
ITA goes beyond basic assignment boards:
- **Skill Matching**: Automatically filter and assign tasks based on an employee’s documented technical skills and role requirements.
- **Capacity Tracking**: Ensure new task assignments respect weekly capacity limits to prevent overloading.
- **Hierarchical Approvals**: Advanced workflow enabling Department Heads and Project Managers to approve new users before task allocation.

### 📱 Fully Responsive Corporate Design
- **Adaptive Interfaces**: A refined layout with collapsible sidebars that works perfectly on large external monitors and portable laptops.
- **Interactive Elements**: Smooth CSS transitions, clean corporate UI structures, and distinct card components create a premium, robust app-like feel.

### 🤝 Enterprise Management
- **Cross-Functional Teams**: Create and manage detailed Teams under unified Departments, grouping employees by their distinct operational units.
- **Comprehensive Profiles**: Drill down into individual employee profiles to adjust capacities, update skills, or review assigned tickets.

## 🛡️ Backend Robustness & Architecture

The backend is engineered for reliability, security, and complex transactional scalability using Java and Spring Boot.

### 🔒 Enterprise-Grade Security
- **JWT Authentication**: Stateless, secure user sessions protected by JSON Web Tokens via `jjwt` library.
- **Password Hashing**: Industry-standard Spring Security integration ensures user credentials are encrypted and never exposed in plain text.
- **Role-Based Access Control (RBAC)**: Strict endpoints guarded at the controller level prevent unauthorized data manipulation based on employee rank.

### ⚙️ Reliable Data Integrity
- **Relational Integrity**: Complete JPA/Hibernate entity mappings enforcing foreign key integrities between Projects, Tasks, Users, and Departments.
- **Atomic Operations**: Spring transaction management ensures complex assignments either succeed fully or rollback smoothly, preserving total data consistency.
- **Scalable Architecture**: A clean separation of Entities, Repositories, Services, and REST Controllers allows the codebase to scale cleanly for future enterprise demands.

## 🛠️ Technology Stack

**Frontend**
- **Framework**: Angular (v16+)
- **CLI**: Angular CLI
- **Styling**: Custom Vanilla CSS with robust CSS variable tokenization
- **State & Routing**: RxJS & Angular Router
- **API Integration**: HttpClient Module

**Backend**
- **Runtime**: Java 17
- **Framework**: Spring Boot 3.2+ (Spring Web, Spring Security, Spring Data JPA)
- **Database**: MySQL 8+
- **ORM**: Hibernate
- **Auth**: JWT (JSON Web Tokens)
- **Build Tool**: Maven
