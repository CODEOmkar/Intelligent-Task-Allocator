# TaskFlow — Intelligent Task Allocator
## Complete Setup Guide for Local Development

---

## PROJECT STRUCTURE

```
taskflow/
├── task-allocator-backend/       ← Spring Boot (Java 17)
│   ├── src/main/java/com/taskalloc/
│   │   ├── config/               (Security, DataInitializer)
│   │   ├── controller/           (REST API endpoints)
│   │   ├── dto/                  (Data Transfer Objects)
│   │   ├── entity/               (JPA Entities)
│   │   ├── enums/                (Enums)
│   │   ├── exception/            (Global exception handler)
│   │   ├── repository/           (JPA Repositories)
│   │   ├── security/             (JWT Provider, Filter)
│   │   └── service/              (Business Logic)
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── database-setup.sql
│   └── pom.xml
│
└── task-allocator-frontend/      ← Angular 16
    ├── src/app/
    │   ├── auth/                 (Login component)
    │   ├── core/                 (Services, Guards, Models)
    │   ├── modules/              (All page modules)
    │   └── shared/               (Reusable components)
    ├── proxy.conf.json
    ├── angular.json
    └── package.json
```

---

## PREREQUISITES — INSTALL THESE FIRST

### 1. Java Development Kit (JDK 17)
- Download: https://adoptium.net/temurin/releases/?version=17
- Choose: **Eclipse Temurin 17 (LTS)** → your OS → JDK → .msi (Windows) or .pkg (Mac)
- Install and verify:
  ```bash
  java -version
  # Should show: openjdk version "17.x.x"
  ```

### 2. Apache Maven 3.8+
- Download: https://maven.apache.org/download.cgi
- Choose: **Binary zip archive** (e.g., `apache-maven-3.9.6-bin.zip`)
- **Windows**: Extract to `C:\Program Files\Apache\maven`, add `C:\Program Files\Apache\maven\bin` to PATH
- **Mac/Linux**: 
  ```bash
  brew install maven           # Mac with Homebrew
  sudo apt install maven       # Ubuntu/Debian
  ```
- Verify:
  ```bash
  mvn -version
  # Should show: Apache Maven 3.x.x
  ```

### 3. MySQL 8.0+
- Download: https://dev.mysql.com/downloads/mysql/
- **Windows**: Use the MySQL Installer, select "MySQL Server" and "MySQL Workbench"
- **Mac**: `brew install mysql` then `brew services start mysql`
- **Ubuntu**: `sudo apt install mysql-server` then `sudo systemctl start mysql`
- Set root password during setup or run:
  ```bash
  mysql_secure_installation
  ```
- Verify:
  ```bash
  mysql -u root -p
  # Enter password, you should see mysql> prompt
  ```

### 4. Node.js 18+ and npm
- Download: https://nodejs.org/en/download/ → Choose LTS version (18.x or 20.x)
- Verify:
  ```bash
  node -v    # Should show v18.x.x or v20.x.x
  npm -v     # Should show 9.x.x or 10.x.x
  ```

### 5. Angular CLI 16
```bash
npm install -g @angular/cli@16
ng version  # Should show Angular CLI: 16.x.x
```

---

## STEP-BY-STEP SETUP

### STEP 1 — Copy the Project Files

Place the two folders side by side:
```
C:\Projects\taskflow\task-allocator-backend\
C:\Projects\taskflow\task-allocator-frontend\
```
(Or any path — just avoid spaces in the path on Windows)

---

### STEP 2 — Set Up the MySQL Database

**Option A: Using MySQL Command Line**
```bash
# Open terminal/cmd and login to MySQL
mysql -u root -p

# Run inside MySQL shell:
CREATE DATABASE task_allocator_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench → Connect to Local instance
2. Click the SQL icon (new query tab)
3. Type: `CREATE DATABASE task_allocator_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
4. Press Ctrl+Enter (or click the lightning bolt)

---

### STEP 3 — Configure Database Credentials in Backend

Open: `task-allocator-backend/src/main/resources/application.properties`

```properties
# Change these two lines to match your MySQL setup:
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE
```

> **If your MySQL root has no password**, set: `spring.datasource.password=`  
> **If you use a different user**, update both username and password accordingly.

---

### STEP 4 — Start the Backend (Spring Boot)

Open a terminal in the `task-allocator-backend` folder:

```bash
# Navigate to backend folder
cd task-allocator-backend

# Download dependencies and build (first time takes 2-3 minutes)
mvn clean install -DskipTests

# Run the application
mvn spring-boot:run
```

**You should see output like:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
...
Started TaskAllocatorApplication in 4.321 seconds
=== Default data initialized ===
Login: pm.admin / password123
Login: dev.head / password123
Login: backend.lead / password123
Login: john.dev / password123
```

The backend is now running on **http://localhost:8080**

> **If you get a port conflict:** In `application.properties`, change `server.port=8080` to `server.port=8090` and update `proxy.conf.json` in the frontend accordingly.

---

### STEP 5 — Start the Frontend (Angular)

Open a **NEW terminal** in the `task-allocator-frontend` folder:

```bash
# Navigate to frontend folder
cd task-allocator-frontend

# Install npm dependencies (first time takes 1-2 minutes)
npm install

# Start the Angular dev server
npm start
```

**You should see:**
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

The frontend is now running on **http://localhost:4200**

---

### STEP 6 — Open the Application

Open your browser and go to: **http://localhost:4200**

You'll see the TaskFlow login page. Use any of these demo accounts:

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Project Manager | `pm.admin` | `password123` | Full access — create projects, manage all |
| Department Head | `dev.head` | `password123` | Manage teams, view employees, set requirements |
| Team Lead | `backend.lead` | `password123` | Assign employees, monitor workload |
| Employee | `john.dev` | `password123` | View own tasks, update profile |

---

## COMMON ERRORS AND FIXES

### ❌ Error: `Communications link failure` (MySQL Connection)
**Cause**: MySQL is not running or wrong credentials
```bash
# Start MySQL:
# Windows: net start mysql
# Mac: brew services start mysql  
# Linux: sudo systemctl start mysql

# Verify credentials in application.properties match your MySQL setup
```

### ❌ Error: `Access denied for user 'root'@'localhost'`
**Cause**: Wrong MySQL password in application.properties
```bash
# Reset MySQL root password:
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
# Then update application.properties accordingly
```

### ❌ Error: `Port 8080 is already in use`
**Cause**: Another application is using port 8080
```bash
# Windows: find and kill the process
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F

# Or just change the port in application.properties:
server.port=8081
# And in frontend proxy.conf.json change target to http://localhost:8081
```

### ❌ Error: `JAVA_HOME not set` or `mvn not found`
**Cause**: Java or Maven not in PATH
- **Windows**: Search "Environment Variables" → Edit System Variables → add Java bin and Maven bin to PATH
- **Mac/Linux**: Add to `~/.bash_profile` or `~/.zshrc`:
  ```bash
  export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
  export PATH=$JAVA_HOME/bin:$PATH
  ```

### ❌ Error: `Module not found` or `Cannot find module '@angular/core'`
**Cause**: node_modules missing or corrupted
```bash
cd task-allocator-frontend
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error: `Unknown column 'user0_.username' in 'field list'`
**Cause**: Database schema out of sync
```bash
# In application.properties, temporarily change:
spring.jpa.hibernate.ddl-auto=create
# Start the app once, then change back to:
spring.jpa.hibernate.ddl-auto=update
# And restart
```

### ❌ Frontend shows "0 employees" or blank data
**Cause**: Backend not running or CORS issue
- Verify backend is running: open http://localhost:8080/api/auth/me in browser
- Check browser console (F12) for error messages
- Ensure proxy.conf.json target points to correct backend port

---

## API ENDPOINTS REFERENCE

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/projects | All projects |
| POST | /api/projects | Create project |
| GET | /api/tasks | All tasks |
| POST | /api/tasks/assign | Assign employee to task |
| GET | /api/users/employees | All employees |
| GET | /api/users/available | Available employees |
| GET | /api/users/filter | Filter employees |
| GET | /api/workload/employee/{id}/year/{year} | Workload trend |
| GET | /api/departments | All departments |
| GET | /api/teams | All teams |
| GET | /api/skills | All skills |

---

## TECH STACK SUMMARY

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Spring Boot | 3.2.3 |
| Security | Spring Security + JWT | - |
| Database ORM | Spring Data JPA / Hibernate | - |
| Database | MySQL | 8.0+ |
| Frontend | Angular | 16.2.x |
| Styling | Pure CSS (no Bootstrap) | - |
| Auth | JWT (jjwt 0.11.5) | - |
| Java | OpenJDK | 17 |

---

## DEFAULT ROLES AND CAPABILITIES

| Feature | PM | Dept Head | Team Lead | Employee |
|---------|----|-----------|-----------|----|
| Create Projects | ✓ | | | |
| Create Tasks | ✓ | ✓ | ✓ | |
| Assign Employees | ✓ | ✓ | ✓ | |
| Add/Manage Employees | ✓ | ✓ | | |
| Manage Departments | ✓ | ✓ | | |
| Manage Teams | ✓ | ✓ | | |
| Manage Skills | ✓ | ✓ | | |
| View Workload Dashboard | ✓ | ✓ | ✓ | |
| View Own Assignments | ✓ | ✓ | ✓ | ✓ |
| Update Own Profile | ✓ | ✓ | ✓ | ✓ |
| Update Own Availability | ✓ | ✓ | ✓ | ✓ |

---

## RUNNING IN PRODUCTION (Optional)

### Build Backend JAR:
```bash
cd task-allocator-backend
mvn clean package -DskipTests
java -jar target/task-allocator-backend-1.0.0.jar
```

### Build Frontend for Production:
```bash
cd task-allocator-frontend
ng build --configuration production
# Output in dist/ folder — serve with any web server (nginx, Apache)
```

---

*TaskFlow v1.0.0 — Built with Spring Boot 3.2 + Angular 16 + MySQL 8*
