package com.ita.config;

import com.ita.entity.*;
import com.ita.enums.*;
import com.ita.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepo;
    @Autowired private DepartmentRepository deptRepo;
    @Autowired private TeamRepository teamRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private TaskRepository taskRepo;
    @Autowired private TaskAssignmentRepository assignRepo;
    @Autowired private PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) {
            printCredentials();
            return;
        }

        // ===== SKILLS =====
        Skill java = skill("Java", "Backend");
        Skill spring = skill("Spring Boot", "Backend");
        Skill angular = skill("Angular", "Frontend");
        Skill react = skill("React", "Frontend");
        Skill sql = skill("SQL/MySQL", "Database");
        Skill docker = skill("Docker", "DevOps");
        Skill figma = skill("Figma/UI Design", "UI/UX");
        Skill testing = skill("Manual Testing", "QA");
        Skill python = skill("Python", "Backend");
        Skill js = skill("JavaScript", "Frontend");

        // ===== DEPARTMENTS =====
        Department devDept = dept("Development", "Software development team");
        Department qaDept = dept("Quality Assurance", "Testing and quality control");
        Department devOpsDept = dept("DevOps", "Infrastructure and deployment");
        Department uiDept = dept("UI/UX Design", "User interface and experience design");

        // ===== PROJECT MANAGER =====
        User pm = user("projectmanager@mail.com", "projectmanager123",
            "Rahul", "Sharma", UserRole.PROJECT_MANAGER, null, null,
            Set.of(java, spring), 10, ApprovalStatus.APPROVED);

        // ===== DEPARTMENT HEADS =====
        User devHead = user("development@mail.com", "development123",
            "Priya", "Patel", UserRole.DEPARTMENT_HEAD, devDept, null,
            Set.of(java, spring), 8, ApprovalStatus.APPROVED);
        User qaHead = user("qualityassurance@mail.com", "qualityassurance123",
            "Amit", "Singh", UserRole.DEPARTMENT_HEAD, qaDept, null,
            Set.of(testing), 7, ApprovalStatus.APPROVED);
        User devOpsHead = user("devops@mail.com", "devops123",
            "Sneha", "Kumar", UserRole.DEPARTMENT_HEAD, devOpsDept, null,
            Set.of(docker), 6, ApprovalStatus.APPROVED);
        User uiHead = user("uiuxdesign@mail.com", "uiuxdesign123",
            "Neha", "Gupta", UserRole.DEPARTMENT_HEAD, uiDept, null,
            Set.of(figma), 5, ApprovalStatus.APPROVED);

        // Update dept heads
        devDept.setHead(devHead); deptRepo.save(devDept);
        qaDept.setHead(qaHead); deptRepo.save(qaDept);
        devOpsDept.setHead(devOpsHead); deptRepo.save(devOpsDept);
        uiDept.setHead(uiHead); deptRepo.save(uiDept);

        // ===== TEAMS =====
        Team backendTeam = team("Backend Team", devDept, null, "Java/Spring Boot backend");
        Team frontendTeam = team("Frontend Team", devDept, null, "Angular/React frontend");
        Team dbTeam = team("Database Team", devDept, null, "Database design and management");
        Team qaTeam = team("QA Team", qaDept, null, "Manual and automation testing");
        Team infraTeam = team("Infrastructure Team", devOpsDept, null, "CI/CD and cloud infra");

        // ===== TEAM LEADS =====
        User backendLead = user("teamleadbackend@mail.com", "teamleadbackend123",
            "Vikram", "Mehta", UserRole.TEAM_LEAD, devDept, backendTeam,
            Set.of(java, spring), 6, ApprovalStatus.APPROVED);
        User frontendLead = user("teamleadfrontend@mail.com", "teamleadfrontend123",
            "Riya", "Joshi", UserRole.TEAM_LEAD, devDept, frontendTeam,
            Set.of(angular, react, js), 5, ApprovalStatus.APPROVED);
        User qaLead = user("teamleadqa@mail.com", "teamleadqa123",
            "Arjun", "Verma", UserRole.TEAM_LEAD, qaDept, qaTeam,
            Set.of(testing, python), 5, ApprovalStatus.APPROVED);

        // Link leads to teams
        backendTeam.setTeamLead(backendLead); teamRepo.save(backendTeam);
        frontendTeam.setTeamLead(frontendLead); teamRepo.save(frontendTeam);
        qaTeam.setTeamLead(qaLead); teamRepo.save(qaTeam);

        // ===== EMPLOYEES =====
        User emp1 = user("john.doe@mail.com", "employee123",
            "John", "Doe", UserRole.EMPLOYEE, devDept, backendTeam,
            Set.of(java, spring, sql), 3, ApprovalStatus.APPROVED);
        User emp2 = user("jane.smith@mail.com", "employee123",
            "Jane", "Smith", UserRole.EMPLOYEE, devDept, frontendTeam,
            Set.of(angular, react, js), 2, ApprovalStatus.APPROVED);
        User emp3 = user("mike.johnson@mail.com", "employee123",
            "Mike", "Johnson", UserRole.EMPLOYEE, qaDept, qaTeam,
            Set.of(testing), 2, ApprovalStatus.APPROVED);
        User emp4 = user("sara.brown@mail.com", "employee123",
            "Sara", "Brown", UserRole.EMPLOYEE, devDept, backendTeam,
            Set.of(java, python), 4, ApprovalStatus.APPROVED);
        // Pending employee (needs approval)
        User emp5 = user("alex.new@mail.com", "employee123",
            "Alex", "New", UserRole.EMPLOYEE, devDept, frontendTeam,
            Set.of(js, react), 1, ApprovalStatus.PENDING);

        // ===== PROJECT =====
        Project p1 = new Project();
        p1.setName("Enterprise Portal v2.0");
        p1.setDescription("Full-stack enterprise portal with microservices architecture");
        p1.setStatus(ProjectStatus.ACTIVE);
        p1.setPriority(Priority.HIGH);
        p1.setStartDate(LocalDate.now().minusDays(30));
        p1.setDeadline(LocalDate.now().plusDays(60));
        p1.setCreatedBy(pm);
        p1.setRequiredSkills(Set.of(java, spring, angular, sql, docker));
        projectRepo.save(p1);

        Project p2 = new Project();
        p2.setName("Mobile App Redesign");
        p2.setDescription("Complete redesign of the mobile application UI/UX");
        p2.setStatus(ProjectStatus.PLANNING);
        p2.setPriority(Priority.MEDIUM);
        p2.setStartDate(LocalDate.now().plusDays(15));
        p2.setDeadline(LocalDate.now().plusDays(90));
        p2.setCreatedBy(pm);
        p2.setRequiredSkills(Set.of(figma, react, js));
        projectRepo.save(p2);

        // ===== TASKS =====
        Task t1 = task("User Authentication API", "Build JWT-based auth endpoints",
            p1, devDept, backendTeam, TaskStatus.IN_PROGRESS, Priority.CRITICAL, 16, LocalDate.now().plusDays(7), Set.of(java, spring));
        Task t2 = task("Dashboard UI Components", "Build reusable dashboard components in Angular",
            p1, devDept, frontendTeam, TaskStatus.IN_PROGRESS, Priority.HIGH, 24, LocalDate.now().plusDays(14), Set.of(angular, js));
        Task t3 = task("Database Schema Design", "Design and optimize database schema",
            p1, devDept, dbTeam, TaskStatus.COMPLETED, Priority.HIGH, 8, LocalDate.now().minusDays(5), Set.of(sql));
        Task t4 = task("API Integration Tests", "Write integration tests for all REST endpoints",
            p1, qaDept, qaTeam, TaskStatus.PENDING, Priority.MEDIUM, 12, LocalDate.now().plusDays(21), Set.of(testing));
        Task t5 = task("User Profile Management", "CRUD APIs for user profile",
            p1, devDept, backendTeam, TaskStatus.PENDING, Priority.MEDIUM, 8, LocalDate.now().plusDays(10), Set.of(java, spring, sql));

        // ===== ASSIGNMENTS =====
        assign(t1, emp1, backendLead, 60);
        assign(t1, emp4, backendLead, 40);
        assign(t2, emp2, frontendLead, 70);
        assign(t4, emp3, qaLead, 0);

        // Complete t3
        TaskAssignment completedAssign = new TaskAssignment();
        completedAssign.setTask(t3); completedAssign.setEmployee(emp4);
        completedAssign.setAssignedBy(backendLead); completedAssign.setStatus(AssignmentStatus.COMPLETED);
        completedAssign.setCompletionPercentage(100); completedAssign.setCompletionDate(LocalDate.now().minusDays(5));
        assignRepo.save(completedAssign);

        // Recalculate utilization for assigned employees
        recalc(emp1); recalc(emp2); recalc(emp3); recalc(emp4);

        printCredentials();
    }

    private void recalc(User u) {
        var active = assignRepo.findActiveByEmployee(u.getId());
        int hours = active.stream().mapToInt(a -> a.getTask().getEstimatedHours() != null ? a.getTask().getEstimatedHours() : 8).sum();
        u.setAllocatedHours(hours);
        userRepo.save(u);
    }

    private Skill skill(String name, String cat) {
        return skillRepo.findByName(name).orElseGet(() -> {
            Skill s = new Skill(); s.setName(name); s.setCategory(cat); return skillRepo.save(s);
        });
    }

    private Department dept(String name, String desc) {
        return deptRepo.findByName(name).orElseGet(() -> {
            Department d = new Department(); d.setName(name); d.setDescription(desc); return deptRepo.save(d);
        });
    }

    private Team team(String name, Department dept, User lead, String desc) {
        Team t = new Team(); t.setName(name); t.setDepartment(dept); t.setTeamLead(lead); t.setDescription(desc);
        return teamRepo.save(t);
    }

    private User user(String email, String password, String first, String last,
                      UserRole role, Department dept, Team team, Set<Skill> skills,
                      int exp, ApprovalStatus approval) {
        User u = new User();
        u.setEmail(email); u.setPassword(encoder.encode(password));
        u.setFirstName(first); u.setLastName(last); u.setRole(role);
        u.setDepartment(dept); u.setTeam(team); u.setSkills(skills);
        u.setExperienceYears(exp); u.setApprovalStatus(approval);
        u.setMaxCapacityHours(40); u.setAllocatedHours(0);
        return userRepo.save(u);
    }

    private Task task(String title, String desc, Project project, Department dept,
                      Team team, TaskStatus status, Priority priority, int hours,
                      LocalDate due, Set<Skill> skills) {
        Task t = new Task(); t.setTitle(title); t.setDescription(desc);
        t.setProject(project); t.setDepartment(dept); t.setTeam(team);
        t.setStatus(status); t.setPriority(priority); t.setEstimatedHours(hours);
        t.setDueDate(due); t.setRequiredSkills(skills); t.setRequiredEmployees(2);
        return taskRepo.save(t);
    }

    private void assign(Task task, User emp, User assignedBy, int pct) {
        TaskAssignment a = new TaskAssignment();
        a.setTask(task); a.setEmployee(emp); a.setAssignedBy(assignedBy);
        a.setStatus(pct > 0 ? AssignmentStatus.IN_PROGRESS : AssignmentStatus.ASSIGNED);
        a.setCompletionPercentage(pct); a.setAssignedDate(LocalDate.now());
        assignRepo.save(a);
    }

    private void printCredentials() {
        System.out.println("\n╔═══════════════════════════════════════════════════════════╗");
        System.out.println("║           INTELLIGENT TASK ALLOCATOR - CREDENTIALS        ║");
        System.out.println("╠═══════════════════════════════════════════════════════════╣");
        System.out.println("║ PROJECT MANAGER:                                          ║");
        System.out.println("║   projectmanager@mail.com / projectmanager123             ║");
        System.out.println("╠═══════════════════════════════════════════════════════════╣");
        System.out.println("║ DEPARTMENT HEADS:                                         ║");
        System.out.println("║   development@mail.com / development123                   ║");
        System.out.println("║   qualityassurance@mail.com / qualityassurance123         ║");
        System.out.println("║   devops@mail.com / devops123                             ║");
        System.out.println("║   uiuxdesign@mail.com / uiuxdesign123                    ║");
        System.out.println("╠═══════════════════════════════════════════════════════════╣");
        System.out.println("║ TEAM LEADS:                                               ║");
        System.out.println("║   teamleadbackend@mail.com / teamleadbackend123           ║");
        System.out.println("║   teamleadfrontend@mail.com / teamleadfrontend123         ║");
        System.out.println("║   teamleadqa@mail.com / teamleadqa123                     ║");
        System.out.println("╠═══════════════════════════════════════════════════════════╣");
        System.out.println("║ EMPLOYEES (all approved):                                 ║");
        System.out.println("║   john.doe@mail.com / employee123                         ║");
        System.out.println("║   jane.smith@mail.com / employee123                       ║");
        System.out.println("║   mike.johnson@mail.com / employee123                     ║");
        System.out.println("║   sara.brown@mail.com / employee123                       ║");
        System.out.println("║   alex.new@mail.com / employee123  (PENDING APPROVAL)     ║");
        System.out.println("╚═══════════════════════════════════════════════════════════╝\n");
    }
}
