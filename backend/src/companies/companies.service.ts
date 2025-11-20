import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(createDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepo.create({
      ...createDto,
      status: 1,
    });
    return this.companyRepo.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepo.find({
      where: { status: 1 },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return company;
  }

  async update(id: number, updateDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, updateDto);
    return this.companyRepo.save(company);
  }

  // for soft delete for status will set to = 0
  async softDelete(id: number): Promise<void> {
    const company = await this.findOne(id);
    company.status = 0;
    await this.companyRepo.save(company);
  }
}
