import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../user.entity';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async createUser(@Body() userData: Partial<User>): Promise<User> {
        const user = await this.userService.create(userData);
        return user;
    }

    @Get()
    async getAllUsers(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number): Promise<{ message: string }> {
        await this.userService.delete(id);
        return { message: `User with ID ${id} has been deleted` };
    }
}
