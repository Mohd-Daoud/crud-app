import {
  Controller,
  Get,
  Post,
  Body,                                                                                             //request body ko extract karta hai
  Param,                                                                                            // URL se parameters (like /users/:id) ko extract karta hai
  Patch,                                                                                            // for update
  Delete,                                                                                           
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException                                                                                    // parameter ko string se number me convert karta hai automatically.
} from '@nestjs/common';                                                                            // NestJS ke decorators
import { UsersService } from './users.service';                                                     // usersService --> NestJS automatically UsersService ko object create krega of inject karega.
import { CreateUserDto } from './dto/create-user.dto';                                              // Data Transfer Object User ke input data (POST/UPDATE) ko validate aur structure karne ke kaam aata hai.
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

@Controller('users')
export class UsersController {                                                                      //controller ka kaam Sirf request lene ka h, params/body ko extract karne ka, aur service function ko call karne ka.
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {                                                        //@Param('id') → id ko extract karta h.
    return this.usersService.findOne(id);                                                                  // ParseIntPipe -> id ko number convert krta h (common bugs ko avoid krta ha)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,                                                                           //Body se new data extract krta hai
  ) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  softDelete(@Param('id', ParseIntPipe) id: number) { 
    return this.usersService.softDelete(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded or file is empty. Use form field name "file".');
    }

    const result = await this.usersService.importUsers(file.buffer);
    return result;
  }
}
