package com.ita.dto;
import lombok.Data;
import java.util.List;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String role;
    private Long departmentId;
    private Long teamId;
    private List<Long> skillIds;
    private Integer experienceYears;
    private Integer maxCapacityHours;
    private String bio;
}
