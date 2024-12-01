import { useState, useEffect } from "react";

function useInitialTabRender(length: number) {
  const [initRender, setInitRender] = useState(
    Array.from({ length }, () => false),
  );

  const setInitialRender = (pos: number) => {
    if (pos < length && !initRender[pos]) {
      const newInitRender = [...initRender];
      newInitRender[pos] = true;
      setInitRender([...newInitRender]);
    }
  };

  useEffect(() => {
    return () => {
      setInitRender(Array.from({ length }, () => false));
    };
  }, [length]);

  return { initialRender: initRender, setInitialRender };
}

export default useInitialTabRender;
