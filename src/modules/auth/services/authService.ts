import { UserProfile } from '../types/auth.types';

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  token: string;
  user: UserProfile;
}

export class AuthService {
  /**
   * Sends an OTP to the given phone number
   */
  public static async sendOtp(phoneNumber: string): Promise<SendOtpResponse> {
    // Simulating network delay for realistic experience
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!phoneNumber || phoneNumber.length < 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    return {
      success: true,
      message: 'OTP has been dispatched to your mobile number.',
    };
  }

  /**
   * Verifies the 4-digit/6-digit OTP code
   */
  public static async verifyOtp(
    phoneNumber: string,
    otpCode: string
  ): Promise<VerifyOtpResponse> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    // For testing/development, accept 1234 or any 4 digits
    if (!otpCode || otpCode.length !== 4) {
      throw new Error('Please enter a valid 4-digit OTP.');
    }

    return {
      success: true,
      token: 'jwt-mock-token-secure-helpnear-001',
      user: {
        id: 'usr_palash_9921',
        name: 'Palash',
        phoneNumber,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        createdAt: new Date().toISOString(),
      },
    };
  }
}

