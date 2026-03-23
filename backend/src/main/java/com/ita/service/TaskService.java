package com.ita.service;

import com.ita.dto.AssignmentDTO;
import com.ita.dto.TaskDTO;
import com.ita.entity.*;
import com.ita.enums.AssignmentStatus;
import com.ita.enums.TaskStatus;
import com.ita.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {
    @Autowired private TaskRepository taskRepo;
    @Autowired private TaskAssignmentRepository assignRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private DepartmentRepository deptRepo;
    @Autowired private TeamRepository teamRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private UserService userService;

    public Task create(TaskDTO dto) {
        if (dto.getTitle() != null) {
            Long projId = dto.getProjectId();
            if (projId == null && dto.getParentTaskId() != null) {
                 Task parent = taskRepo.findById(dto.getParentTaskId()).orElse(null);
                 if (parent != null && parent.getProject() != null) projId = parent.getProject().getId();
            }
            if (projId != null && taskRepo.existsByTitleIgnoreCaseAndProjectId(dto.getTitle(), projId)) {
                throw new RuntimeException("Task with title '" + dto.getTitle() + "' already exists in this project");
            }
        }
        Task t = new Task();
        applyDTO(t, dto);
        return taskRepo.save(t);
    }

    public Task update(Long id, TaskDTO dto) {
        Task t = taskRepo.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        if (dto.getTitle() != null && !t.getTitle().equalsIgnoreCase(dto.getTitle())) {
            Long projId = t.getProject() != null ? t.getProject().getId() : null;
            if (projId != null && taskRepo.existsByTitleIgnoreCaseAndProjectId(dto.getTitle(), projId)) {
                throw new RuntimeException("Task with title '" + dto.getTitle() + "' already exists in this project");
            }
        }
        applyDTO(t, dto);
        if ("COMPLETED".equals(dto.getStatus())) autoCompleteAssignments(id);
        return taskRepo.save(t);
    }

    private void applyDTO(Task t, TaskDTO dto) {
        if (dto.getTitle() != null) t.setTitle(dto.getTitle());
        if (dto.getDescription() != null) t.setDescription(dto.getDescription());
        if (dto.getStatus() != null) t.setStatus(TaskStatus.valueOf(dto.getStatus()));
        if (dto.getPriority() != null) t.setPriority(com.ita.enums.Priority.valueOf(dto.getPriority()));
        if (dto.getEstimatedHours() != null) t.setEstimatedHours(dto.getEstimatedHours());
        if (dto.getRequiredEmployees() != null) t.setRequiredEmployees(dto.getRequiredEmployees());
        if (dto.getDueDate() != null) t.setDueDate(dto.getDueDate());

        // Handle parent task first — inherit project if not specified
        if (dto.getParentTaskId() != null) {
            taskRepo.findById(dto.getParentTaskId()).ifPresent(parent -> {
                t.setParentTask(parent);
                // inherit project from parent if not explicitly provided
                if (dto.getProjectId() == null && parent.getProject() != null) {
                    t.setProject(parent.getProject());
                }
                // inherit department if not set
                if (dto.getDepartmentId() == null && parent.getDepartment() != null) {
                    t.setDepartment(parent.getDepartment());
                }
            });
        }

        if (dto.getProjectId() != null) projectRepo.findById(dto.getProjectId()).ifPresent(t::setProject);
        if (dto.getDepartmentId() != null) deptRepo.findById(dto.getDepartmentId()).ifPresent(t::setDepartment);
        if (dto.getTeamId() != null) teamRepo.findById(dto.getTeamId()).ifPresent(t::setTeam);
        if (dto.getRequiredSkillIds() != null)
            t.setRequiredSkills(new HashSet<>(skillRepo.findAllById(dto.getRequiredSkillIds())));
    }

    public List<Task> getAll() { return taskRepo.findAll(); }
    public List<Task> getByProject(Long pid) { return taskRepo.findByProjectId(pid); }
    public List<Task> getActiveByProject(Long pid) { return taskRepo.findActiveByProject(pid); }
    public List<Task> getByDepartment(Long deptId) { return taskRepo.findByDepartmentId(deptId); }
    public List<Task> getByTeam(Long teamId) { return taskRepo.findByTeamId(teamId); }
    public List<Task> getSubTasks(Long parentTaskId) { return taskRepo.findByParentTaskId(parentTaskId); }
    public Optional<Task> getById(Long id) { return taskRepo.findById(id); }

    // Role-scoped task list — re-fetch user inside transaction to avoid lazy-loading issue
    public List<Task> getTasksForUser(User inputUser) {
        // Re-fetch user within this transaction to ensure department/team associations are loaded
        User user = userRepo.findById(inputUser.getId()).orElse(inputUser);
        return switch (user.getRole()) {
            case PROJECT_MANAGER -> taskRepo.findAll();
            case DEPARTMENT_HEAD -> user.getDepartment() != null
                ? taskRepo.findByDeptScope(user.getDepartment().getId())
                : taskRepo.findAll();
            case TEAM_LEAD -> user.getTeam() != null
                ? taskRepo.findByTeamScope(user.getTeam().getId())
                : List.of();
            case EMPLOYEE -> taskRepo.findActiveTasksByEmployee(user.getId());
        };
    }

    // Assign a task to employee - recalculates utilization
    public TaskAssignment assign(AssignmentDTO dto) {
        Task task = taskRepo.findById(dto.getTaskId()).orElseThrow(() -> new RuntimeException("Task not found"));
        User emp = userRepo.findById(dto.getEmployeeId()).orElseThrow(() -> new RuntimeException("Employee not found"));

        if (emp.getApprovalStatus() != com.ita.enums.ApprovalStatus.APPROVED)
            throw new RuntimeException("Employee not approved. Approval required before assignment.");

        // Allow EMPLOYEE and TEAM_LEAD to be assigned tasks (sub-task delegation)
        if (emp.getRole() != com.ita.enums.UserRole.EMPLOYEE && emp.getRole() != com.ita.enums.UserRole.TEAM_LEAD)
            throw new RuntimeException("Only employees and team leads can be assigned tasks.");

        if (assignRepo.existsActive(dto.getTaskId(), dto.getEmployeeId()))
            throw new RuntimeException("Employee is already assigned to this task");

        TaskAssignment a = new TaskAssignment();
        a.setTask(task);
        a.setEmployee(emp);
        a.setAssignedDate(LocalDate.now());
        a.setStatus(AssignmentStatus.ASSIGNED);
        a.setCompletionPercentage(0);
        if (dto.getNotes() != null) a.setNotes(dto.getNotes());
        if (dto.getAssignedById() != null)
            userRepo.findById(dto.getAssignedById()).ifPresent(a::setAssignedBy);

        if (task.getStatus() == TaskStatus.PENDING) {
            task.setStatus(TaskStatus.IN_PROGRESS);
            taskRepo.save(task);
        }
        TaskAssignment saved = assignRepo.save(a);
        userService.recalculateUtilization(emp.getId());
        return saved;
    }

    // Employee updates their own progress
    public TaskAssignment updateProgress(Long assignmentId, Long employeeId, int pct) {
        TaskAssignment a = assignRepo.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));
        if (!a.getEmployee().getId().equals(employeeId))
            throw new RuntimeException("You can only update your own assignments");

        pct = Math.max(0, Math.min(100, pct));
        a.setCompletionPercentage(pct);

        if (pct > 0 && a.getStatus() == AssignmentStatus.ASSIGNED)
            a.setStatus(AssignmentStatus.IN_PROGRESS);

        if (pct >= 100) {
            a.setStatus(AssignmentStatus.COMPLETED);
            a.setCompletionDate(LocalDate.now());
            a.setCompletionPercentage(100);

            // Check if ALL assignees completed
            boolean allDone = assignRepo.findActiveByTask(a.getTask().getId()).stream()
                .filter(x -> !x.getId().equals(assignmentId)).findAny().isEmpty();
            if (allDone) {
                Task task = a.getTask();
                task.setStatus(TaskStatus.COMPLETED);
                taskRepo.save(task);
            }
        }

        TaskAssignment saved = assignRepo.save(a);
        userService.recalculateUtilization(employeeId);
        return saved;
    }

    public TaskAssignment removeAssignment(Long assignmentId) {
        TaskAssignment a = assignRepo.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));
        Long empId = a.getEmployee().getId();
        a.setStatus(AssignmentStatus.REMOVED);
        TaskAssignment saved = assignRepo.save(a);
        userService.recalculateUtilization(empId);
        return saved;
    }

    public List<TaskAssignment> getAssignmentsForTask(Long taskId) {
        return assignRepo.findActiveByTask(taskId);
    }

    public List<TaskAssignment> getAllAssignmentsForTask(Long taskId) {
        return assignRepo.findByTaskId(taskId);
    }

    public List<TaskAssignment> getMyAssignments(Long empId) {
        return assignRepo.findByEmployeeId(empId).stream()
            .filter(a -> a.getStatus() != AssignmentStatus.REMOVED)
            .collect(Collectors.toList());
    }

    private void autoCompleteAssignments(Long taskId) {
        assignRepo.findActiveByTask(taskId).forEach(a -> {
            a.setStatus(AssignmentStatus.COMPLETED);
            a.setCompletionDate(LocalDate.now());
            a.setCompletionPercentage(100);
            assignRepo.save(a);
            userService.recalculateUtilization(a.getEmployee().getId());
        });
    }

    public void delete(Long id) {
        assignRepo.findByTaskId(id).forEach(a -> assignRepo.deleteById(a.getId()));
        taskRepo.deleteById(id);
    }
}
