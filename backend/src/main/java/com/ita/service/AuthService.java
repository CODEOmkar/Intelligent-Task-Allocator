package com.ita.service;

import com.ita.dto.JwtResponse;
import com.ita.dto.LoginRequest;
import com.ita.dto.RegisterRequest;
import com.ita.entity.*;
import com.ita.enums.ApprovalStatus;
import com.ita.enums.UserRole;
import com.ita.repository.*;
import com.ita.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

@Service
@Transactional
public class AuthService {
    @Autowired private UserRepository userRepo;
    @Autowired private DepartmentRepository deptRepo;
    @Autowired private TeamRepository teamRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private PasswordEncoder encoder;
    @Autowired private JwtUtil jwtUtil;

    public JwtResponse login(LoginRequest req) {
        User u = userRepo.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email"));
        if (!encoder.matches(req.getPassword(), u.getPassword()))
            throw new RuntimeException("Invalid password");
        return buildResponse(u, jwtUtil.generate(u.getEmail(), u.getRole().name(), u.getId()));
    }

    public JwtResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");

        User u = new User();
        u.setEmail(req.getEmail());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());

        UserRole role = UserRole.valueOf(req.getRole());
        u.setRole(role);

        // PM and DeptHead are auto-approved, employees pending
        if (role == UserRole.PROJECT_MANAGER) {
            u.setApprovalStatus(ApprovalStatus.APPROVED);
        } else if (role == UserRole.DEPARTMENT_HEAD || role == UserRole.TEAM_LEAD) {
            u.setApprovalStatus(ApprovalStatus.APPROVED);
        } else {
            u.setApprovalStatus(ApprovalStatus.PENDING);
        }

        if (req.getDepartmentId() != null)
            deptRepo.findById(req.getDepartmentId()).ifPresent(u::setDepartment);
        if (req.getTeamId() != null)
            teamRepo.findById(req.getTeamId()).ifPresent(u::setTeam);
        if (req.getSkillIds() != null && !req.getSkillIds().isEmpty())
            u.setSkills(new HashSet<>(skillRepo.findAllById(req.getSkillIds())));
        if (req.getExperienceYears() != null) u.setExperienceYears(req.getExperienceYears());

        if (role == UserRole.TEAM_LEAD) {
            u.setMaxCapacityHours(35);
        } else if (req.getMaxCapacityHours() != null) {
            u.setMaxCapacityHours(req.getMaxCapacityHours());
        }

        if (req.getBio() != null) u.setBio(req.getBio());

        User saved = userRepo.save(u);
        String token = jwtUtil.generate(saved.getEmail(), saved.getRole().name(), saved.getId());
        return buildResponse(saved, token);
    }

    private JwtResponse buildResponse(User u, String token) {
        return new JwtResponse(token, u.getId(), u.getEmail(),
            u.getFirstName(), u.getLastName(), u.getRole().name(),
            u.getApprovalStatus().name(),
            u.getDepartment() != null ? u.getDepartment().getId() : null,
            u.getDepartment() != null ? u.getDepartment().getName() : null,
            u.getTeam() != null ? u.getTeam().getId() : null,
            u.getTeam() != null ? u.getTeam().getName() : null);
    }
}
