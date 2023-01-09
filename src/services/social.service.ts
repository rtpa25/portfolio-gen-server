import {
    CreateSocialLinksInput,
    SocialLinks,
    SocialLinksModel,
} from '../schemas/social.schema';

export class SocialLinksService {
    async createSocialLink(
        input: CreateSocialLinksInput & { userId: string }
    ): Promise<SocialLinks> {
        return SocialLinksModel.create({
            ...input,
            user: input.userId,
        });
    }
    async findSocialLinksByUserId(userId: string): Promise<SocialLinks[]> {
        return SocialLinksModel.find({ user: userId }).lean();
    }
    async findSocialLinkById(id: string): Promise<SocialLinks> {
        return SocialLinksModel.findById(id).lean();
    }
    async deleteSocialLinkById(id: string): Promise<SocialLinks> {
        return SocialLinksModel.findByIdAndDelete(id).lean();
    }
}
