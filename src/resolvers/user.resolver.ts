import argon2 from 'argon2';
import { SignInInput, SignUpInput, User } from '../schemas/user.schema';
import {
  Query,
  Resolver,
  Mutation,
  Arg,
  Ctx,
  Field,
  ObjectType,
} from 'type-graphql';
import { MyContext } from '../types/context';
import { FieldError } from '../types/error';
import { UserService } from '../services/user.service';
import { logger } from '../utils/logger';

@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(
    () => {
      return [FieldError];
    },
    { nullable: true }
  )
  errors?: FieldError[];
}

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | null> {
    //@ts-ignore
    const userId = req.session.userId;

    if (!userId) {
      return null;
    }

    return this.userService.findById(userId);
  }

  @Mutation(() => UserResponse)
  async signUp(
    @Arg('input') input: SignUpInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    try {
      const user = await this.userService.createUser(input);
      //@ts-ignore
      req.session.userId = user._id;
      return {
        user,
      };
    } catch (error: any) {
      logger.error(error);
      return {
        errors: [
          {
            field: 'user',
            message: error.message,
          },
        ],
      };
    }
  }

  @Mutation(() => UserResponse)
  async signIn(
    @Arg('input') input: SignInInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await this.userService.findByEmail(input.email);
    if (!user) {
      return {
        errors: [
          {
            field: 'email',
            message: 'user does not exist',
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, input.password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect credentials',
          },
        ],
      };
    }
    //@ts-ignore
    req.session.userId = user.id;

    return { user };
  }
}
