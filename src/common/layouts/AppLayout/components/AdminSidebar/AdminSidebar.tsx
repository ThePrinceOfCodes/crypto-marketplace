import useResponsive from "@common/hooks/useResponsive";
import CloseIcon from "@common/icons/CloseIcon";
import { LangSettings } from "@common/layouts/AppLayout/components";
import clsx from "clsx";
import { useRouter } from "next/router";
import React, { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import styles from "./sidebar.module.css";
import {
  HomeIcon,
  UsersIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ClockIcon,
  ClipboardDocumentIcon,
  ClipboardIcon,
  DocumentCheckIcon,
  BellAlertIcon,
  BanknotesIcon,
  CogIcon,
  CalculatorIcon,
  FlagIcon,
  ChevronDownIcon,
  LifebuoyIcon,
  TableCellsIcon,
  ExclamationCircleIcon,
  WalletIcon,
  CreditCardIcon,
  AdjustmentsVerticalIcon,
  MegaphoneIcon,
  WindowIcon,
  AcademicCapIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ArrowsRightLeftIcon,
  TagIcon,
  LockClosedIcon,
  ArrowTrendingUpIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { LocalKeys, useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";
import {
  Divider,
  Drawer,
  IconButton,
  Box,
  Tooltip,
  MenuItem,
  Menu,
} from "@mui/material";
import { TimezoneDropdown } from "@common/components";
import { useAuth } from "@common/context";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

type MenuItem = {
  id?: string;
  href: string;
  title: LocalKeys;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  submenu?: MenuItem[];
  menuRole?: string;
  subHrefs?: string[];
};

const menuItems: MenuItem[] = [
  {
    href: "/dashboard",
    title: "menu_bar_title_dashboard",
    menuRole: "all",
    icon: HomeIcon,
  },
  {
    href: "/platforms",
    title: "menu_bar_title_platforms",
    menuRole: "all",
    icon: Squares2X2Icon,
    subHrefs: ["/platform-details"]
  },
  {
    href: "/platform-requests",
    title: "menu_bar_title_platform_requests",
    menuRole: "platformUser",
    icon: DocumentTextIcon,
  },

  {
    href: "/tokens",
    title: "menu_bar_title_tokens",
    menuRole: "token",
    icon: CircleStackIcon,
    subHrefs: ["/token-details"]
  },
  {
    href: "/users",
    title: "menu_bar_title_users",
    menuRole: "supersave",
    icon: UsersIcon,
  },
  {
    href: "/news",
    title: "menu_bar_title_news",
    menuRole: "news",
    icon: MegaphoneIcon,
  },
  {
    href: "/popups",
    title: "menu_bar_title_popups",
    menuRole: "popup",
    icon: WindowIcon,
  },
  {
    href: "/notifications",
    title: "menu_bar_title_notifications",
    menuRole: "notification",
    icon: BellAlertIcon,
  },
  {
    href: "/ads-management",
    title: "menu_bar_title_ads_management",
    menuRole: "ads",
    icon: TagIcon,
  },
  {
    href: "/inquiry",
    title: "menu_bar_title_inquiry",
    menuRole: "inquiry",
    icon: ChatBubbleOvalLeftEllipsisIcon,
  },
  {
    href: "/p2p-trade",
    title: "menu_bar_title_p2p_trade",
    menuRole: "p2p",
    icon: ArrowTrendingUpIcon,
    submenu: [
      {
        title: "menu_bar_title_p2p_orders",
        href: "/p2p-trade/p2p-orders",
        menuRole: "p2p",
        icon: ShoppingCartIcon,
      },
      {
        title: "menu_bar_title_p2p_blockchain_transactions",
        href: "/p2p-trade/p2p-blockchain-transactions",
        menuRole: "p2p",
        icon: CreditCardIcon,
      },
    ],
  },
  {
    href: "/p2u-management",
    title: "menu_bar_title_p2u_management",
    menuRole: "p2u",
    icon: WalletIcon,
    submenu: [
      {
        title: "menu_bar_title_users_rpa_histories",
        href: "/p2u-management/rpa-histories",
        menuRole: "p2u",
        icon: CreditCardIcon,
      },
      {
        title: "menu_bar_title_users_rpa_error_logs",
        href: "/p2u-management/rpa-error-logs",
        menuRole: "p2u",
        icon: ExclamationCircleIcon,
      },
      {
        title: "menu_bar_sub_title_super_save_points_accumulation",
        href: "/p2u-management/points-accumulation",
        menuRole: "p2u",
        icon: AdjustmentsVerticalIcon,
      },
    ],
  },
  {
    id: htmlIds.li_sidebar_item_super_save,
    href: "/super-save",
    title: "menu_bar_title_super_save",
    menuRole: "supersave",
    icon: ShieldCheckIcon,
    submenu: [
      {
        title: "menu_bar_sub_title_deposit_information",
        href: "/super-save/deposit-information",
        menuRole: "supersave",
        icon: ClipboardDocumentCheckIcon,
      },
      {
        title: "menu_bar_sub_title_super_save_cash_transfer",
        href: "/super-save/cash-transfer",
        menuRole: "supersave",
        icon: BanknotesIcon,
      },
      {
        title: "menu_bar_sub_title_withdrawal_information",
        href: "/super-save/withdrawal-information",
        menuRole: "supersave",
        icon: ClipboardDocumentListIcon,
        subHrefs: ["/transaction-details"]
      },
      {
        title: "menu_bar_sub_title_daily_calculation_information",
        href: "/super-save/daily-calculation-information",
        menuRole: "supersave",
        icon: CalculatorIcon,
      },
      {
        title: "menu_bar_sub_title_reserved_vault",
        href: "/super-save/reserved-vault",
        menuRole: "supersave",
        icon: DocumentCheckIcon,
      },
      {
        title: "menu_bar_sub_title_helper_services",
        href: "/super-save/helper-services",
        menuRole: "supersave",
        icon: LifebuoyIcon,
      },
      {
        title: "menu_bar_sub_title_bug_report",
        href: "/super-save/bug-report",
        menuRole: "supersave",
        icon: FlagIcon,
      },
      {
        title: "menu_bar_sub_title_admin_history",
        href: "/super-save/admin-history",
        menuRole: "supersave",
        icon: TableCellsIcon,
      },
      {
        title: "menu_bar_sub_title_education_management",
        href: "/super-save/education-management",
        menuRole: "supersave",
        icon: AcademicCapIcon,
      },
      {
        title: "menu_bar_sub_title_admin_txid_management",
        href: "/super-save/txid-management",
        menuRole: "supersave",
        icon: ArrowsRightLeftIcon,
      },
      {
        id: htmlIds.li_sidebar_item_super_save_settings,
        title: "menu_bar_sub_title_settings",
        href: "/super-save/setup",
        menuRole: "supersave",
        icon: Cog6ToothIcon,
        submenu: [
          {
            title: "menu_bar_sub_title_msq_transaction_threshold",
            href: "/super-save/setup/msq-standard-amount",
            menuRole: "supersave",
            icon: ClipboardIcon,
          },
          {
            title: "menu_bar_sub_title_super_save_standard_amount",
            href: "/super-save/setup/set-super-save-standard",
            menuRole: "supersave",
            icon: ClipboardDocumentIcon,
          },
          {
            title: "menu_bar_sub_title_super_save_time_setting",
            href: "/super-save/setup/super-save-time-setting",
            menuRole: "supersave",
            icon: ClockIcon,
          },
          {
            title: "menu_bar_sub_title_super_save_bank_fee",
            href: "/super-save/setup/super-save-bank-fee",
            menuRole: "supersave",
            icon: BanknotesIcon,
          },
          {
            title: "menu_bar_sub_title_super_save_notification_time",
            href: "/super-save/setup/super-save-notification-time",
            menuRole: "supersave",
            icon: BellAlertIcon,
          },
          {
            title: "menu_bar_sub_title_super_save_widget_settings",
            href: "/super-save/setup/widgets-settings",
            menuRole: "supersave",
            icon: CogIcon,
          },
        ],
      },
    ],
  },
  {
    href: "/msq_platform_users",
    title: "menu_bar_title_platform_users",
    menuRole: "platformUser",
    icon: LockClosedIcon,
  },
];

function Sidebar({
  setMobileMenuOpen,
  mobileMenuOpen,
}: // handleClearCache,
{
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
  handleClearCache: () => void;
}) {
  const { isMobile } = useResponsive();
  const { text } = useLocale();
  const { userRoleV2, hasAuth } = useAuth();
  const [openSubmenues, setOpenSubmenues] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [activeSubmenu, setActiveSubmenu] = useState<MenuItem[] | undefined>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const router = useRouter();

  const handleSubmenuOpen = (key: string) => {
    setOpenSubmenues((previoudKeys) => {
      if (previoudKeys.includes(key)) {
        // If submenu is already open, close it
        return previoudKeys.filter((_key) => _key !== key);
      } else {
        // If submenu is closed, open it and keep other submenus open
        return [...previoudKeys, key];
      }
    });
  };

  const handleGetMenuList = () => {
    if (hasAuth("root")) {
      return menuItems;
    }

    const arr: any = [];
    const keys = Object.keys(userRoleV2);
    arr.push(
      menuItems.filter((item) => {
        if (item.menuRole == undefined) {
          return true;
        } else if (keys.includes(item.menuRole) || item.menuRole == "all") {
          return true;
        }
        return false;
      }),
    );

    return arr.flat();
  };

  const closeMobileDrawer = () => {
    if (isMobile) setMobileMenuOpen(false);
  };

  const titleClassName = (_selected: boolean) =>
    `flex items-center gap-2 rounded-lg px-4 py-4 duration-200 ${
      _selected ? "bg-slate-50" : "hover:bg-blue-100 text-slate-400"
    }`;

  const [selectedItem, setSelectedItem] = useState<string>("");

  useEffect(() => {
    const cleanHref = router.asPath.split("?")[0].replace("-details", "");
    if (cleanHref.includes("users")) {
      setSelectedItem("/users");
      return;
    }
    setSelectedItem(cleanHref);
  }, [router.asPath]);

  const isActive = (href: string, subHrefs: string[] = []) => {
    const path = router.asPath;
    return (
      path.includes(href) || subHrefs.some((subHref) => path.includes(subHref))
    );
  };
  // Use the isActive function to determine if a menu item is selected

  useEffect(() => {
    const handleKeysPress = (event: any) => {
      const { key } = event;

      const keyToExpand = key === "[";
      const keyToCollapse = key === "]";

      keyToExpand
        ? setCollapsed(false)
        : keyToCollapse
        ? setCollapsed(true)
        : null;
    };

    document.addEventListener("keypress", handleKeysPress);
     // Cleanup function
    return () => {
      document.removeEventListener("keypress", handleKeysPress);
    };
  }, []);

  const renderItem = (item: MenuItem) => {
    const isSelected = isActive(item.href, item?.subHrefs);
    if (!item.submenu) {
      const notDeep = isSelected;
      return (
        <li key={item.href} id={item.title} onClick={closeMobileDrawer}>
          <Tooltip
            arrow
            placement="right-end"
            title={collapsed ? text(item.title) : ""}
          >
            <Link className={titleClassName(isSelected)} href={item.href}>
              <span className={notDeep ? "w-5" : "w-4"}>
                {<item.icon className="stroke-2 w-5" />}
              </span>
              <span
                className={`text-ellipsis truncate text-sm font-medium duration-200 ease-in-out ${
                  collapsed ? "lg:w-0 opacity-100 lg:opacity-0" : "md:w-[200px] opacity-100"
                }`}
                title={text(item.title)}
              >
                {text(item.title)}
              </span>
            </Link>
          </Tooltip>
        </li>
      );
    } else if (item.submenu) {
      const isSubMenuOpen = openSubmenues.includes(item.href);

      return (
        <Fragment key={item.href}>
          <li id={item.title} key={item.href}>
            <Tooltip
              arrow
              placement="right-end"
              title={collapsed ? text(item.title) : ""}
            >
              <button
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  if (!collapsed || isMobile) {
                    handleSubmenuOpen(item.href);
                  } else {
                    setAnchorEl(event.currentTarget);
                    setActiveSubmenu(item.submenu);
                  }
                }}
                className={`w-full mb-2 relative ${titleClassName(false)}`}
              >
                <span className="flex items-center flex-1 gap-2">
                  <span className="w-5">
                    {<item.icon className="w-5 stroke-2" />}
                  </span>

                  {(!collapsed || isMobile) && (
                    <span
                      className="text-ellipsis truncate text-sm font-medium"
                      title={text(item.title)}
                    >
                      {text(item.title)}
                    </span>
                  )}
                </span>

                {(!collapsed || isMobile) && (
                  <span className="w-5">
                    <ChevronDownIcon
                      id="svg_app_layout_chevron_down_icon"
                      className={`w-5 duration-200 ${
                        isSubMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                )}
              </button>
            </Tooltip>

            {(!collapsed || isMobile) && (
              <ul
                className={`flex flex-col gap-2 duration-200 ${
                  isSubMenuOpen ? "" : "h-0 overflow-hidden"
                }`}
              >
                {item.submenu.map(renderItem)}
              </ul>
            )}
          </li>

          {/* Menu to display sub menu when sidebar is collapsed */}
          <Menu
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            elevation={3}
            onClose={() => {
              setAnchorEl(null);
            }}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  "&:before": {
                    content: "''",
                    display: "block",
                    position: "absolute",
                    top: activeSubmenu?.length === 3 ? 24 : 246,
                    left: -3,
                    width: 32,
                    height: 32,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              },
            }}
          >
            <div className="max-h-96 overflow-y-auto">
              {activeSubmenu &&
                activeSubmenu.map(item => (
                  <div key={item.href}>
                    {item.submenu && item.submenu.length > 0 ? (
                      <>
                        <span className="p-3 text-xs text-slate-700">{text(item.title)}</span>
                        {
                          item.submenu.map(subitem => (
                            <MenuItem
                              id={subitem.href}
                              key={subitem.href}
                              sx={{ fontSize: 14, color: "rgba(0, 0, 0, .5)" }}
                              onClick={() => {
                                setAnchorEl(null);
                                router.push(subitem.href);
                              }}
                            >
                              {text(subitem.title)}
                            </MenuItem>
                          ))
                        }
                      </>
                    ) : (
                      <MenuItem
                        id={item.href}
                        key={item.href}
                        sx={{ fontSize: 14, color: "rgba(0, 0, 0, .5)" }}
                        onClick={() => {
                          setAnchorEl(null);
                          router.push(item.href);
                        }}
                      >
                        {text(item.title)}
                      </MenuItem>
                    )}
                  </div>
                ))}
            </div>
          </Menu>
        </Fragment>
      );
    } else {
      return null;
    }
  };

  if (isMobile)
    return (
      <Drawer open={mobileMenuOpen} onClose={closeMobileDrawer}>
        <div className={"flex flex-col h-[100%] overflow-hidden"}>
          <div
            className={
              "!h-[8.5%] min-h-[55px] flex items-center justify-between pl-4"
            }
          >
            <div onClick={closeMobileDrawer} className="cursor-pointer">
              <CloseIcon />
            </div>
            <LangSettings />
          </div>

          <Divider />
          <nav
            className={clsx(
              "flex flex-col space-between",
              styles["mobile-side-middle"],
            )}
          >
            <ul className="flex flex-col gap-2">
              {handleGetMenuList().map(renderItem)}
            </ul>
          </nav>
          <div
            className={
              "h-[16.5%] flex flex-col px-2 justify-center items-center w-[100%]"
            }
          >
            <TimezoneDropdown />
          </div>
        </div>
      </Drawer>
    );

  return (
    <Box sx={{ display: "flex", position: "relative" }} id="sideNav">
      <aside
        id="aside_bar"
        className="relative px-2 h-full shadow-sm py-6 w-40 overflow-y-auto md:w-max"
      >
        <nav>
          <ul className="flex flex-col gap-2">
            {handleGetMenuList().map(renderItem)}
          </ul>
        </nav>
      </aside>

      {!isMobile && (
        <div className="absolute top-0 right-[-14px] z-[1] rounded-full menu-collapse">
          <Tooltip
            title={collapsed ? text("menu_expand") : text("menu_collapse")}
          >
            <IconButton
              size="small"
              sx={{
                border: "1px solid rgba(0, 0, 0, .5)",
                borderStyle: "dotted",
                display: "flex",
                padding: "1px !important",
              }}
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? (
                <KeyboardArrowRightIcon
                  sx={{
                    color: "rgba(0, 0, 0, .5)",
                  }}
                />
              ) : (
                <KeyboardArrowLeftIcon
                  sx={{
                    color: "rgba(0, 0, 0, .5)",
                  }}
                />
              )}
            </IconButton>
          </Tooltip>
        </div>
      )}
    </Box>
  );
}

export default Sidebar;
