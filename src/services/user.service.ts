import { SignUpInput, User, UserModel } from '../schemas/user.schema';

export class UserService {
    async createUser(input: SignUpInput): Promise<User> {
        return UserModel.create(input);
    }

    async findByEmail(email: string): Promise<User | null> {
        return UserModel.findOne({ email }).lean();
    }

    async findById(id: string): Promise<User | null> {
        return UserModel.findById(id).lean();
    }

    async updateUser(id: string, properties: Partial<User>) {
        const user = await UserModel.findById(id);

        if (!user) {
            throw new Error('User not found');
        }
        Object.assign(user, properties);
        await user.save();

        return user;
    }
}
