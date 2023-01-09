import { ApolloError } from 'apollo-server-express';
import {
    CreateExperienceInput,
    Experience,
    ExperienceModel,
    UpdateExperienceInput,
} from '../schemas/experience.schema';

export class ExperienceService {
    async createExperience(
        input: CreateExperienceInput & { userId: string }
    ): Promise<Experience> {
        return ExperienceModel.create({
            ...input,
            user: input.userId,
        });
    }

    async findExperiencesByUserId(userId: string): Promise<Experience[]> {
        return ExperienceModel.find({ user: userId })
            .sort({ from: 'descending' })
            .lean();
    }

    async findExperienceById(expId: string): Promise<Experience> {
        return ExperienceModel.findById(expId).lean();
    }

    async updateExperience(input: UpdateExperienceInput): Promise<Experience> {
        const experience = await ExperienceModel.findById(input._id);
        if (!experience) throw new ApolloError('no such experience found');

        if (input.title) experience.title = input.title;
        if (input.company) experience.company = input.company;
        if (input.description) experience.description = input.description;
        if (input.from) experience.from = input.from;
        if (input.to) experience.to = input.to;
        if (input.current) experience.current = input.current;

        await experience.save();
        return experience;
    }

    async deleteExperience(expId: string): Promise<Experience> {
        return ExperienceModel.findByIdAndDelete(expId).lean();
    }
}
