import { getModelForClass, prop } from '@typegoose/typegoose';
import { IsString, IsUrl } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';
import { User } from './user.schema';

@ObjectType()
export class Tech {
  @Field(() => String)
  _id: string;

  @Field(() => Date)
  @prop({ required: true, default: Date.now() })
  createdAt: Date;

  @Field(() => String)
  @prop({ required: true })
  name: string;

  @Field(() => String)
  @prop({ required: true })
  imageUrl: string;

  @Field(() => String)
  @prop({ required: true, enum: ['beginner', 'intermediate', 'advanced'] })
  proficiency: 'beginner' | 'intermediate' | 'advanced';

  @Field(() => String, { nullable: false })
  @prop({
    required: true,
    ref: 'User',
    type: () => String,
  })
  user: User;
}

export const TechModel = getModelForClass(Tech);

@InputType()
export class CreateTechInput {
  @Field(() => String)
  @IsString({
    message: 'Name must be a string',
  })
  name: string;

  @Field(() => String)
  @IsUrl(
    {},
    {
      message: 'imageUrl must be a valid URL',
    }
  )
  imageUrl: string;

  @Field(() => String)
  @IsString({
    groups: ['beginner', 'intermediate', 'advanced'],
  })
  proficiency: 'beginner' | 'intermediate' | 'advanced';
}

@InputType()
export class UpdateTechInput {
  @Field(() => String)
  _id: string;

  @Field(() => String, { nullable: true })
  @IsUrl(
    {},
    {
      message: 'imageUrl must be a valid URL',
    }
  )
  imageUrl?: string;

  @Field(() => String, { nullable: true })
  @IsString({
    groups: ['beginner', 'intermediate', 'advanced'],
  })
  proficiency?: 'beginner' | 'intermediate' | 'advanced';
}
