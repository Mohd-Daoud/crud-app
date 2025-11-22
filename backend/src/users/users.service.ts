import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as XLSX from 'xlsx';
// import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MessagePort } from 'worker_threads';

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

  // / code for import excel data
  async importUsers(buffer: Buffer) {
    const workbook = XLSX.read(buffer);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    // Convert to JSON rows 
    // const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);

    await this.userRepo.upsert(rawRows as User[], ['id']);
    return { Message: "Data Stored" }
  }

  // async importUsers(buffer: Buffer) {
  //   const workbook = XLSX.read(buffer, { type: 'buffer' });
  //   const firstSheetName = workbook.SheetNames[0];
  //   const sheet = workbook.Sheets[firstSheetName];

  //   if (!sheet) {
  //     return { success: 0, skipped: 0, errors: ['No sheet found'], preview: [], totalRows: 0 };
  //   }

  //   const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  //   const preview: any[] = [];
  //   const errors: any[] = [];
  //   let success = 0;

  //   for (let i = 0; i < rows.length; i++) {
  //     const r = rows[i];
  //     const excelRow = i + 2; // header assumed on row 1

  //     // --- extract fields (flexible column names) ---
  //     const rawId = r.id ?? r.ID ?? r.Id ?? '';
  //     const id = rawId === '' ? null : Number(rawId);
  //     const name = String(r.name ?? r.Name ?? '').trim();
  //     const emailRaw = String(r.email ?? r.Email ?? '').trim();
  //     const email = emailRaw === '' ? null : emailRaw;
  //     const companyName = String(r.company ?? r.companyName ?? r.Company ?? '').trim();
  //     const departmentName = String(r.department ?? r.departmentName ?? r.Department ?? '').trim();
  //     const rawStatus = r.status ?? r.Status ?? '';

  //     // basic validation
  //     if (!name && !email) {
  //       errors.push({ row: excelRow, reason: 'Missing name or email' });
  //       continue;
  //     }

  //     // --- status mapping: map strings -> integers because DB expects integer ---
  //     let statusValue: number | null = null;
  //     if (rawStatus === '' || rawStatus === null || rawStatus === undefined) {
  //       statusValue = 1; // default active = 1
  //     } else {
  //       const asNum = Number(rawStatus);
  //       if (!Number.isNaN(asNum) && String(rawStatus).trim() !== '') {
  //         statusValue = Math.trunc(asNum);
  //       } else {
  //         const s = String(rawStatus).toLowerCase().trim();
  //         if (s === 'active' || s === 'enable' || s === 'enabled' || s === '1') {
  //           statusValue = 1;
  //         } else if (s === 'inactive' || s === 'disable' || s === 'disabled' || s === '0') {
  //           statusValue = 0;
  //         } else {
  //           errors.push({ row: excelRow, reason: `Invalid status value: "${rawStatus}"` });
  //           continue;
  //         }
  //       }
  //     }

  //     // --- resolve Company by name (required only if companyName provided) ---
  //     let companyId: number | null = null;
  //     if (companyName) {
  //       const cmp = await this.userRepo.manager.findOne('Company' as any, {
  //         where: { name: companyName } as any,
  //       });
  //       if (!cmp) {
  //         errors.push({ row: excelRow, reason: `Company not found: ${companyName}` });
  //         continue;
  //       }
  //       companyId = (cmp as any).id;
  //     }

  //     
  //     let departmentId: number | null = null;
  //     if (departmentName) {
  //       const dept = await this.userRepo.manager.findOne('Department' as any, {
  //         where: { name: departmentName } as any,
  //       });
  //       if (!dept) {
  //         errors.push({ row: excelRow, reason: `Department not found: ${departmentName}` });
  //         continue;
  //       }
  //       departmentId = (dept as any).id;
  //     }

  //     // --- build payload matching your User entity ---
  //     const payload: any = {
  //       name: name || null,
  //       email: email || null,
  //       companyId,
  //       departmentId,
  //       status: statusValue,
  //     };

  //     // --- perform update (if id present) or insert (if no id) ---
  //     try {
  //       if (id) {
  //         // if id provided, update existing user (if exists) else insert as new
  //         const existing = await this.userRepo.findOne({ where: { id } });
  //         if (existing) {
  //           await this.userRepo.update(id, payload);
  //         } else {
  //           await this.userRepo.insert(payload);
  //         }
  //       } else {
  //         await this.userRepo.insert(payload);
  //       }

  //       success++;
  //       preview.push({ id: id ?? 'NEW', ...payload });
  //     } catch (err: any) {
  //       errors.push({ row: excelRow, reason: err?.message ?? 'DB error' });
  //     }
  //   }

  //   return {
  //     success,
  //     skipped: errors.length,
  //     errors,
  //     preview,
  //     totalRows: rows.length,
  //   };
  // }


}





// const parsedRows: any[] = [];
// const errors: { row: number; reason: string }[] = [];
// let successCount = 0;
// let skippedCount = 0;

// rawRows.forEach((r, idx) => {
//   const name = r['name'] ?? r['Name'] ?? '';
//   const email = r['email'] ?? r['Email'] ?? '';

//   if (!name && !email) {
//     errors.push({ row: idx + 2, reason: 'Missing both name and email' });
//     skippedCount++;
//     return;
//   }

//   parsedRows.push({
//     name: name || null,
//     email: email || null,
//   });

//   successCount++;
// });

// return {
//   success: successCount,
//   skipped: skippedCount,
//   errors,
//   preview: parsedRows.slice(0, 20),
//   totalRows: rawRows.length,
// };


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