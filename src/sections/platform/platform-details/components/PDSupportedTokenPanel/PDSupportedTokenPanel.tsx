import { htmlIds } from "@cypress/utils/ids";
import { useCallback, useState } from "react";
import * as React from "react";
import { toast } from "react-toastify";
import _debounce from "lodash/debounce";
import { useRouter } from "next/router";
import {
  DialogContent,
  DialogContentText,
  Avatar,
  CircularProgress,
  Box,
  Grid,
  Tooltip
} from "@mui/material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { PDAddPlatformTokenButton } from "../PDAddPlatformTokenButton";
import { useLocale } from "locale";
import {
  PlatformSupportedTokenType,
  useDeletePlatformToken,
  useGetPlatformSupportedTokens,
} from "api/hooks";
import { SearchBox } from "@common/components/SearchBox";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

function PDSupportedTokenPanel() {
  const { text: t } = useLocale();
  const router = useRouter();

  const { mutateAsync: deletePlatformToken } = useDeletePlatformToken();

  const [text, setText] = useState("");
  const [selectedItem, setSelectedItem] =
    useState<PlatformSupportedTokenType | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const { isLoading, refetch, data } = useGetPlatformSupportedTokens(
    {
      platformId: router.query.platform as string,
    },
    {
      queryKey: [router.query.platform],
      select: (data) =>
        data?.filter((el) => el.name.toLocaleLowerCase().includes(text)),
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

  const onDeletePlatformToken = useCallback(async () => {
    if (selectedItem?.uuid) {

      deletePlatformToken({
        ids: selectedItem?.uuid,
      })
        .then(() => {
          toast(t("supported_token_deleted_success"), { type: "success" });
          refetch();
        })
        .catch(() => {
          toast(t("supported_token_delete_warning"), {
            type: "error",
          });
        })
        .finally(() => {
          setOpenConfirm(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem?.uuid]);

  const handleClickOpen = () => {
    setOpenConfirm(true);
  };

  const handleClose = () => {
    setOpenConfirm(false);
    setSelectedItem(null);
  };

  const handleSelectItem = useCallback(
    (item: PlatformSupportedTokenType) => () => {
      setSelectedItem((prev) => (prev?.uuid === item.uuid ? null : item));
    },
    [],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-col sm:flex-row w-full mb-5 justify-between gap-2">
        <SearchBox onChangeFunc={searchFunc} />
        <div className="flex justify-between">
          <PDAddPlatformTokenButton onAdded={refetch} platformTokens={data} />
          <div className="flex justify-center rounded-lg border border-slate-300 h-10 w-12 ml-2">
            <button
              id={htmlIds.btn_platform_details_supported_token_delete}
              className="flex items-center text-sm px-2 h-10 border-slate-900 rounded-md"
              onClick={handleClickOpen}
              disabled={!selectedItem}
              aria-label="delete icon"
            >
              <TrashIcon className="w-5 stroke-2 text-red-600" />
            </button>
          </div>
        </div>
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
        <div className="flex flex-wrap">
          <Grid container spacing={1}>
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data?.map((element: any, i: any) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <div
                    className={`${selectedItem?.uuid == element?.uuid
                      ? "border-2 border-solid border-blue-500"
                      : "border-slate-300"} flex flex-col platform-token-card h-36 rounded-lg border px-4 py-3 mr-4 mt-4 cypress-data-class-token`}
                    onClick={handleSelectItem(element)}
                  >
                    <div className="flex justify-between">
                      <Avatar alt={element?.name} src={element.logo}>
                        {element?.name.slice(0, 1)}
                      </Avatar>
                      <span className="pt-2 font-medium popinText">
                        {element.balance.toFixed(2)}
                      </span>
                    </div>
                    <Tooltip
                      title={element?.name}
                    >
                      <span
                        className="pt-4 font-medium popinText truncate text-ellipsis"
                      >
                        {element?.name}
                      </span>
                    </Tooltip>
                    <span className="text-sm font-medium text-gray-400 mt-2 popinText">
                      {t("platform_details_supported_token_title")}
                    </span>
                  </div>
                </Grid>
              ))
            }
          </Grid>
        </div>
      )}

      <CustomDialog
        open={openConfirm}
        onClose={() => handleClose()}
        titleText={t("platform_details_supported_token_delete_title")}
      >
        <DialogContentText id="alert-dialog-slide-description">{t("platform_details_supported_token_delete_content")}</DialogContentText>
        <Box sx={{ display: "flex", mt: 3, columnGap: 2 }}>
          <FormFooter
            handleClose={handleClose}
            loading={false}
            onSubmit={onDeletePlatformToken}
            cancelText={t("supported_token_disagree")}
            submitText= {t("supported_token_agree")}
          />
        </Box>
      </CustomDialog>
    </div>
  );
}

export default PDSupportedTokenPanel;
