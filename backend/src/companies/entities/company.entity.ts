import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 50, unique: true })
  registrationNo: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 1 is deleted, 0 if soft deleted

  // Relations
  @OneToMany(() => User, (user) => user.company)
  users: User[];
}
