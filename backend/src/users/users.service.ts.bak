import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
// import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()                                                                                         //Enables Dependency Injection
export class UsersService {
  constructor(
    @InjectRepository(User)                                                                           // ye Nest ko bolta h ki mujhe repository do User entity ke liye TypeORM ye help krta manual query na likhne se like SQL like SELECT * FROM usersWHERE id = ?
    private readonly userRepo: Repository<User>,                                                      // Repository --> a TypeORM helper object for one table (one entity) jo help krta sbhi crud opration performe krne ke liye eg dave update find findall
  ) { }                                                                                               // Repository<User> ise pta hai about insert, update, find, delete rows in the users table.

  async create(createDto: any): Promise<any> {                                                        
    const user = this.userRepo.create({                                                               // create entity instance
      ...createDto,
      status: 1,
    });
    return this.userRepo.save(user);
  }
  async findAll(): Promise<any[]> {                                                                   // this.userRepo.find() / findOne() are low-level DB operation // this.findAll() is my own service method
   const rows = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.company', 'company')                                                            // custom cuery likhne ke liye jo kyuki typeORM ki requement user + companyName + departmentNameek hi api me
      .leftJoin('user.department', 'department')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.companyId',
        'user.departmentId',
        'user.status',
        'user.createdAt',
        'user.updatedAt',
        'company.name',
        'department.name',
      ])
      // .where('user.isDelete = :isDelete', { isDelete: 1 })
      .where('user.status = :status', { status: 1 })
      .orderBy('user.id', 'ASC')
      .getRawMany();                                                                                  // getRawMany() returns raw DB column names like user_id, company_name
//                                                                                                    // Frontend expects clean keys: id, companyName, departmentName.
    const mapped = rows.map((r) => ({                                                                 // .map() on the query result to transform raw DB field names into a clean response object
      id: r.user_id,                                                                                  // that thefrontend can use directly (e.g. company_name → companyName)
      name: r.user_name,
      email: r.user_email,
      companyId: r.user_companyId,
      departmentId: r.user_departmentId,
      status: r.user_status,
      // isDelete: r.user_isDelete,
      createdAt: r.user_createdAt,
      updatedAt: r.user_updatedAt,
      companyName: r.company_name,
      departmentName: r.department_name,
    }));

    console.log("\n========== RAW ROWS ==========");
    console.log(rows);

    console.log("\n========== MAPPED ROWS ==========");
    console.log(mapped);

    return mapped;
  }

    async findOne(id: number): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateDto);
    return this.userRepo.save(user);
  }

  async softDelete(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.status = 0;
    await this.userRepo.save(user);
  }
}






/*
  async findAll(): Promise<any[]> {                                                               // this.userRepo.find() / findOne() are low-level DB operation // this.findAll() is my own service method
    const rows = await this.userRepo
      .createQueryBuilder('user')                                                                 // custom cuery likhne ke liye jo kyuki typeORM kyuki requement user + companyName + departmentNameek hi api me
      .leftJoin('user.company', 'company')                                                        // createQueryBuilder help krta hai to join relations and select only required columns.
      .leftJoin('user.department', 'department')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.companyId',
        'user.departmentId',
        'user.status',
        'user.createdAt',
        'user.updatedAt',
        'company.name',
        'department.name',
      ])
      .where('user.status = :status', { status: 1 })
      .orderBy('user.id', 'ASC')
      .getRawMany();                                                                             // getRawMany() returns raw DB column names like user_id, company_name
 //                                                                                                //Frontend expects clean keys: id, companyName, departmentName.
    return rows.map((r) => ({                                                                     // .map() on the query result to transform raw DB field names into a clean response object 
      id: r.user_id,                                                                              // that thefrontend can use directly (e.g. company_name → companyName)
      name: r.user_name,
      email: r.user_email,
      companyId: r.user_companyId,
      departmentId: r.user_departmentId,
      status: r.user_status,
      createdAt: r.user_createdAt,
      updatedAt: r.user_updatedAt,
      companyName: r.company_name,
      departmentName: r.department_name,
    }));
  }

  async findOne(id: number): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateDto);
    return this.userRepo.save(user);
  }

  async softDelete(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.status = 0;
    await this.userRepo.save(user);
  }
}
*/