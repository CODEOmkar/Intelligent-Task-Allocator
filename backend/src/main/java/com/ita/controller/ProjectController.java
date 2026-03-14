package com.ita.controller;

import com.ita.dto.*;
import com.ita.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:4200")
public class ProjectController {
    @Autowired private ProjectService projectService;

    @GetMapping public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Projects", projectService.getAll())); }

    @GetMapping("/active") public ResponseEntity<?> getActive() {
        return ResponseEntity.ok(ApiResponse.ok("Active projects", projectService.getActive())); }

    @GetMapping("/{id}") public ResponseEntity<?> getById(@PathVariable Long id) {
        return projectService.getById(id)
            .map(p -> ResponseEntity.ok(ApiResponse.ok("Project", p)))
            .orElse(ResponseEntity.notFound().build()); }

    @PostMapping public ResponseEntity<?> create(@RequestBody ProjectDTO dto) {
        try { return ResponseEntity.ok(ApiResponse.ok("Created", projectService.create(dto))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); } }

    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ProjectDTO dto) {
        try { return ResponseEntity.ok(ApiResponse.ok("Updated", projectService.update(id, dto))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); } }

    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id) {
        try { projectService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); } }
}
