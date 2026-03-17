package com.ita.service;

import com.ita.dto.UtilizationDTO;
import com.ita.entity.*;
import com.ita.enums.ApprovalStatus;
import com.ita.enums.UserRole;
import com.ita.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    @Autowired private UserRepository userRepo;
    @Autowired private DepartmentRepository deptRepo;
    @Autowired private TeamRepository teamRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private TaskAssignmentRepository assignRepo;
    @Autowired private PasswordEncoder encoder;

    public List<User> getAll() { return userRepo.findAll(); }
    public Optional<User> getById(Long id) { return userRepo.findById(id); }

    public List<User> getByDepartment(Long deptId) {
        Department dept = deptRepo.findById(deptId).orElseThrow();
        return userRepo.findByDepartment(dept);
    }

    public List<User> getByTeam(Long teamId) {
        Team team = teamRepo.findById(teamId).orElseThrow();
        return userRepo.findByTeam(team);
    }

    public List<User> getPending() { return userRepo.findByApprovalStatus(ApprovalStatus.PENDING); }

    public User approve(Long id) {
        User u = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        u.setApprovalStatus(ApprovalStatus.APPROVED);
        return userRepo.save(u);
    }

    public User reject(Long id) {
        User u = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        u.setApprovalStatus(ApprovalStatus.REJECTED);
        return userRepo.save(u);
    }

    public User updateProfile(Long id, Map<String, Object> data, boolean selfEdit) {
        User u = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        if (data.containsKey("firstName")) u.setFirstName((String) data.get("firstName"));
        if (data.containsKey("lastName")) u.setLastName((String) data.get("lastName"));
        if (data.containsKey("email")) {
            String newEmail = (String) data.get("email");
            if (newEmail != null && !newEmail.equals(u.getEmail())) {
                if (userRepo.existsByEmail(newEmail)) {
                    throw new RuntimeException("Email is already in use");
                }
                u.setEmail(newEmail);
            }
        }
        if (data.containsKey("bio")) u.setBio((String) data.get("bio"));
        if (data.containsKey("experienceYears")) u.setExperienceYears((Integer) data.get("experienceYears"));
        if (data.containsKey("maxCapacityHours")) u.setMaxCapacityHours((Integer) data.get("maxCapacityHours"));

        if (data.containsKey("skillIds")) {
            List<Long> ids = ((List<?>) data.get("skillIds")).stream()
                .map(x -> Long.valueOf(x.toString())).collect(Collectors.toList());
            u.setSkills(new HashSet<>(skillRepo.findAllById(ids)));
        }

        // Only managers can change role/dept/team
        if (!selfEdit) {
            if (data.containsKey("departmentId") && data.get("departmentId") != null)
                deptRepo.findById(Long.valueOf(data.get("departmentId").toString())).ifPresent(u::setDepartment);
            if (data.containsKey("teamId") && data.get("teamId") != null)
                teamRepo.findById(Long.valueOf(data.get("teamId").toString())).ifPresent(u::setTeam);
            if (data.containsKey("role") && data.get("role") != null)
                u.setRole(UserRole.valueOf((String) data.get("role")));
        }

        if (data.containsKey("password") && data.get("password") != null) {
            String pw = (String) data.get("password");
            if (!pw.isBlank()) u.setPassword(encoder.encode(pw));
        }

        // Re-approve if profile updated (employee)
        if (selfEdit && u.getRole() == UserRole.EMPLOYEE)
            u.setApprovalStatus(ApprovalStatus.PENDING);

        return userRepo.save(u);
    }

    // Recalculate allocated hours based on active task assignments
    public void recalculateUtilization(Long userId) {
        User u = userRepo.findById(userId).orElseThrow();
        List<TaskAssignment> active = assignRepo.findActiveByEmployee(userId);
        int totalHours = active.stream()
            .mapToInt(a -> a.getTask() != null && a.getTask().getEstimatedHours() != null
                ? a.getTask().getEstimatedHours() : 8)
            .sum();
        u.setAllocatedHours(totalHours);
        userRepo.save(u);
    }

    // Utilization metrics for a list of users
    public List<UtilizationDTO> getUtilizationMetrics(List<User> users) {
        return users.stream().map(u -> {
            List<TaskAssignment> active = assignRepo.findActiveByEmployee(u.getId());
            int activeTasks = active.size();
            int allocated = active.stream()
                .mapToInt(a -> a.getTask() != null && a.getTask().getEstimatedHours() != null
                    ? a.getTask().getEstimatedHours() : 8)
                .sum();
            u.setAllocatedHours(allocated);
            userRepo.save(u);
            double pct = u.getMaxCapacityHours() > 0
                ? Math.min(((double) allocated / u.getMaxCapacityHours()) * 100, 150) : 0;
            String status = pct < 70 ? "UNDERUTILIZED" : pct <= 100 ? "OPTIMAL" : "OVERLOADED";
            return new UtilizationDTO(u.getId(),
                u.getFirstName() + " " + u.getLastName(), u.getEmail(),
                u.getDepartment() != null ? u.getDepartment().getName() : null,
                u.getTeam() != null ? u.getTeam().getName() : null,
                allocated, u.getMaxCapacityHours(), pct, status, activeTasks);
        }).collect(Collectors.toList());
    }

    public List<UtilizationDTO> getAllEmployeeUtilization() {
        return getUtilizationMetrics(userRepo.findApprovedEmployees());
    }

    public List<UtilizationDTO> getDepartmentUtilization(Long deptId) {
        return getUtilizationMetrics(userRepo.findApprovedEmployeesByDepartment(deptId));
    }

    public List<UtilizationDTO> getTeamUtilization(Long teamId) {
        return getUtilizationMetrics(userRepo.findApprovedEmployeesByTeam(teamId));
    }

    public void delete(Long id) { userRepo.deleteById(id); }
}
