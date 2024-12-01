import { useState, useEffect } from "react";

function useTabRenderUserPlatform(length: number) {
  const [render, setRender] = useState(
    Array.from({ length }, () => false),
  );

  const setRenderAlways = (pos: number) => {
    if (pos < length && !render[pos]) {
      const newRender = Array.from({ length }, () => false);
      newRender[pos] = true;
      setRender([...newRender]);
    }
  };

  useEffect(() => {
    return () => {
      setRender(Array.from({ length }, () => false));
    };
  }, [length]);

  return { renderAlways: render, setRenderAlways };
}

export default useTabRenderUserPlatform;
