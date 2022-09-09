import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { IsString, IsUrl } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';
import { User } from './user.schema';

@ObjectType()
export class SocialLinks {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true })
  link: string;

  @Field(() => String)
  @prop({
    required: true,
    enum: [
      'Github',
      'Email',
      'Twitter',
      'Linkedin',
      'Youtube',
      'Website',
      'Medium',
    ],
  })
  name:
    | 'Github'
    | 'Email'
    | 'Twitter'
    | 'Linkedin'
    | 'Youtube'
    | 'Website'
    | 'Medium';

  @Field(() => String)
  @prop({ required: true, ref: 'User' })
  user: Ref<User>;
}

export const SocialLinksModel = getModelForClass(SocialLinks);

@InputType()
export class CreateSocialLinksInput {
  @Field(() => String)
  @IsUrl({}, { message: 'Link must be a valid URL' })
  link: string;

  @Field(() => String)
  @IsString({
    groups: [
      'Github',
      'Email',
      'Twitter',
      'Linkedin',
      'Youtube',
      'Website',
      'Medium',
    ],
    message: 'Name must be one of the supported links',
  })
  name:
    | 'Github'
    | 'Email'
    | 'Twitter'
    | 'Linkedin'
    | 'Youtube'
    | 'Website'
    | 'Medium';
}
