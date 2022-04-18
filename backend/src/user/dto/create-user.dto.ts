import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto implements Readonly<CreateUserDto> {
  id: string

  @ApiProperty()
    email: string

  @ApiProperty()
    firstName: string

  @ApiProperty()
    lastName: string

  @ApiProperty()
    password: string
}
