import { ApolloError } from 'apollo-server-express';
import {
  CreateTechInput,
  Tech,
  TechModel,
  UpdateTechInput,
} from '../schemas/tech.schema';

export class TechService {
  async createTech(input: CreateTechInput & { userId: string }): Promise<Tech> {
    return TechModel.create({
      ...input,
      user: input.userId,
    });
  }
  async findTechById(techId: string): Promise<Tech> {
    return TechModel.findById(techId).lean();
  }
  async findTechListByUserId(userId: string): Promise<Tech[]> {
    return TechModel.find({ user: userId }).lean();
  }
  async updateTech(input: UpdateTechInput): Promise<Tech> {
    const tech = await TechModel.findById(input._id);
    if (!tech) throw new ApolloError('no such tech found');

    if (input.proficiency) tech.proficiency = input.proficiency;
    if (input.imageUrl) tech.imageUrl = input.imageUrl;

    await tech.save();
    return tech;
  }
  async deleteTech(techId: string): Promise<Tech> {
    return TechModel.findByIdAndDelete(techId).lean();
  }
}
