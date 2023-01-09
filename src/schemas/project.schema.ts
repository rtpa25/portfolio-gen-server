import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Field, InputType, ObjectType } from 'type-graphql';
import { User } from './user.schema';

@ObjectType()
export class Project {
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
    description: string;

    @Field(() => String)
    @prop({ required: true })
    github: string;

    @Field(() => String)
    @prop({ required: true })
    demo: string;

    @Field(() => [String])
    @prop({ required: true })
    tech: string[];

    @Field(() => String)
    @prop({ required: true })
    imageUrl: string;

    @Field(() => String)
    @prop({ required: true, ref: 'User' })
    user: Ref<User>;
}

export const ProjectModel = getModelForClass(Project);

@InputType()
export class CreateProjectInput {
    @Field(() => String)
    title: string;

    @Field(() => String)
    description: string;

    @Field(() => String)
    github: string;

    @Field(() => String)
    demo: string;

    @Field(() => [String])
    tech: string[];

    @Field(() => String)
    imageUrl: string;
}

@InputType()
export class UpdateProjectInput {
    @Field(() => String)
    _id: string;

    @Field(() => String, { nullable: true })
    title: string;

    @Field(() => String, { nullable: true })
    description: string;

    @Field(() => String, { nullable: true })
    demo: string;

    @Field(() => String, { nullable: true })
    github: string;

    @Field(() => [String], { nullable: true })
    tech: string[];

    @Field(() => String, { nullable: true })
    imageUrl: string;
}
