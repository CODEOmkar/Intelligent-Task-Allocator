package com.ita.controller;

import com.ita.dto.ApiResponse;
import com.ita.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/departments") @CrossOrigin(origins = "http://localhost:4200")
public class DepartmentController {
    @Autowired private DepartmentService deptService;
    @GetMapping public ResponseEntity<?> getAll() { return ResponseEntity.ok(ApiResponse.ok("Departments", deptService.getAll())); }
    @GetMapping("/{id}") public ResponseEntity<?> getById(@PathVariable Long id) {
        return deptService.getById(id).map(d -> ResponseEntity.ok(ApiResponse.ok("Department", d))).orElse(ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<?> create(@RequestBody Map<String, Object> data) {
        try { return ResponseEntity.ok(ApiResponse.ok("Created", deptService.create(data))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); } }
    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try { return ResponseEntity.ok(ApiResponse.ok("Updated", deptService.update(id, data))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); } }
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id) {
        try { deptService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); } }
}
