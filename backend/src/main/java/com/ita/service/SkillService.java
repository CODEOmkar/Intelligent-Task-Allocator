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
        Skill s = new Skill();
        s.setName(data.get("name"));
        s.setCategory(data.get("category"));
        return skillRepo.save(s);
    }

    public Skill update(Long id, Map<String, String> data) {
        Skill s = skillRepo.findById(id).orElseThrow(() -> new RuntimeException("Skill not found"));
        if (data.containsKey("name")) s.setName(data.get("name"));
        if (data.containsKey("category")) s.setCategory(data.get("category"));
        return skillRepo.save(s);
    }

    public void delete(Long id) { skillRepo.deleteById(id); }
}
