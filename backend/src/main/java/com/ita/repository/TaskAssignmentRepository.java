package com.ita.repository;
import com.ita.entity.TaskAssignment;
import com.ita.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {

    @Query("SELECT ta FROM TaskAssignment ta " +
       "JOIN FETCH ta.task t " +
       "LEFT JOIN FETCH t.project " +
       "LEFT JOIN FETCH t.parentTask " +
       "WHERE ta.employee.id = :empId")
    List<TaskAssignment> findByEmployeeId(@Param("empId") Long empId);


    List<TaskAssignment> findByTaskId(Long taskId);

    @Query("SELECT ta FROM TaskAssignment ta WHERE ta.employee.id = :empId AND ta.status IN ('ASSIGNED','IN_PROGRESS')")
    List<TaskAssignment> findActiveByEmployee(@Param("empId") Long empId);

    @Query("SELECT ta FROM TaskAssignment ta " +
       "JOIN FETCH ta.employee " +
       "WHERE ta.task.id = :taskId AND ta.status IN ('ASSIGNED','IN_PROGRESS')")
    List<TaskAssignment> findActiveByTask(@Param("taskId") Long taskId);

    @Query("SELECT COUNT(ta) > 0 FROM TaskAssignment ta WHERE ta.task.id = :tid AND ta.employee.id = :eid AND ta.status IN ('ASSIGNED','IN_PROGRESS')")
    boolean existsActive(@Param("tid") Long taskId, @Param("eid") Long empId);

    @Query("SELECT ta FROM TaskAssignment ta WHERE ta.task.project.id = :pid")
    List<TaskAssignment> findByProjectId(@Param("pid") Long projectId);

    @Query("SELECT ta FROM TaskAssignment ta WHERE ta.employee.department.id = :deptId AND ta.status IN ('ASSIGNED','IN_PROGRESS')")
    List<TaskAssignment> findActiveByDepartment(@Param("deptId") Long deptId);
}
