import { ExperienceResolver } from './experience.resolver';
import { ProjectResolver } from './project.resolver';
import { SocialLinkResolver } from './socialLink.resolver';
import { TechResolver } from './tech.resolver';
import { UserResolver } from './user.resolver';

export const resolvers = [
  UserResolver,
  TechResolver,
  ProjectResolver,
  ExperienceResolver,
  SocialLinkResolver,
] as const;
