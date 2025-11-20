
export class CreateUserDto {
  name?: string;
  email?: string | null;
  companyId?: number | null;
  departmentId?: number | null;
  status?: number;
}

