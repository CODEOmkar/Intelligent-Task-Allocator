package com.ita.controller;

import com.ita.dto.ApiResponse;
import com.ita.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/skills") @CrossOrigin(origins = "http://localhost:4200")
public class SkillController {
    @Autowired private SkillService skillService;
    @GetMapping public ResponseEntity<?> getAll() { return ResponseEntity.ok(ApiResponse.ok("Skills", skillService.getAll())); }
    @PostMapping public ResponseEntity<?> create(@RequestBody Map<String, String> data) {
        try { return ResponseEntity.ok(ApiResponse.ok("Created", skillService.create(data))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); } }
    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, String> data) {
        try { return ResponseEntity.ok(ApiResponse.ok("Updated", skillService.update(id, data))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); } }
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id) {
        try { skillService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage())); } }
}
