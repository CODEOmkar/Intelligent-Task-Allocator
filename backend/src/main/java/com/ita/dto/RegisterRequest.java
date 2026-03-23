package com.ita.dto;
import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$", message = "Password must be at least 8 characters long, contain at least 1 digit, 1 lowercase letter, 1 uppercase letter, and 1 special character")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(min = 2, message = "First name must be at least 2 characters")
    @Pattern(regexp = "^[a-zA-Z]+$", message = "Only letters are allowed")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, message = "Last name must be at least 2 characters")
    @Pattern(regexp = "^[a-zA-Z]+$", message = "Only letters are allowed")
    private String lastName;

    private String role;
    private Long departmentId;
    private Long teamId;
    private List<Long> skillIds;
    private Integer experienceYears;
    private Integer maxCapacityHours = 45;
    private String bio;
}
