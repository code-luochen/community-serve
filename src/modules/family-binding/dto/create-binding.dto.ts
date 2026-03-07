import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBindingDto {
  @ApiProperty({
    description: '被捆绑老人的登录名/账号',
    example: 'elderly_zhangsan',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: '家庭关系称呼',
    example: '孙子',
    required: false,
  })
  @IsString()
  relation?: string;
}
