import argon2 from 'argon2';
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { v4 as uuid } from 'uuid';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { isAuth } from '../middlewares/isAuth';
import {
    SignInInput,
    SignUpInput,
    UpdateUserProfileInput,
    User,
} from '../schemas/user.schema';
import { ExperienceService } from '../services/experience.service';
import { ProjectService } from '../services/project.service';
import { SocialLinksService } from '../services/social.service';
import { TechService } from '../services/tech.service';
import { UserService } from '../services/user.service';
import { MyContext } from '../types/context';
import { FieldError } from '../types/error';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/sendEmail';

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

@Resolver(User)
export class UserResolver {
    constructor(
        private userService: UserService,
        private techService: TechService,
        private projectService: ProjectService,
        private experienceService: ExperienceService,
        private socialLinkService: SocialLinksService
    ) {
        this.userService = new UserService();
        this.techService = new TechService();
        this.projectService = new ProjectService();
        this.experienceService = new ExperienceService();
        this.socialLinkService = new SocialLinksService();
    }

    @FieldResolver()
    async techList(@Root() user: User) {
        return this.techService.findTechListByUserId(user._id);
    }

    @FieldResolver()
    async projectList(@Root() user: User) {
        return this.projectService.findProjectListByUserId(user._id);
    }

    @FieldResolver()
    async experienceList(@Root() user: User) {
        return this.experienceService.findExperiencesByUserId(user._id);
    }

    @FieldResolver()
    async socialLinks(@Root() user: User) {
        return this.socialLinkService.findSocialLinksByUserId(user._id);
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

    @Query(() => User, { nullable: true })
    async userProfile(@Arg('id') id: string): Promise<User | null> {
        return this.userService.findById(id);
    }

    @Mutation(() => UserResponse)
    async signUp(
        @Arg('input') input: SignUpInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        try {
            const user = await this.userService.createUser(input);
            //@ts-ignore
            req.session.userId = user._id; //this line triggers express-session to set a cookie on the user and keep them logged in
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
        // @ts-ignore
        req.session.userId = user._id;

        return { user };
    }

    @Mutation(() => Boolean)
    async signOut(@Ctx() { req, res }: MyContext): Promise<boolean> {
        return new Promise((resolve) => {
            res.clearCookie(COOKIE_NAME);
            req.session.destroy((err) => {
                if (err) {
                    logger.error(err);
                    resolve(false);
                }
                resolve(true);
            });
        });
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redisClient }: MyContext
    ): Promise<Boolean> {
        const user = await this.userService.findByEmail(email);

        if (!user) return true;

        const token = uuid();

        await redisClient.set(
            FORGET_PASSWORD_PREFIX + token,
            user._id,
            'EX',
            1000 * 60 * 60 * 24 * 3 //3 day expiration
        );

        await sendEmail(
            email,
            `
        <a href="http://localhost:3000/auth/changePassword/${token}">reset password</a>
      `
        );

        return true;
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { req, redisClient }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length < 4) {
            return {
                errors: [
                    {
                        field: 'newPassword',
                        message: 'password must be at least 4 characters long',
                    },
                ],
            };
        }
        const userId = await redisClient.get(FORGET_PASSWORD_PREFIX + token);

        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'token expired',
                    },
                ],
            };
        }

        const user = await this.userService.findById(userId);

        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'user no longer exists',
                    },
                ],
            };
        }

        const hashedPassword = await argon2.hash(newPassword);

        await this.userService.updateUser(user._id, {
            password: hashedPassword,
        });

        await redisClient.del(FORGET_PASSWORD_PREFIX + token);

        //@ts-ignore
        req.session.userId = user._id;
        return { user };
    }

    @Mutation(() => UserResponse)
    @UseMiddleware(isAuth)
    async updateUserProfile(
        @Arg('input') input: UpdateUserProfileInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        //@ts-ignore
        const { userId } = req.session;
        try {
            const updatedUser = await this.userService.updateUser(
                userId,
                input
            );

            if (updatedUser) {
                return {
                    user: updatedUser,
                };
            } else {
                return {
                    errors: [{ field: 'user', message: 'no such user found' }],
                };
            }
        } catch (error) {
            logger.error(error);
            return { errors: [{ field: 'unknown', message: error.message }] };
        }
    }
}
