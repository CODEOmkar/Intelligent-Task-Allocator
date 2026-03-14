package com.ita.dto;
import lombok.Data;

@Data
public class AssignmentDTO {
    private Long taskId;
    private Long employeeId;
    private Long assignedById;
    private String status;
    private Integer completionPercentage;
    private String notes;
}
