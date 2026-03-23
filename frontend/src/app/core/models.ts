export interface User {
  id: number; email: string; firstName: string; lastName: string;
  role: 'PROJECT_MANAGER' | 'DEPARTMENT_HEAD' | 'TEAM_LEAD' | 'EMPLOYEE';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  department?: Department; team?: Team; skills?: Skill[];
  experienceYears?: number; bio?: string;
  allocatedHours?: number; maxCapacityHours?: number;
  utilizationPercent?: number; utilizationStatus?: string;
}

export interface Department { id: number; name: string; description?: string; head?: User; }
export interface Team { id: number; name: string; department?: Department; teamLead?: User; description?: string; }
export interface Skill { id: number; name: string; category?: string; }

export interface Project {
  id: number; name: string; description?: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string; endDate?: string; deadline?: string;
  createdBy?: User; requiredSkills?: Skill[]; createdAt?: string;
}

export interface Task {
  id: number; title: string; description?: string; project?: Project;
  department?: Department; team?: Team;
  parentTask?: { id: number; title: string };
  status: 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours?: number; requiredEmployees?: number; dueDate?: string;
  requiredSkills?: Skill[]; createdAt?: string;
}

export interface TaskAssignment {
  id: number; task?: Task; employee?: User; assignedBy?: User;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REMOVED';
  completionPercentage?: number; assignedDate?: string; completionDate?: string; notes?: string;
}

export interface UtilizationDTO {
  userId: number; name: string; email: string;
  departmentId?: number; departmentName?: string; teamName?: string;
  allocatedHours: number; maxCapacityHours: number;
  utilizationPercent: number; utilizationStatus: 'UNDERUTILIZED' | 'OPTIMAL' | 'OVERLOADED';
  activeTasks: number;
}

export interface ApiResponse<T> { success: boolean; message: string; data: T; }

export interface AuthState {
  token: string; id: number; email: string; firstName: string; lastName: string;
  role: string; approvalStatus: string; departmentId?: number; departmentName?: string;
  teamId?: number; teamName?: string;
}
