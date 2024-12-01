import { createContext, useMemo, useState } from "react";
import MSQOnboarding from "@common/components/MSQOnboarding";

type Steps = {
  id: string;
  description: string;
};

export const OnboardingContext = createContext<any>("");

export const OnboardingProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [steps, setSteps] = useState<Steps[]>([]);
  const [page, setPage] = useState<string>("");

  const value = useMemo(
    () => ({
      setSteps,
      setPage,
      page,
      steps,
    }),
    [steps, page],
  );

  return (
    <OnboardingContext.Provider value={value}>
      <MSQOnboarding
        page={page}
        setPage={setPage}
        steps={steps}
        setSteps={setSteps}
      />
      {children}
    </OnboardingContext.Provider>
  );
};
