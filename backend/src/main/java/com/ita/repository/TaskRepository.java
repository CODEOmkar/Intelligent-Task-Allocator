package com.ita.repository;
import com.ita.entity.Task;
import com.ita.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByDepartmentId(Long deptId);
    List<Task> findByTeamId(Long teamId);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByParentTaskId(Long parentTaskId);

    @Query("SELECT DISTINCT t FROM Task t JOIN TaskAssignment ta ON ta.task = t " +
           "WHERE ta.employee.id = :empId AND ta.status IN ('ASSIGNED','IN_PROGRESS')")
    List<Task> findActiveTasksByEmployee(@Param("empId") Long empId);

    @Query("SELECT t FROM Task t WHERE t.project.id = :pid AND t.status != 'CANCELLED'")
    List<Task> findActiveByProject(@Param("pid") Long pid);

    // Finds tasks explicitly assigned to the user OR sub-tasks whose parent is assigned to the user
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN TaskAssignment ta ON ta.task = t " +
           "LEFT JOIN TaskAssignment pta ON pta.task = t.parentTask " +
           "WHERE (ta.employee.id = :empId AND ta.status IN ('ASSIGNED','IN_PROGRESS')) " +
           "   OR (pta.employee.id = :empId AND pta.status IN ('ASSIGNED','IN_PROGRESS'))")
    List<Task> findAssignedAndDerivedTasks(@Param("empId") Long empId); 

     boolean existsByTitleIgnoreCaseAndProjectId(String title, Long projectId);
}
