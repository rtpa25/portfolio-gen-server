import { Experience } from './experience.schema';
import { Project } from './project.schema';
import { SocialLinks } from './social.schema';
import { Tech } from './tech.schema';
import { User } from './user.schema';

export const models = { User, Tech, Project, Experience, SocialLinks } as const;
