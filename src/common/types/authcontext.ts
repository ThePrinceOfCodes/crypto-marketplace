export interface UserType {
  avatar?: string;
  createdAt?: string;
  email?: string;
  language?: string;
  name?: string;
  otp?: number;
  phone_number?: string;
  resetPasswordToken?: string;
  roles?: number;
  updatedAt?: string;
}

export interface LoginResponseOutput {
  verifyOtp: boolean;

}

export interface DefaultProviderType {
  isAuthenticated: boolean;
  isOtpVerified: boolean;
  userRole: null | number;
  userRoleV2: any;
  user: null | UserType;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<LoginResponseOutput>;
  logout: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateUser: (f: any) => Promise<boolean>;
  resendOTP: (email: string) => Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verifyOTP: (options: any) => Promise<boolean>;
  checkAuth: (rolev1: number, rolev2: object, permission: string) => boolean;
  hasAuth: (permission: string) => boolean;
}
