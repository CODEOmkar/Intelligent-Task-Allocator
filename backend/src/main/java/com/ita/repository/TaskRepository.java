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

    // Dept head sees: tasks directly assigned to their dept,
    // OR sub-tasks whose parent was assigned to their dept,
    // OR tasks assigned to a team that belongs to their dept
    @Query("SELECT DISTINCT t FROM Task t " +
       "LEFT JOIN t.department td " +
       "LEFT JOIN t.team tm LEFT JOIN tm.department tmd " +
       "LEFT JOIN t.parentTask pt LEFT JOIN pt.department ptd " +
       "WHERE td.id = :deptId " +
       "OR ptd.id = :deptId " +
       "OR tmd.id = :deptId")
   List<Task> findByDeptScope(@Param("deptId") Long deptId);

    // Team lead sees: tasks assigned directly to their team,
    // OR sub-tasks whose parent was assigned to their team
    @Query("SELECT DISTINCT t FROM Task t " +
       "LEFT JOIN t.team tm " +
       "LEFT JOIN t.parentTask pt LEFT JOIN pt.team ptm " +
       "WHERE tm.id = :teamId " +
       "OR ptm.id = :teamId")
     List<Task> findByTeamScope(@Param("teamId") Long teamId); 
}
