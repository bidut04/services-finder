import { userApi } from '../../../api/user.api';
import { UserProfile } from '../types/auth.types';

export interface AuthResult {
  success: boolean;
  token: string;
  user: UserProfile;
}

export class AuthService {
  /**
   * Log in with mobile number (or email) and password
   */
  public static async login(identifier: string, password: string): Promise<AuthResult> {
    if (!identifier || identifier.trim().length < 3) {
      throw new Error('Please enter your mobile number or email.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const cleanIdentifier = identifier.trim();
    const res = await userApi.login({ identifier: cleanIdentifier, password });

    return {
      success: res.success,
      token: res.token,
      user: {
        id: res.user.id,
        name: res.user.name || 'HelpNear Customer',
        phoneNumber: res.user.phoneNumber,
        email: res.user.email,
        avatarUrl:
          res.user.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        createdAt: (res.user as any).createdAt || new Date().toISOString(),
      },
    };
  }

  /**
   * Register a new customer with Name, Phone and Password
   */
  public static async register(data: {
    name: string;
    phoneNumber: string;
    password: string;
    email?: string;
  }): Promise<AuthResult> {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Please enter your full name.');
    }
    const cleanPhone = data.phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }
    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const res = await userApi.register({
      name: data.name.trim(),
      phoneNumber: cleanPhone,
      password: data.password,
      email: data.email,
    });

    return {
      success: res.success,
      token: res.token,
      user: {
        id: res.user.id,
        name: res.user.name || data.name.trim(),
        phoneNumber: res.user.phoneNumber,
        email: res.user.email,
        avatarUrl:
          res.user.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        createdAt: (res.user as any).createdAt || new Date().toISOString(),
      },
    };
  }

  public static async logout(refreshToken?: string): Promise<void> {
    await userApi.logout(refreshToken);
  }
}
