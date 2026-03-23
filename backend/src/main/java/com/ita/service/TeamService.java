package com.ita.service;

import com.ita.entity.Team;
import com.ita.repository.DepartmentRepository;
import com.ita.repository.TeamRepository;
import com.ita.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class TeamService {
    @Autowired private TeamRepository teamRepo;
    @Autowired private DepartmentRepository deptRepo;
    @Autowired private UserRepository userRepo;

    public List<Team> getAll() { return teamRepo.findAll(); }
    public List<Team> getByDepartment(Long deptId) { return teamRepo.findByDepartmentId(deptId); }
    public Optional<Team> getById(Long id) { return teamRepo.findById(id); }

    public Team create(Map<String, Object> data) {
        String name = (String) data.get("name");
        if (name != null && teamRepo.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Team with name '" + name + "' already exists");
        }
        Team t = new Team();
        t.setName(name);
        t.setDescription((String) data.get("description"));
        if (data.get("departmentId") != null)
            deptRepo.findById(Long.valueOf(data.get("departmentId").toString())).ifPresent(t::setDepartment);
        Object leadKey = data.get("teamLeadId") != null ? data.get("teamLeadId") : data.get("leadId");
        if (leadKey != null)
            userRepo.findById(Long.valueOf(leadKey.toString())).ifPresent(t::setTeamLead);
        return teamRepo.save(t);
    }

    public Team update(Long id, Map<String, Object> data) {
        Team t = teamRepo.findById(id).orElseThrow();
        if (data.get("name") != null) {
            String newName = (String) data.get("name");
            if (!t.getName().equalsIgnoreCase(newName) && teamRepo.existsByNameIgnoreCase(newName)) {
                 throw new RuntimeException("Team with name '" + newName + "' already exists");
            }
            t.setName(newName);
        }
        if (data.get("description") != null) t.setDescription((String) data.get("description"));
        if (data.get("departmentId") != null)
            deptRepo.findById(Long.valueOf(data.get("departmentId").toString())).ifPresent(t::setDepartment);
        if (data.containsKey("teamLeadId")) {
            Object leadKey = data.get("teamLeadId");
            if (leadKey != null)
                userRepo.findById(Long.valueOf(leadKey.toString())).ifPresent(t::setTeamLead);
            else
                t.setTeamLead(null);
        } else if (data.containsKey("leadId")) {
            Object leadKey = data.get("leadId");
            if (leadKey != null)
                userRepo.findById(Long.valueOf(leadKey.toString())).ifPresent(t::setTeamLead);
            else
                t.setTeamLead(null);
        }
        return teamRepo.save(t);
    }

    public void delete(Long id) { teamRepo.deleteById(id); }
}
