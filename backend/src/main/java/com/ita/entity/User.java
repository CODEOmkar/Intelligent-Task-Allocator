package com.ita.entity;

import com.ita.enums.ApprovalStatus;
import com.ita.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler","head"})
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler","teamLead","department"})
    private Team team;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_skills",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id"))
    private Set<Skill> skills = new HashSet<>();

    @Column
    private Integer experienceYears = 0;

    @Column(columnDefinition = "TEXT")
    private String bio;

    // Utilization metrics
    @Column(nullable = false)
    private Integer allocatedHours = 0;   // currently allocated hours per week

    @Column(nullable = false)
    private Integer maxCapacityHours = 45; // default 45h/week

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.approvalStatus == null) this.approvalStatus = ApprovalStatus.PENDING;
        if (this.allocatedHours == null) this.allocatedHours = 0;
        if (this.maxCapacityHours == null) this.maxCapacityHours = 45;
    }

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    // Computed utilization %
    @Transient
    public double getUtilizationPercent() {
        if (maxCapacityHours == null || maxCapacityHours == 0) return 0;
        return Math.min(((double) (allocatedHours != null ? allocatedHours : 0) / maxCapacityHours) * 100, 150);
    }

    @Transient
    public String getUtilizationStatus() {
        double pct = getUtilizationPercent();
        if (pct < 70) return "UNDERUTILIZED";
        if (pct <= 100) return "OPTIMAL";
        return "OVERLOADED";
    }
}
