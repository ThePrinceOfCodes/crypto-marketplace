import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import "../styles/css/style.css";
import "../../ChartjsConfig";
import { AppLayout } from "@common/layouts";
import {
  AuthProvider,
  DialogProvider,
  LocaleProvider,
  TimezoneProvider,
  ProtectRoute,
  OnboardingProvider,
} from "@common/context";
import { queryClient } from "api";
import Head from "next/head";
import { LicenseInfo } from "@mui/x-data-grid-pro";
import { VersionChecker } from "@common/components/VersionChecker";
import ErrorBoundaryUI from "@common/utils/errorBoundaryUI";

LicenseInfo.setLicenseKey(process?.env?.NEXT_PUBLIC_MUI_LICENSE_KEY || "");

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <VersionChecker />
      <AuthProvider>
        <LocaleProvider>
          <TimezoneProvider>
            <ProtectRoute>
              <OnboardingProvider>
                <DialogProvider>
                  <ErrorBoundary FallbackComponent={ErrorBoundaryUI}>
                    <AppLayout>
                      <Head>
                        <title>MSQ Admin</title>
                      </Head>
                      <Component {...pageProps} />
                    </AppLayout>
                  </ErrorBoundary>
                </DialogProvider>
              </OnboardingProvider>
            </ProtectRoute>
          </TimezoneProvider>
        </LocaleProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
