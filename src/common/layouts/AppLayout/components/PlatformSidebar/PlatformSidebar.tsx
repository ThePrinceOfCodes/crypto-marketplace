import Link from "next/link";
import { useRouter } from "next/router";
import { HomeIcon, UserIcon } from "@heroicons/react/24/outline";
import { LocalKeys, useLocale } from "locale";

const menuItems = [
  {
    href: "/dashboard",
    title: "menu_bar_title_dashboard",
    icon: (cx?: string) => <HomeIcon className={cx} />,
  },
  {
    href: "/platforms",
    title: "menu_bar_title_platforms",
    icon: (cx?: string) => <UserIcon className={cx} />,
  },
];

function PlatformSidebar() {
  const { text } = useLocale();
  const router = useRouter();

  const titleClass =
    "flex items-center gap-2 px-6 py-4 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200";
  const activeTitleClass = (href: string) =>
    router.asPath.includes(href) && "bg-slate-50";
  const inActiveTitleClass = (href: string) =>
    !router.asPath.includes(href) && "text-slate-400 hover:bg-blue-100";

  return (
    <aside
      id="aside_bar"
      className="py-8 bg-white shadow-sm h-full w-full md:w-60"
    >
      <nav>
        <ul>
          {menuItems.map(({ href, title, icon }) => (
            <li className="gap-2 mx-4 my-2" key={title}>
              <Link
                href={href}
                className={`${activeTitleClass(href)} ${inActiveTitleClass(
                  href,
                )} ${titleClass}`}
              >
                <div className="w-4">{icon && icon("stroke-2")}</div>
                {text(title as LocalKeys)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default PlatformSidebar;
