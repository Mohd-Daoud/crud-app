import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column()
  companyId: number; // FK → companies.id

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 1 is deleted, 0 if soft deleted

  // Relations
  @OneToMany(() => User, (user) => user.department)
  users: User[];
}
