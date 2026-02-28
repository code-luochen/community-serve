import { PartialType } from '@nestjs/swagger';
import { CreateElderlyProfileDto } from './create-elderly-profile.dto';

export class UpdateElderlyProfileDto extends PartialType(
  CreateElderlyProfileDto,
) {}
