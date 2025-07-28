import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { NotFoundError } from 'src/utils/custom_error';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.usersRepository.findByRefreshToken(refreshToken);
  }

  async findByVerificationCode(verificationCode: string): Promise<User | null> {
    return this.usersRepository.findByVerificationCode(verificationCode);
  }

  async create(userData: any): Promise<User> {
    return this.usersRepository.create(userData);
  }

  async verifyEmail(verificationCode: string): Promise<User> {
    const user =
      await this.usersRepository.findByVerificationCode(verificationCode);
    if (!user) {
      throw new NotFoundError('Invalid verification code');
    }

    if (user.is_verified) {
      throw new Error('Email already verified');
    }

    const updated = await this.usersRepository.update(user.user_id, {
      is_verified: true,
      verification_code: null,
    });

    if (!updated) {
      throw new NotFoundError('User not found');
    }
    return updated;
  }

  async update(id: string, userData: any): Promise<User> {
    const user = await this.usersRepository.findById(id);
    console.log(userData);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await this.usersRepository.update(id, userData);
    if (!updated) {
      throw new NotFoundError('User not found');
    }
    return updated;
  }

  async updateCurrency(id: string, currencyId: number): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await this.usersRepository.updateCurrency(id, currencyId);
    if (!updated) {
      throw new NotFoundError('User not found');
    }
    return updated;
  }

  async updateLastLogin(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await this.usersRepository.updateLastLogin(id);
    if (!updated) {
      throw new NotFoundError('User not found');
    }
    return updated;
  }
}
