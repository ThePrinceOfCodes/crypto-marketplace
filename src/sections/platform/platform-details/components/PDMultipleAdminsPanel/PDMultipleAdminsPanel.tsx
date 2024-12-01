import { htmlIds } from "@cypress/utils/ids";
import { useCallback, useState } from "react";
import _debounce from "lodash/debounce";
import { useRouter } from "next/router";
import { Avatar, CircularProgress, Box, Grid } from "@mui/material";
import { PDAddAdminButton } from "../PDAddAdminButton";
import { useLocale } from "locale";
import { useGetMultiAdmins } from "api/hooks";
import { SearchBox } from "@common/components/SearchBox";

function PDMultipleAdminsPanel() {
  const { text: t } = useLocale();
  const router = useRouter();

  const [text, setText] = useState("");

  const { isLoading, refetch, data } = useGetMultiAdmins(
    {
      id: router.query.platform as string,
    },
    {
      select: (data) =>
        data?.filter((el) =>
          el.platform_admin.toLocaleLowerCase().includes(text),
        ),
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchFunc = useCallback(
    _debounce((_text: string) => {
      const text = _text.trim().toLocaleLowerCase();

      setText(text.length === 0 ? "" : text);
    }, 500),
    [],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-end w-full mb-5 gap-2">
        <SearchBox onChangeFunc={searchFunc} />
        <PDAddAdminButton onAdded={refetch} />
      </div>
      {isLoading ? (
        <Box
          sx={{
            marginLeft: "40%",
            marginTop: "50px",
            height: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        data && (
          <div className="flex flex-wrap">
            <Grid container spacing={1}>
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.map((element: any, i: any) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                    <div className="flex flex-col admin-card h-36 rounded-lg border border-slate-300 px-4 py-3 cypress-data-class-admin overflow-x-auto">
                      <Avatar>{element?.platform_admin.slice(0, 1)}</Avatar>
                      <span className="pt-4 font-medium popinText">
                        {element?.platform_admin}.
                      </span>
                      <span className="text-sm font-medium text-gray-400 mt-2 popinText">
                        {element?.platform_admin}
                      </span>
                    </div>
                  </Grid>
                ))
              }
            </Grid>
          </div>
        )
      )}
    </div>
  );
}

export default PDMultipleAdminsPanel;
