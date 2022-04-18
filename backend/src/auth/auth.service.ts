import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { comparePwd } from '../common/utils'

import { UserService } from '../user/user.service'

import { IAuthUser } from './auth.interface'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      throw new UnauthorizedException('Username or password is incorrect')
    }
    const compareResult = comparePwd(pass, user.password)

    if (!compareResult) {
      throw new UnauthorizedException('Username or password is incorrect')
    }

    return user
  }

  async signup(entity) { // : Promise<InsertResult>
    if (entity.password !== entity.confirmPassword) {
      throw new BadRequestException('Passwords do not match')
    }
    // delete entity.confirmPassword
    return this.userService.create(entity)
  }

  async login(user: IAuthUser) {
    const payload: IAuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName
    }
    return {
      success: true,
      access_token: this.jwtService.sign(payload),
      user: payload
    }
  }
}
