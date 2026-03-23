package com.ita.repository;
import com.ita.entity.Department;
import com.ita.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByDepartment(Department department);
    List<Team> findByDepartmentId(Long departmentId);
    boolean existsByNameIgnoreCase(String name);
}
