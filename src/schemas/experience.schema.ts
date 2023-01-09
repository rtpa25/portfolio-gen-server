import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Field, InputType, ObjectType } from 'type-graphql';
import { User } from './user.schema';

@ObjectType()
export class Experience {
    @Field(() => String)
    _id: string;

    @Field(() => Date)
    @prop({ required: true, default: Date.now() })
    createdAt: Date;

    @Field(() => String)
    @prop({ required: true })
    title: string;

    @Field(() => String)
    @prop({ required: true })
    company: string;

    @Field(() => Date)
    @prop({ required: true })
    from: Date;

    @Field(() => Date)
    @prop({ required: true })
    to: Date;

    @Field(() => Boolean)
    @prop({ required: false })
    current: boolean;

    @Field(() => String)
    @prop({ required: true })
    description: string;

    @Field(() => String)
    @prop({ required: true, ref: 'User' })
    user: Ref<User>;
}

export const ExperienceModel = getModelForClass(Experience);

@InputType()
export class CreateExperienceInput {
    @Field(() => String)
    title: string;

    @Field(() => String)
    company: string;

    @Field(() => String)
    description: string;

    @Field(() => Date)
    from: Date;

    @Field(() => Date)
    to: Date;

    @Field(() => Boolean, { nullable: true })
    current?: boolean;
}

@InputType()
export class UpdateExperienceInput {
    @Field(() => String)
    _id: string;

    @Field(() => String, { nullable: true })
    title?: string;

    @Field(() => String, { nullable: true })
    company?: string;

    @Field(() => String, { nullable: true })
    description?: string;

    @Field(() => Date, { nullable: true })
    from?: Date;

    @Field(() => Date, { nullable: true })
    to?: Date;

    @Field(() => Boolean, { nullable: true })
    current?: boolean;
}
