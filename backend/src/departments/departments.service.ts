import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
  ) {}

  async create(createDto: CreateDepartmentDto): Promise<Department> {
    const dept = this.deptRepo.create({
      ...createDto,
      status: 1,
    });
    return this.deptRepo.save(dept);
  }

  async findAll(): Promise<Department[]> {
    return this.deptRepo.find({
      where: { status: 1 },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Department> {
    const dept = await this.deptRepo.findOne({ where: { id } });
    if (!dept) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
    return dept;
  }

  async update(id: number, updateDto: UpdateDepartmentDto,): Promise<Department> {
    const dept = await this.findOne(id);
    Object.assign(dept, updateDto);
    return this.deptRepo.save(dept);
  }

  async softDelete(id: number): Promise<void> {
    const dept = await this.findOne(id);
    dept.status = 0;
    await this.deptRepo.save(dept);
  }
}
