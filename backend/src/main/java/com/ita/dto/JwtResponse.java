package com.ita.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class JwtResponse {
    private String token;
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String approvalStatus;
    private Long departmentId;
    private String departmentName;
    private Long teamId;
    private String teamName;
}
