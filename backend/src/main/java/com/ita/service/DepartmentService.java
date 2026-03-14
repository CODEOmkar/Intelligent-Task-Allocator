package com.ita.service;

import com.ita.entity.Department;
import com.ita.entity.User;
import com.ita.repository.DepartmentRepository;
import com.ita.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class DepartmentService {
    @Autowired private DepartmentRepository deptRepo;
    @Autowired private UserRepository userRepo;

    public List<Department> getAll() { return deptRepo.findAll(); }
    public Optional<Department> getById(Long id) { return deptRepo.findById(id); }

    public Department create(Map<String, Object> data) {
        Department d = new Department();
        d.setName((String) data.get("name"));
        d.setDescription((String) data.get("description"));
        if (data.get("headId") != null)
            userRepo.findById(Long.valueOf(data.get("headId").toString())).ifPresent(d::setHead);
        return deptRepo.save(d);
    }

    public Department update(Long id, Map<String, Object> data) {
        Department d = deptRepo.findById(id).orElseThrow();
        if (data.get("name") != null) d.setName((String) data.get("name"));
        if (data.get("description") != null) d.setDescription((String) data.get("description"));
        if (data.get("headId") != null)
            userRepo.findById(Long.valueOf(data.get("headId").toString())).ifPresent(d::setHead);
        return deptRepo.save(d);
    }

    public void delete(Long id) { deptRepo.deleteById(id); }
}
