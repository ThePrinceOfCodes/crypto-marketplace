import MenuIcon from "@common/icons/MenuIcon";
import { htmlIds } from "@cypress/utils/ids";
import React, { ReactNode, useEffect, useState } from "react";
import { Alert, Avatar, Divider, Menu, MenuItem, Tooltip } from "@mui/material";
import {
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import Link from "next/link";
import { AdminSidebar, LangSettings, PlatformSidebar } from "./components";
import { useAuth, useDialog } from "@common/context";
import { useLocale } from "locale";
import { useClearCache, usePostAdminHistoryLog } from "../../../api/hooks";
import { toast } from "react-toastify";
import { TimezoneDropdown } from "@common/components/TimezoneDropdown";
import useResponsive from "@common/hooks/useResponsive";
import MainLogo from "@common/icons/MainLogo";
import { Inter } from "next/font/google";
import clsx from "clsx";

// If loading a variable font, you don't need to specify the font weight
const interFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

interface LayoutProps {
  children: ReactNode;
}

function Layout(props: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { text } = useLocale();
  const { userRole, isAuthenticated, isOtpVerified, user, userRoleV2 } =
    useAuth();
  const { alertDialog, confirmDialog } = useDialog();
  const userName = user?.["name"] || "";
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { isMobile } = useResponsive();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { logout } = useAuth();
  const {
    mutateAsync: clearCache,
    // isLoading
  } = useClearCache();
  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();

  const onLogout = async () => {
    try {
      await postAdminHistoryLog({
        content_en: "Logout",
        content_kr: "Logout",
      });

      toast(text("layout_logout_success"), {
        type: "success",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err?.response?.data?.error || text("layout_logout_error"), {
        type: "error",
      });
    }

    logout();
    handleClose();
  };

  const router = useRouter();
  const baseUrl = process.env.API_BASE_URL ?? "";
  const environment = baseUrl.includes("dev")
    ? "DEVELOPMENT"
    : baseUrl.includes("stg")
      ? "STAGING"
      : "PRODUCTION";
  const environmentColor =
    environment === "DEVELOPMENT" ? "blue-500" : "yellow-500";
  const userPages = [
    "/dashboard",
    "/platforms",
    "/platform-details",
    "/tokens",
    "/token-details",
    "/user-details",
    "/settings",
  ];

  useEffect(() => {
    if (
      !userPages.includes(router.pathname) &&
      isAuthenticated &&
      isOtpVerified &&
      userRole == 1 &&
      Object.keys(userRoleV2 || {}).length == 0
    ) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isOtpVerified, router.pathname, user, userPages]);

  if (!isAuthenticated || !isOtpVerified) return <>{props.children}</>;

  const handleClearCache = () => {
    confirmDialog({
      title: text("layout_clear_cache_confirmation_title"),
      content: text("layout_clear_cache_confirmation"),
      warning: (
        <Alert className={"mt-5"} severity="warning">
          {text("layout_clear-cache_warning")}
        </Alert>
      ),
      onOk: async () => {
        clearCache(undefined, {
          onSuccess: () => {
            alertDialog({
              title: text("layout_clear_cache_success"),
            });
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (err: any) => {
            toast(err?.message || text("user_withdrawal_saved_error"), {
              type: "error",
            });
          },
        });
      },
    });
  };

  return (
    <div
      className={clsx(
        "h-full flex flex-col overflow-hidden ",
        interFont.variable,
      )}
    >
      <header
        id="app-header"
        className="flex justify-between items-center top-0 h-[8.5%] min-h-[55px] pl-3 font-semibold uppercase"
      >
        <button
          aria-label="menu icon"
          type="button"
          className={`${
            isMobile ? "inline-block" : "hidden"
          } ml-2 cursor-pointer`}
          onClick={() => setMobileMenuOpen(true)}
        >
          <MenuIcon />
        </button>
        {isMobile ? "" : <MainLogo width={224} height={56} />}
        <div className="flex items-center justify-between w-full">
          <div>
            {environment === "DEVELOPMENT" || environment === "STAGING" ? (
              <span
                className={`mx-2 text-sm text-white bg-${environmentColor} px-2 py-1 rounded`}
              >
                {environment}
              </span>
            ) : null}
          </div>
          <div className="flex items-center">
            <div className="flex flex-row items-center">
              <div
                id="change_time_zone"
                className={`${isMobile ? "hidden" : "inline-block"} mr-2`}
              >
                <TimezoneDropdown />
              </div>
              <div
                id="change_language"
                className={`${isMobile ? "hidden" : "flex"} py-2`}
              >
                <LangSettings />
              </div>
              <button
                id="btn_profile"
                aria-controls={open ? "demo-positioned-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                className="flex items-center text-slate-400 mr-6"
              >
                {!user?.["avatar"] && <Avatar>{userName?.charAt(0)}</Avatar>}
                {user?.["avatar"] && (
                  <Avatar
                    alt="Profile image" aria-label="profile-image"
                    src={user?.["avatar"]}
                    sx={{ width: 40, height: 40, border: "2px solid #E6E7EB" }}
                    id={htmlIds.avatar_app_layout_user_profile_image}
                  />
                )}
                <div className="flex flex-col ml-2 h-full justify-between max-w-24">
                  <Tooltip title={user?.["name"]}>
                    <p
                      className="text-black text-xs text-start font-semibold truncate"
                      id={htmlIds.span_app_layout_user_profile_name}
                    >
                      {user?.["name"]}
                    </p>
                  </Tooltip>
                </div>
                <ChevronDownIcon className="w-5 stroke-2 ml-2 text-slate-500" />
              </button>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
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
                  }
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem id={htmlIds.btn_popover_app_layout_setting}>
                  <Link href="/settings" className={"flex items-center"}>
                    <Cog6ToothIcon className="w-6 stroke-2 mr-2 text-slate-500" />
                    <span className="text-sm">{text("layout_settings")}</span>
                  </Link>
                </MenuItem>
                <Divider />
                <MenuItem id="li_app_layout_logout" onClick={onLogout}>
                  <ArrowRightStartOnRectangleIcon className="w-6 stroke-2 mr-2 text-slate-500" />
                  <span className="text-red-500 text-sm">
                    {text("layout_logout")}
                  </span>
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>
      </header>
      <div className="flex h-[91.5%]">
        {userRole === 0 || userRoleV2 ? (
          <AdminSidebar
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            handleClearCache={handleClearCache}
          />
        ) : (
          <PlatformSidebar />
        )}
        <main className="flex-1 overflow-y-auto">{props.children}</main>
      </div>
    </div>
  );
}

export default Layout;
