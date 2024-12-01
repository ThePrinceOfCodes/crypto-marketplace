import React from "react";

interface BreadcrumbItem {
  title: string;
  url?: string;
}

interface BreadcrumbProps {
  items: Array<BreadcrumbItem>;
}

const UPDBreadCrumb = (props: BreadcrumbProps) => {
  const { items } = props;

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((e, i) => {
          if (i === items.length - 1) {
            return (
              <li key={e.title} aria-current="page">
                <div className="flex items-center">
                  /
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {e.title}
                  </span>
                </div>
              </li>
            );
          }
          return (
            <li key={e.title} className="inline-flex items-center">
              {i > 0 && "/"}
              <a
                href={e.url}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {e.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default UPDBreadCrumb;
