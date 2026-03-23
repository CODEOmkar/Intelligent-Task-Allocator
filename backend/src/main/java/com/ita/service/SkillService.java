package com.ita.service;

import com.ita.entity.Skill;
import com.ita.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class SkillService {
    @Autowired private SkillRepository skillRepo;

    public List<Skill> getAll() { return skillRepo.findAll(); }

    public Skill create(Map<String, String> data) {
        String name = data.get("name");
        if (skillRepo.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Skill with name '" + name + "' already exists");
        }
        Skill s = new Skill();
        s.setName(name);
        s.setCategory(data.get("category"));
        return skillRepo.save(s);
    }

    public Skill update(Long id, Map<String, String> data) {
        Skill s = skillRepo.findById(id).orElseThrow(() -> new RuntimeException("Skill not found"));
        if (data.containsKey("name")) {
            String newName = data.get("name");
            if (!s.getName().equalsIgnoreCase(newName) && skillRepo.existsByNameIgnoreCase(newName)) {
                throw new RuntimeException("Skill with name '" + newName + "' already exists");
            }
            s.setName(newName);
        }
        if (data.containsKey("category")) s.setCategory(data.get("category"));
        return skillRepo.save(s);
    }

    public void delete(Long id) { skillRepo.deleteById(id); }
}
