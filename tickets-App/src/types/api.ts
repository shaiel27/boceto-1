export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: any;
  errors?: Record<string, string[]>;
}

export interface BackendUser {
  ID_Users: string;
  id: string;
  Email: string;
  email: string;
  Full_Name: string;
  full_name: string;
  Role: string;
  role: string;
  role_name: string;
  ID_Role?: string;
  office_id?: string | null;
  office_name?: string;
  office_type?: string;
  last_login_at?: string | null;
  created_at?: string;
}

export interface BackendTicket {
  ID_Service_Request: number;
  Ticket_Code: string | null;
  Fk_Office: number;
  Fk_User_Requester: number;
  Fk_TI_Service: number;
  Fk_Problem_Catalog: number;
  Fk_Boss_Requester: number | null;
  Fk_Software_System: number | null;
  Subject: string;
  Property_Number: string | null;
  Description: string;
  System_Priority: string;
  Resolution_Notes: string | null;
  Status: string;
  Created_at: string;
  Resolved_at: string | null;
  is_returned?: number;
  user_name: string;
  user_email?: string;
  office_name: string;
  office_type: string;
  service_type_name: string;
  problem_name?: string;
  citizen_name?: string;
  boss_name: string | null;
  technicians: BackendTicketTechnician[];
}

export interface BackendTicketTechnician {
  ID_Technicians: number;
  name: string;
  is_lead: number;
  role: string | null;
  assigned_at: string;
  assignment_status: string;
  email: string;
}

export interface BackendAttachment {
  ID_Attachment: number;
  Fk_Service_Request: number;
  Fk_Comment: number | null;
  Fk_User: number;
  File_Name: string;
  File_Path: string;
  File_Type: string;
  File_Size: number;
  Uploaded_at: string;
}

export interface BackendComment {
  ID_Comment: number;
  Fk_Service_Request: number;
  Fk_User: number;
  Comment: string;
  Created_at: string;
  user_name: string;
  user_email?: string;
  user_role: string;
  attachments?: BackendAttachment[];
}

export interface BackendTimeline {
  ID_Timeline: number;
  Fk_Service_Request: number;
  Fk_User_Actor: number;
  Action_Description: string;
  Old_Status: string | null;
  New_Status: string | null;
  Event_Date: string;
  User_Name: string;
}

export interface BackendTechnicianProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  status: string;
  lunch_block: number | null;
  lunch_block_name: string | null;
  lunch_start_time: string | null;
  lunch_end_time: string | null;
  created_at: string;
  services: BackendTechnicianService[];
  schedules: BackendTechnicianSchedule[];
}

export interface BackendTechnicianService {
  ID_TI_Service: number;
  Type_Service: string;
  Details: string;
}

export interface BackendTechnicianSchedule {
  ID_Schedule: number;
  Fk_Technician: number;
  Day_Of_Week: string;
  Work_Start_Time: string;
  Work_End_Time: string;
}
