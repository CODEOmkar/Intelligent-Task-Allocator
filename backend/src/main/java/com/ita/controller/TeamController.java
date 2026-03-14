package com.ita.controller;

import com.ita.dto.ApiResponse;
import com.ita.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/teams") @CrossOrigin(origins = "http://localhost:4200")
public class TeamController {
    @Autowired private TeamService teamService;
    @GetMapping public ResponseEntity<?> getAll() { return ResponseEntity.ok(ApiResponse.ok("Teams", teamService.getAll())); }
    @GetMapping("/department/{deptId}") public ResponseEntity<?> getByDept(@PathVariable Long deptId) {
        return ResponseEntity.ok(ApiResponse.ok("Teams", teamService.getByDepartment(deptId))); }
    @GetMapping("/{id}") public ResponseEntity<?> getById(@PathVariable Long id) {
        return teamService.getById(id).map(t -> ResponseEntity.ok(ApiResponse.ok("Team", t))).orElse(ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<?> create(@RequestBody Map<String, Object> data) {
        try { return ResponseEntity.ok(ApiResponse.ok("Created", teamService.create(data))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); } }
    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try { return ResponseEntity.ok(ApiResponse.ok("Updated", teamService.update(id, data))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); } }
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id) {
        try { teamService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); } }
}
