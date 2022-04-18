import { ApiProperty } from '@nestjs/swagger'

export class SignupDto implements Readonly<SignupDto> {
  @ApiProperty()
    email: string

  @ApiProperty()
    password: string

  @ApiProperty()
    confirmPassword: string
}
