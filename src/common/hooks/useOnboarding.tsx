import { createContext } from "react";

type Interface = {
    children: React.ReactNode;
};

const isFirstTimeUser = localStorage.getItem("firstTimeUser");

const onBoardingContext = createContext(null);

const MSQOnboardingContext = ({children}: Interface) => {
    console.log(isFirstTimeUser);
    
    return (
        <onBoardingContext.Provider value={null}>
            {children}
        </onBoardingContext.Provider>
    )
};

