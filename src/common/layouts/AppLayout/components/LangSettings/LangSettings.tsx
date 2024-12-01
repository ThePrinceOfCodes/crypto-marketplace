import useResponsive from "@common/hooks/useResponsive";
import { htmlIds } from "@cypress/utils/ids";
import { ChevronDownIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { ListItemText, Menu, MenuItem } from "@mui/material";
import { useSetLanguage } from "api/hooks";
import { LocalKeys, LocalsType, useLocale } from "locale";
import Image from "next/image";
import React from "react";
import { toast } from "react-toastify";

type changeLanguageType = {
  label: string;
  value: LocalsType;
  src: string;
};

const CHANGE_LANGUAGE: changeLanguageType[] = [
  {
    label: "setting_profile_langugae_english",
    value: "en_US",
    src: "/images/english.png",
  },
  {
    label: "setting_profile_langugae_korean",
    value: "ko_KR",
    src: "/images/korean.png",
  },
];
const LangSettings = () => {
  const { isDesktop } = useResponsive();
  const { text, locale, changeLocale } = useLocale();
  const { mutateAsync: changeLanguage } = useSetLanguage();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeLocale = async (_locale: LocalsType) => {
    if (_locale === locale) return;
    changeLocale(_locale);
    try {
      await changeLanguage(
        { language: _locale },
        {
          onSuccess: () => {
            toast(text("setting_users_language_successfully"), {
              type: "success"
            });
          }
        }
      );
    } catch (error: any) {
      if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        toast(text("setting_users_language_offline_warning"), {
          autoClose: 1500,
          type: "warning"
        });
      } else {
        toast(text("setting_users_language_error"), { type: "error" });
      }
    }
  };

  return (
    <>
      { isDesktop && <LanguageIcon className={"w-5"} />}
      <button
        id={htmlIds.btn_app_layout_language_select}
        aria-controls={open ? "demo-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        className="flex items-center text-slate-400 mr-6"
      >
        <div className="flex flex-col ml-2 h-full justify-between">
          <span
            className="text-black text-xs text-start font-semibold"
            id={htmlIds.span_app_layout_user_profile_name}
          >
            {locale === "ko_KR"
              ? text("setting_profile_langugae_korean")
              : text("setting_profile_langugae_english")}
          </span>
        </div>
        <ChevronDownIcon className="w-5 stroke-2 ml-2 text-slate-500" />
      </button>
      <Menu
        anchorEl={anchorEl}
        id="language-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: "''",
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {CHANGE_LANGUAGE.map((item) => {
          return (
            <MenuItem
              onClick={() => handleChangeLocale(item.value as LocalsType)}
              className="text-xs text-neutral-500"
              key={item.value}
              value={item.value}
            >
              <div className={"flex space-x-2 items-center"}>
                <Image
                  width={22}
                  height={5}
                  src={item.src}
                  alt="Msquare Market"
                />
                <ListItemText
                  className="text-xs"
                  primary={text(item.label as LocalKeys)}
                />
              </div>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default LangSettings;
