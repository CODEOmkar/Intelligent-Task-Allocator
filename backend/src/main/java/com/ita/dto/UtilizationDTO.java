package com.ita.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor
public class UtilizationDTO {
    private Long userId;
    private String name;
    private String email;
    private Long departmentId;
    private String departmentName;
    private String teamName;
    private Integer allocatedHours;
    private Integer maxCapacityHours;
    private Double utilizationPercent;
    private String utilizationStatus;  // UNDERUTILIZED / OPTIMAL / OVERLOADED
    private int activeTasks;
}
