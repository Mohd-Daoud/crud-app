import { Module } from '@nestjs/common';                                                                //NestJS ka decorator. Batata hai ki ye ek module hai.
import { TypeOrmModule } from '@nestjs/typeorm';                                                        //TypeORM ko NestJS ke saath connect karne ke liye use hota hai.

import { UsersService } from './users.service';                                                         // logic yaha hota hai
import { UsersController } from './users.controller';                                                                    
import { User } from './entities/user.entity';                                                          // database table ka model/entity

@Module({
  imports: [TypeOrmModule.forFeature([User])],                                                          // yha TypeORM ko bataya ja rha h ki User table ka access de do, taaki main database operations kar saku.
  controllers: [UsersController],                                                                       // usersService ko UserRepository nahi milta     controller->users se related endpoints 
  providers: [UsersService],                                                                            // Provider ek class jisse NestJS dependency injection me use kar sake  //	NestJS isko automatically inject karega.
  exports: [UsersService],                                                                              // UsersService ko baaki modules me use krne ke liye
})                                                                                                      // UsersService ko baaki modules me me use kiya ske
export class UsersModule {}
