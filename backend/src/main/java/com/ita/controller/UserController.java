package com.ita.controller;

import com.ita.dto.ApiResponse;
import com.ita.entity.User;
import com.ita.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {
    @Autowired private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Users", userService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return userService.getById(id)
            .map(u -> ResponseEntity.ok(ApiResponse.ok("User", u)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<?> getByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(ApiResponse.ok("Users by dept", userService.getByDepartment(deptId)));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<?> getByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(ApiResponse.ok("Users by team", userService.getByTeam(teamId)));
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPending() {
        return ResponseEntity.ok(ApiResponse.ok("Pending approvals", userService.getPending()));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        try { return ResponseEntity.ok(ApiResponse.ok("Approved", userService.approve(id))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        try { return ResponseEntity.ok(ApiResponse.ok("Rejected", userService.reject(id))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            boolean selfEdit = data.containsKey("selfEdit") && Boolean.TRUE.equals(data.get("selfEdit"));
            return ResponseEntity.ok(ApiResponse.ok("Updated", userService.updateProfile(id, data, selfEdit)));
        } catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try { userService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); }
    }

    // Utilization endpoints
    @GetMapping("/utilization/all")
    public ResponseEntity<?> getAllUtilization() {
        return ResponseEntity.ok(ApiResponse.ok("Utilization", userService.getAllEmployeeUtilization()));
    }

    @GetMapping("/utilization/department/{deptId}")
    public ResponseEntity<?> getDeptUtilization(@PathVariable Long deptId) {
        return ResponseEntity.ok(ApiResponse.ok("Dept utilization", userService.getDepartmentUtilization(deptId)));
    }

    @GetMapping("/utilization/team/{teamId}")
    public ResponseEntity<?> getTeamUtilization(@PathVariable Long teamId) {
        return ResponseEntity.ok(ApiResponse.ok("Team utilization", userService.getTeamUtilization(teamId)));
    }
}
