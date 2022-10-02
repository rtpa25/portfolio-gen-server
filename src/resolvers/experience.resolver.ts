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
  CreateExperienceInput,
  Experience,
  UpdateExperienceInput,
} from '../schemas/experience.schema';
import { ExperienceService } from '../services/experience.service';
import { MyContext } from '../types/context';
import { FieldError } from '../types/error';
import { logger } from '../utils/logger';

@ObjectType()
class ExperienceResponse {
  @Field(() => Experience, { nullable: true })
  experience?: Experience;

  @Field(
    () => {
      return [FieldError];
    },
    { nullable: true }
  )
  errors?: FieldError[];
}

@Resolver()
export class ExperienceResolver {
  constructor(private experienceService: ExperienceService) {
    this.experienceService = new ExperienceService();
  }

  @Mutation(() => ExperienceResponse)
  @UseMiddleware(isAuth)
  async createExperience(
    @Arg('input') input: CreateExperienceInput,
    @Ctx() { req }: MyContext
  ): Promise<ExperienceResponse> {
    //@ts-ignore
    const { userId } = req.session;

    const expList = await this.experienceService.findExperiencesByUserId(
      userId
    );

    let doesExpExist = false;

    expList.forEach((exp) => {
      if (
        exp.title === input.title &&
        exp.description === input.description &&
        exp.company === input.company
      )
        doesExpExist = true;
    });

    if (doesExpExist) {
      return {
        errors: [
          {
            field: 'experience',
            message: 'experience already exists',
          },
        ],
      };
    }

    try {
      const exp = await this.experienceService.createExperience({
        ...input,
        userId,
      });
      return { experience: exp };
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

  @Mutation(() => ExperienceResponse)
  @UseMiddleware(isAuth)
  async updateExperience(
    @Arg('input') input: UpdateExperienceInput,
    @Ctx() { req }: MyContext
  ): Promise<ExperienceResponse> {
    //@ts-ignore
    const { userId } = req.session;

    const exp = await this.experienceService.findExperienceById(input._id);

    if (!exp) {
      return {
        errors: [
          { field: 'experience', message: 'there is no such experience' },
        ],
      };
    }

    if (exp.user?.toString() !== userId) {
      return { errors: [{ field: 'experience', message: 'not authorized' }] };
    }

    try {
      const updatedExp = await this.experienceService.updateExperience(input);
      return { experience: updatedExp };
    } catch (error) {
      logger.error(error);
      return { errors: [{ field: 'unknown', message: error.message }] };
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteExperience(
    @Arg('expId') expId: string,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const exp = await this.experienceService.findExperienceById(expId);

    //@ts-ignore
    const { userId } = req.session;

    if (!exp) {
      return false;
    }

    if (exp.user?.toString() !== userId) return false;

    try {
      await this.experienceService.deleteExperience(expId);
      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }
}
