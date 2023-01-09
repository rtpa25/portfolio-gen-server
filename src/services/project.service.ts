import { ApolloError } from 'apollo-server-express';
import {
    CreateProjectInput,
    Project,
    ProjectModel,
    UpdateProjectInput,
} from '../schemas/project.schema';

export class ProjectService {
    async createProject(
        input: CreateProjectInput & { userId: string }
    ): Promise<Project> {
        return ProjectModel.create({
            ...input,
            user: input.userId,
        });
    }
    async findProjectById(projectId: string): Promise<Project> {
        return ProjectModel.findById(projectId).lean();
    }
    async findProjectListByUserId(userId: string): Promise<Project[]> {
        return ProjectModel.find({ user: userId }).lean();
    }
    async updateProject(input: UpdateProjectInput): Promise<Project> {
        const project = await ProjectModel.findById(input._id);
        if (!project) throw new ApolloError('no such project found');

        if (input.demo) project.demo = input.demo;
        if (input.imageUrl) project.imageUrl = input.imageUrl;
        if (input.description) project.description = input.description;
        if (input.title) project.title = input.title;
        if (input.title) project.title = input.title;

        await project.save();
        return project;
    }
    async deleteProject(projectId: string): Promise<Project> {
        return ProjectModel.findByIdAndDelete(projectId).lean();
    }
}
