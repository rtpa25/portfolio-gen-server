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
import { CreateTechInput, Tech, UpdateTechInput } from '../schemas/tech.schema';
import { TechService } from '../services/tech.service';
import { MyContext } from '../types/context';
import { FieldError } from '../types/error';
import { logger } from '../utils/logger';

@ObjectType()
class TechResponse {
  @Field(() => Tech, { nullable: true })
  tech?: Tech;

  @Field(
    () => {
      return [FieldError];
    },
    { nullable: true }
  )
  errors?: FieldError[];
}

@Resolver()
export class TechResolver {
  constructor(private techService: TechService) {
    this.techService = new TechService();
  }

  @Mutation(() => TechResponse)
  @UseMiddleware(isAuth)
  async createTech(
    @Arg('input') input: CreateTechInput,
    @Ctx() { req }: MyContext
  ): Promise<TechResponse> {
    //@ts-ignore
    const { userId } = req.session;

    const techList = await this.techService.findTechListByUserId(userId);

    let doesTechExist = false;

    techList.forEach((tech) => {
      if (tech.name === input.name) {
        doesTechExist = true;
      }
    });

    if (doesTechExist) {
      return {
        errors: [
          {
            field: 'tech',
            message: 'Tech already exists',
          },
        ],
      };
    }

    try {
      const tech = await this.techService.createTech({
        ...input,
        userId,
      });

      return { tech };
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

  @Mutation(() => TechResponse)
  @UseMiddleware(isAuth)
  async updateTech(
    @Arg('input') input: UpdateTechInput,
    @Ctx() { req }: MyContext
  ): Promise<TechResponse> {
    //@ts-ignore
    const { userId } = req.session;
    const tech = await this.techService.findTechById(input._id);

    if (!tech)
      return {
        errors: [
          {
            field: 'tech',
            message: 'there is no such tech',
          },
        ],
      };

    if (tech.user.toString() !== userId) {
      return { errors: [{ field: 'tech', message: 'not authorized' }] };
    }
    try {
      const updatedTech = await this.techService.updateTech(input);
      return { tech: updatedTech };
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
  async deleteTech(
    @Arg('techId') techId: string,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const tech = await this.techService.findTechById(techId);
    //@ts-ignore
    const { userId } = req.session;

    if (!tech) {
      return false;
    }

    if (tech.user !== userId) return false;

    try {
      await this.techService.deleteTech(techId);
      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }
}
