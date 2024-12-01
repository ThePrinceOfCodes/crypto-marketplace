import { DefaultProviderType, UserType } from "@common/types/authcontext";
import { Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/router";
import { createContext, useState, useEffect, useContext } from "react";
import { api } from "api";
import { AuthProviderProps, ProtectRouteProps } from "./types";
import {
  useGetUser,
  usePostResendOTP,
  usePostUpdateUser,
  usePostUserSignIn,
  usePostUserSignUp,
  usePostVerifyOTP,
} from "api/hooks";
import { isEqual } from "lodash";
import { getAuthToken, removeAuthToken, setAuthToken } from "@common/utils/tokenStorage";

// ** Defaults
export const defaultAuthProvider: DefaultProviderType = {
  isAuthenticated: false,
  isOtpVerified: false,
  userRole: null,
  userRoleV2: null,
  user: null,
  loading: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signup: async (name: string, email: string, password: string) => { },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login: async (email: string, password: string) => ({
    verifyOtp: false,
  }),
  logout: async () => { },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  updateUser: async (f: any) => false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resendOTP: async (email: string) => false,
  verifyOTP: async ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    email,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    OTP,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    phoneNumber,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLogin,
  }: {
    email: string;
    OTP?: string | undefined;
    phoneNumber?: string | undefined;
    isLogin?: boolean;
  }) => false,
  checkAuth: (rolev1: number, rolev2: object, permission: string) => false,
  hasAuth: (permission: string) => false
};

const AuthContext = createContext(defaultAuthProvider);

export const PUBLIC_PATHNAME = [
  "/login",
  "/signup",
  "/reset-password-request",
  "/reset-password",
  "/account-verification",
  "/account-verified",
];

const mockUser = {};

export const AuthProvider = (params: AuthProviderProps) => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<UserType | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userRole, setUserRole] = useState<any>(null);
  const [userRoleV2, setUserRoleV2] = useState<any>({});

  const [token, setToken] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);

  const { mutateAsync: postUserSignUp } = usePostUserSignUp();
  const { mutateAsync: postSignIn } = usePostUserSignIn();
  const { mutateAsync: postOTP } = usePostResendOTP();
  const { mutateAsync: postVerifyOTP } = usePostVerifyOTP();
  const { mutateAsync: postUpdateUser } = usePostUpdateUser();

  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const token = getAuthToken() || "";
    const decodedJwt = parseJwt(token || "");
    const isTokenValid = !!decodedJwt && decodedJwt?.exp * 1000 > Date.now();

    setToken(token);
    setIsTokenValid(isTokenValid);

    if (!isTokenValid) {
      setUser(mockUser);
      removeAuthToken();
      delete api.defaults.headers.Authorization;
    }
  }, []);

  const { isFetching: loading } = useGetUser(
    {
      token: token,
    },
    {
      enabled: isTokenValid,
      onSuccess: async (res) => {
        setUser(res.data.user);
        setUserRole(res.data.user.roles);
        setUserRoleV2(
          res.data.user.roles_v2 ? JSON.parse(res.data.user.roles_v2) : {},
        );
      },
      onError: async () => {
        setUser(mockUser);
      },
    },
  );
  const signup = async (name: string, email: string, password: string) => {
    const res = await postUserSignUp({ name, email, password });
    if (res.status == "success" && res.data.token.length >1) {
      const userData = res.data;
      setAuthToken(userData.token);
      setUserRole(userData.role);
      setUser(userData);
      setTimeout(() => {
        router.replace("/dashboard");
      }, 0);
    }else{
      setTimeout(() => {
        router.replace("/login");
      }, 0);

    }
    
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLogin = (userData: any) => {
    setAuthToken(userData.token);
    setUserRole(userData.role);
    setUserRoleV2(userData.roles_v2 ? JSON.parse(userData.roles_v2) : {});
    setUser(userData);

    const returnUrl = (router.query.returnUrl as string) || "/dashboard";

    setTimeout(() => {
      router.replace(returnUrl);
    }, 0);
  };

  const login = async (email: string, password: string) => {
    const res = await postSignIn({ email, password });
    if (res.status == "success") {
      handleLogin(res.data);
      return {
        verifyOtp: false,
      };
    } else if (
      res.status === "failed" ||
      res.status === "OTP sent successfully"
    ) {
      localStorage.setItem("timer", "1");
      localStorage.setItem("minutes", "3");
      localStorage.setItem("seconds", "0");
      return {
        verifyOtp: true,
      };
    }
    return {
      verifyOtp: false,
    };
  };

  const resendOTP = async (email: string) => {
    const res = await postOTP({ email });
    return !!res.status;
  };

  const verifyOTP = async ({
    OTP,
    email,
    phoneNumber,
    isLogin = false,
  }: {
    OTP?: string | undefined;
    email: string;
    phoneNumber?: string | undefined;
    isLogin?: boolean;
  }) => {
    const res = await postVerifyOTP({ email, OTP, phoneNumber });
    if (res.status == "success") {
      isLogin && handleLogin(res.data);
      return true;
    }
    return false;
  };

  const logout = async () => {
    removeAuthToken()
    setUser(null);
    setUserRole(null);
    setUserRoleV2(null);
    delete api.defaults.headers.Authorization;
    setTimeout(() => {
      router.replace(`/login?returnUrl=${router.asPath}`);
    }, 0);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateUser = async (formData: any) => {
    const res = await postUpdateUser(formData);
    if (res.status == "success") {
      // profile update not change role and role_v2
      // just user name and profie update
      const userData = res.user;
      setUser(userData);
      return true;
    }
    return false;
  };

  const checkAuth = (rolev1: number, rolev2: any, permission: string) => {
    if (rolev1 === 0) {
      return true;
    }

    if (rolev2 === undefined) {
      return false;
    }

    if (rolev2?.root) {
      return true;
    }

    const scopePermission = permission.split(".");

    if (!rolev2[scopePermission[0]]) {
      return false;
    }

    if (scopePermission.length == 2 &&
      !rolev2[scopePermission[0]].includes(scopePermission[1])){
      return false;
    }
    return true;
  }

  const hasAuth = (permission: string) => {
    if (userRole == undefined || userRoleV2 == undefined) {
      return false;
    }

    return checkAuth(userRole, userRoleV2, permission);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: user !== null && !isEqual(user, mockUser),
        isOtpVerified: user !== null && !isEqual(user, mockUser),
        userRole,
        userRoleV2,
        user,
        login,
        loading,
        signup,
        logout,
        updateUser,
        resendOTP,
        verifyOTP,
        checkAuth,
        hasAuth,
      }}
    >
      {params.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectRoute = (props: ProtectRouteProps) => {
  const router = useRouter();
  const { isAuthenticated, isOtpVerified, loading, user } = useAuth();

  useEffect(() => {
    // ignore initial default provider context value
    if (user === null) {
      return;
    }

    if (
      !isAuthenticated &&
      !isOtpVerified &&
      !PUBLIC_PATHNAME.includes(router.pathname)
    ) {
      delete api.defaults.headers.Authorization;
      localStorage.removeItem("token");
      router.replace(`/login?returnUrl=${router.asPath}`);
    } else if (
      isAuthenticated &&
      isOtpVerified &&
      PUBLIC_PATHNAME.includes(router.pathname)
    ) {
      router.replace("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isOtpVerified, user, router.pathname]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  } else {
    return <>{props.children}</>;
  }
};



