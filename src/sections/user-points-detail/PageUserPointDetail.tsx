import { useRouter } from "next/router";
import queryString from "query-string";
import { useGetCardHistories } from "../../api/hooks";
import { CardDetailHistory, UPDBreadCrumb } from "./components";

function PageUserPointDetail() {
  const router = useRouter();

  const { data, isLoading: loading } = useGetCardHistories(
    {
      query: queryString.parse(router.asPath.split(/\?/)[1]),
    },
    {
      retry: 1,
      retryDelay: 1000,
      cacheTime: 1000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );

  const detail = data?.length ? data[0] : null;

  return (
    <div className="flex h-full flex-col px-5 py-10">
      <UPDBreadCrumb
        items={[{ title: "Home", url: "/user-points" }, { title: "Detail" }]}
      />
      <h1 className="text-4xl mb-20 font-medium">{detail?.email}</h1>
      <div className="grid grid-cols-1 gap-4">
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          detail?.cards.map((e: any) => {
            return (
              <div key={e}>
                <h2 className="text-xl mb-2 font-medium">
                  History of {e.cardCompany.name} ({e.cardCompany.code})
                </h2>
                <CardDetailHistory data={e?.cardHistories} loading={loading} />
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default PageUserPointDetail;
