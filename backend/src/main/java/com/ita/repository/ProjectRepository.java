package com.ita.repository;
import com.ita.entity.Project;
import com.ita.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(ProjectStatus status);
    @Query("SELECT p FROM Project p WHERE p.status != 'CANCELLED' ORDER BY p.createdAt DESC")
    List<Project> findAllActive();
    @Query("SELECT p FROM Project p ORDER BY p.createdAt DESC")
    List<Project> findAllOrdered();
}
