import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { WorkspaceType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

@InputType({ description: 'Данные для создания рабочего места' })
export class CreateWorkspaceInput {
  @Field(() => WorkspaceType, { description: 'Тип рабочего места' })
  @IsEnum(WorkspaceType)
  type: WorkspaceType;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 1,
    description: 'Вместимость (количество мест)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: true,
    description: 'Доступность',
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @Field(() => ID, { description: 'Идентификатор библиотеки' })
  @IsString()
  @IsNotEmpty()
  libraryId: string;
}

@InputType({ description: 'Данные для обновления рабочего места' })
export class UpdateWorkspaceInput {
  @Field(() => WorkspaceType, {
    nullable: true,
    description: 'Тип рабочего места',
  })
  @IsOptional()
  @IsEnum(WorkspaceType)
  type?: WorkspaceType;

  @Field(() => Int, { nullable: true, description: 'Вместимость' })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @Field(() => ID, { nullable: true, description: 'Идентификатор библиотеки' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  libraryId?: string;
}
