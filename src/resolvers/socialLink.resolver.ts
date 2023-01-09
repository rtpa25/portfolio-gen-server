import {
    Arg,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { isAuth } from '../middlewares/isAuth';
import { CreateSocialLinksInput, SocialLinks } from '../schemas/social.schema';
import { SocialLinksService } from '../services/social.service';
import { MyContext } from '../types/context';
import { FieldError } from '../types/error';
import { logger } from '../utils/logger';

@ObjectType()
class SocialLinkResponse {
    @Field(() => SocialLinks, { nullable: true })
    socialLink?: SocialLinks;

    @Field(
        () => {
            return [FieldError];
        },
        { nullable: true }
    )
    errors?: FieldError[];
}

@Resolver()
export class SocialLinkResolver {
    constructor(private socialLinkService: SocialLinksService) {
        this.socialLinkService = new SocialLinksService();
    }

    @Mutation(() => SocialLinkResponse)
    @UseMiddleware(isAuth)
    async createSocialLink(
        @Arg('input') input: CreateSocialLinksInput,
        @Ctx() { req }: MyContext
    ): Promise<SocialLinkResponse> {
        //@ts-ignore
        const { userId } = req.session;

        const socialLinksList =
            await this.socialLinkService.findSocialLinksByUserId(userId);

        let doesLinkExist = false;

        socialLinksList.forEach((socialLink) => {
            if (socialLink.link === input.link) {
                doesLinkExist = true;
            }
        });

        if (doesLinkExist) {
            return {
                errors: [
                    {
                        field: 'socialLink',
                        message: 'Social Link already exists',
                    },
                ],
            };
        }

        try {
            const socialLink = await this.socialLinkService.createSocialLink({
                ...input,
                userId,
            });

            return { socialLink };
        } catch (error) {
            logger.error(error);
            return {
                errors: [
                    {
                        field: 'unknown',
                        message: error.message,
                    },
                ],
            };
        }
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deleteSocialLink(
        @Arg('linkId') linkId: string,
        @Ctx() { req }: MyContext
    ): Promise<boolean> {
        const link = await this.socialLinkService.findSocialLinkById(linkId);
        //@ts-ignore
        const { userId } = req.session;

        if (!link) {
            return false;
        }

        if (link.user?.toString() !== userId) {
            return false;
        }

        try {
            await this.socialLinkService.deleteSocialLinkById(linkId);
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }
}
