package com.ita.repository;

import com.ita.entity.User;
import com.ita.entity.Department;
import com.ita.entity.Team;
import com.ita.enums.ApprovalStatus;
import com.ita.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByDepartment(Department department);
    List<User> findByTeam(Team team);
    List<User> findByRoleAndApprovalStatus(UserRole role, ApprovalStatus status);
    List<User> findByDepartmentAndRole(Department department, UserRole role);
    List<User> findByApprovalStatus(ApprovalStatus status);

    @Query("SELECT u FROM User u WHERE u.role = 'EMPLOYEE' AND u.approvalStatus = 'APPROVED'")
    List<User> findApprovedEmployees();

    @Query("SELECT u FROM User u WHERE u.role = 'EMPLOYEE' AND u.department.id = :deptId AND u.approvalStatus = 'APPROVED'")
    List<User> findApprovedEmployeesByDepartment(@Param("deptId") Long deptId);

    @Query("SELECT u FROM User u WHERE u.role = 'EMPLOYEE' AND u.team.id = :teamId AND u.approvalStatus = 'APPROVED'")
    List<User> findApprovedEmployeesByTeam(@Param("teamId") Long teamId);

    @Query("SELECT DISTINCT u FROM User u JOIN u.skills s WHERE s.id IN :skillIds AND u.role = 'EMPLOYEE' AND u.approvalStatus = 'APPROVED'")
    List<User> findEmployeesBySkills(@Param("skillIds") List<Long> skillIds);
}
