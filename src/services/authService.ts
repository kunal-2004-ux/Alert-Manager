import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';

const userRepository = new UserRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export class AuthService {
    async register(data: any) {
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await userRepository.createUser({
            ...data,
            password: hashedPassword,
        });

        return this.generateToken(user);
    }

    async login(data: any) {
        const user = await userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        return this.generateToken(user);
    }

    private generateToken(user: any) {
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
        return { token, user: { id: user.id, email: user.email, role: user.role } };
    }
}
