import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  avatar?: string;
}
