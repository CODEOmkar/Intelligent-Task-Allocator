package com.ita.dto;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ProjectDTO {
    private String name;
    private String description;
    private String status;
    private String priority;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate deadline;
    private Long createdById;
    private List<Long> requiredSkillIds;
}
