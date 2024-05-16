import { Controller, Get, Post, Body, UseGuards, SetMetadata } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { get } from 'http';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { Auth } from './decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  userRegister(
    @Body() createUserDto: CreateUserDto
  ) {
    return this.authService.register( createUserDto );
  }

  @Post('login')
  userLogin(
    @Body() loginUserDto: LoginUserDto
  ) {
    return this.authService.login( loginUserDto );
  }
  

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @GetUser() user: User
  ) {
    return 'private view'
  }


  @Get('role')
  @RoleProtected( ValidRoles.super_user, ValidRoles.admin )
  @UseGuards( AuthGuard(), UserRoleGuard )
  testingPrivateRoles(
    @GetUser() user: User
  ) {
    return 'private view two'
  }

  @Get('role')
  @Auth( ValidRoles.admin )
  testingPrivate(
    @GetUser() user: User
  ) {
    return 'private view three'
  }
}
