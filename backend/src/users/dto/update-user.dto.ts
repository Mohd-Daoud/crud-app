export class UpdateUserDto {
  name?: string;
  email?: string | null;
  companyId?: number | null;
  departmentId?: number | null;
  status?: number;
}