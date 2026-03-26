package com.ita.controller;

import com.ita.dto.*;
import com.ita.entity.User;
import com.ita.repository.UserRepository;
import com.ita.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:4200")
public class TaskController {
    @Autowired private TaskService taskService;
    @Autowired private UserRepository userRepo;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Tasks", taskService.getAll()));
    }

    @GetMapping("/for-me")
    public ResponseEntity<?> getForMe() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User u = userRepo.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(ApiResponse.ok("My tasks", taskService.getTasksForUser(u)));
    }

    @GetMapping("/my-assignments")
    public ResponseEntity<?> getMyAssignments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User u = userRepo.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(ApiResponse.ok("My assignments", taskService.getMyAssignments(u.getId())));
    }

    @GetMapping("/assignments/user/{userId}")
    public ResponseEntity<?> getUserAssignments(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("User assignments", taskService.getMyAssignments(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return taskService.getById(id)
            .map(t -> ResponseEntity.ok(ApiResponse.ok("Task", t)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{pid}")
    public ResponseEntity<?> getByProject(@PathVariable Long pid) {
        return ResponseEntity.ok(ApiResponse.ok("Tasks", taskService.getByProject(pid)));
    }

    @GetMapping("/project/{pid}/active")
    public ResponseEntity<?> getActiveByProject(@PathVariable Long pid) {
        return ResponseEntity.ok(ApiResponse.ok("Active tasks", taskService.getActiveByProject(pid)));
    }

    @GetMapping("/{id}/subtasks")
    public ResponseEntity<?> getSubTasks(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Sub-tasks", taskService.getSubTasks(id)));
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<?> getByDept(@PathVariable Long deptId) {
        return ResponseEntity.ok(ApiResponse.ok("Tasks", taskService.getByDepartment(deptId)));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<?> getByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(ApiResponse.ok("Tasks", taskService.getByTeam(teamId)));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody TaskDTO dto) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User u = userRepo.findByEmail(email).orElseThrow();
            return ResponseEntity.ok(ApiResponse.ok("Task created", taskService.create(dto, u)));
        }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody TaskDTO dto) {
        try { return ResponseEntity.ok(ApiResponse.ok("Updated", taskService.update(id, dto))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try { taskService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); }
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assign(@RequestBody AssignmentDTO dto) {
        try { return ResponseEntity.ok(ApiResponse.ok("Assigned", taskService.assign(dto))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); }
    }

    @PatchMapping("/assignments/{id}/progress")
    public ResponseEntity<?> progress(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Long empId = Long.valueOf(body.get("employeeId").toString());
            int pct = Integer.parseInt(body.get("completionPercentage").toString());
            return ResponseEntity.ok(ApiResponse.ok("Progress updated", taskService.updateProgress(id, empId, pct)));
        } catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); }
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<?> removeAssignment(@PathVariable Long id) {
        try { return ResponseEntity.ok(ApiResponse.ok("Removed", taskService.removeAssignment(id))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); }
    }

    @GetMapping("/assignments/task/{taskId}")
    public ResponseEntity<?> getAssignmentsForTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.ok("Assignments", taskService.getAssignmentsForTask(taskId)));
    }

    @GetMapping("/assignments/task/{taskId}/all")
    public ResponseEntity<?> getAllAssignmentsForTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.ok("All assignments", taskService.getAllAssignmentsForTask(taskId)));
    }
}
