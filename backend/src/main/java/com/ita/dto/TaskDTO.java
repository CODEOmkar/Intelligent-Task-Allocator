package com.ita.dto;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class TaskDTO {
    private String title;
    private String description;
    private Long projectId;
    private Long departmentId;
    private Long teamId;
    private Long parentTaskId;
    private String status;
    private String priority;
    private Integer estimatedHours;
    private Integer requiredEmployees;
    private LocalDate dueDate;
    private List<Long> requiredSkillIds;
}
