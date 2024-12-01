import { useAuth } from "@common/context";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Spinner } from "@common/components";

function PageHome() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      const hasHash = /#/.exec(router.asPath) && /!/.exec(router.asPath);
      const route = router.asPath.substring(router.asPath.indexOf("!") + 1);
      router.push(
        isAuthenticated && hasHash
          ? route
          : isAuthenticated
          ? "/dashboard"
          : "/login",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated, router.asPath]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner />
    </div>
  );
}
export default PageHome;
