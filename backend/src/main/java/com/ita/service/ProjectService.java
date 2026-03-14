package com.ita.service;

import com.ita.dto.ProjectDTO;
import com.ita.entity.Project;
import com.ita.enums.ProjectStatus;
import com.ita.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class ProjectService {
    @Autowired private ProjectRepository projectRepo;
    @Autowired private TaskRepository taskRepo;
    @Autowired private TaskAssignmentRepository assignRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private UserService userService;

    public Project create(ProjectDTO dto) {
        Project p = new Project();
        apply(p, dto);
        return projectRepo.save(p);
    }

    public Project update(Long id, ProjectDTO dto) {
        Project p = projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        apply(p, dto);
        return projectRepo.save(p);
    }

    private void apply(Project p, ProjectDTO dto) {
        if (dto.getName() != null) p.setName(dto.getName());
        if (dto.getDescription() != null) p.setDescription(dto.getDescription());
        if (dto.getStatus() != null) p.setStatus(ProjectStatus.valueOf(dto.getStatus()));
        if (dto.getPriority() != null) p.setPriority(com.ita.enums.Priority.valueOf(dto.getPriority()));
        if (dto.getStartDate() != null) p.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) p.setEndDate(dto.getEndDate());
        if (dto.getDeadline() != null) p.setDeadline(dto.getDeadline());
        if (dto.getCreatedById() != null) userRepo.findById(dto.getCreatedById()).ifPresent(p::setCreatedBy);
        if (dto.getRequiredSkillIds() != null)
            p.setRequiredSkills(new HashSet<>(skillRepo.findAllById(dto.getRequiredSkillIds())));
    }

    public List<Project> getAll() { return projectRepo.findAllOrdered(); }
    public List<Project> getActive() { return projectRepo.findAllActive(); }
    public Optional<Project> getById(Long id) { return projectRepo.findById(id); }

    public void delete(Long id) {
        taskRepo.findByProjectId(id).forEach(t -> {
            assignRepo.findByTaskId(t.getId()).forEach(a -> {
                Long empId = a.getEmployee().getId();
                assignRepo.deleteById(a.getId());
                userService.recalculateUtilization(empId);
            });
            taskRepo.deleteById(t.getId());
        });
        projectRepo.deleteById(id);
    }
}
