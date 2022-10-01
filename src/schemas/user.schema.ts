import { getModelForClass, Index, pre, prop } from '@typegoose/typegoose';
import { hash } from 'argon2';
import { IsEmail, MaxLength, MinLength } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';
import { Experience } from './experience.schema';
import { Project } from './project.schema';
import { SocialLinks } from './social.schema';
import { Tech } from './tech.schema';

@ObjectType()
@pre<User>('save', async function () {
  if (!this.isModified('password')) return;
  const hashedPassword = await hash(this.password);
  this.password = hashedPassword;
})
@Index({ email: 1 })
export class User {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true, unique: true })
  email: string;

  @Field(() => String)
  @prop({ required: true, unique: true })
  username: string;

  @Field(() => String, { nullable: true })
  @prop({ required: false, unique: false })
  oneLiner: string;

  @Field(() => String, { nullable: true })
  @prop({ required: false, unique: false })
  status: string;

  @Field(() => String, { nullable: true })
  @prop({ required: false, unique: false })
  about: string;

  @Field(() => Date)
  @prop({ required: true, default: Date.now() })
  createdAt: Date;

  @Field(() => String)
  @prop({
    required: true,
    default: 'https://i.ibb.co/3p0SPn6/default-avatar.jpg',
  })
  avatar: string;

  @prop({ required: true })
  password: string;

  @Field(() => [Tech])
  @prop({ required: true, default: [], ref: 'Tech' })
  techList: Tech[];

  @Field(() => [Project])
  @prop({ required: true, default: [], ref: 'Project' })
  projectList: Project[];

  @Field(() => [Experience])
  @prop({ required: true, default: [], ref: 'Experience' })
  experienceList: Experience[];

  @Field(() => [SocialLinks])
  @prop({ required: true, default: [], ref: 'SocialLinks' })
  socialLinks: SocialLinks[];
}

export const UserModel = getModelForClass(User);

@InputType()
export class SignUpInput {
  @Field(() => String)
  @IsEmail(
    {},
    {
      message: 'Email must be a valid email address',
    }
  )
  email: string;

  @Field(() => String)
  username: string;

  @Field(() => String)
  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @MaxLength(50, {
    message: 'Password must be at least 50 characters long',
  })
  password: string;
}

@InputType()
export class SignInInput {
  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  password: string;
}

@InputType()
export class UpdateUserProfileInput {
  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  oneLiner?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  about?: string;
}
