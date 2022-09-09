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
import {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from '../schemas/project.schema';
import { ProjectService } from '../services/project.service';
import { MyContext } from '../types/context';
import { FieldError } from '../types/error';
import { logger } from '../utils/logger';

@ObjectType()
class ProjectResponse {
  @Field(() => Project, { nullable: true })
  project?: Project;

  @Field(
    () => {
      return [FieldError];
    },
    { nullable: true }
  )
  errors?: FieldError[];
}

@Resolver()
export class ProjectResolver {
  constructor(private projectService: ProjectService) {
    this.projectService = new ProjectService();
  }

  @Mutation(() => ProjectResponse)
  @UseMiddleware(isAuth)
  async createProject(
    @Arg('input') input: CreateProjectInput,
    @Ctx() { req }: MyContext
  ): Promise<ProjectResponse> {
    //@ts-ignore
    const { userId } = req.session;

    const projectsList = await this.projectService.findProjectListByUserId(
      userId
    );

    let doesTechExist = false;

    projectsList.forEach((project) => {
      if (
        project.title === input.title &&
        project.description === input.description
      )
        doesTechExist = true;
    });

    if (doesTechExist) {
      return {
        errors: [
          {
            field: 'project',
            message: 'project already exists',
          },
        ],
      };
    }

    try {
      const project = await this.projectService.createProject({
        ...input,
        userId,
      });
      return { project };
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

  @Mutation(() => ProjectResponse)
  @UseMiddleware(isAuth)
  async updateProject(
    @Arg('input') input: UpdateProjectInput,
    @Ctx() { req }: MyContext
  ): Promise<ProjectResponse> {
    //@ts-ignore
    const { userId } = req.session;

    const project = await this.projectService.findProjectById(input._id);

    if (!project) {
      return {
        errors: [{ field: 'project', message: 'there is no such project' }],
      };
    }

    if (project.user?.toString() === userId) {
      return { errors: [{ field: 'project', message: 'not authorized' }] };
    }

    try {
      const updatedProject = await this.projectService.updateProject(input);
      return { project: updatedProject };
    } catch (error) {
      logger.error(error);
      return { errors: [{ field: 'unknown', message: error.message }] };
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteProject(
    @Arg('projectId') projectId: string,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const project = await this.projectService.findProjectById(projectId);

    //@ts-ignore
    const { userId } = req.session;

    if (!project) {
      return false;
    }

    if (project.user !== userId) return false;

    try {
      await this.projectService.deleteProject(projectId);
      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }
}
