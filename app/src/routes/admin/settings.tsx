import { NavLink, Outlet } from "@remix-run/react";
import {
  UserCircleIcon,
  LinkIcon,
  VideoCameraIcon,
} from "@heroicons/react/outline";
import cx from "clsx";

const navigation = [
  { name: "Profile", to: "profile", icon: UserCircleIcon },
  { name: "Links", to: "links", icon: LinkIcon },
  { name: "Stream", to: "stream", icon: VideoCameraIcon },
];

export default function Settings() {
  return (
    <div className="flex flex-grow p-4 lg:grid lg:grid-cols-12 lg:gap-x-5">
      <aside className="py-6 px-2 sm:px-6 lg:col-span-3 lg:py-0 lg:px-0">
        <nav className="space-y-1">
          {navigation.map((item) => {
            return (
              <NavLink
                prefetch="intent"
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  cx(
                    isActive
                      ? "bg-gray-50 text-orange-700 hover:bg-white hover:text-orange-700"
                      : "text-gray-900 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cx(
                        isActive
                          ? "text-orange-500 group-hover:text-orange-500"
                          : "text-gray-400 group-hover:text-gray-500",
                        "-ml-1 h-6 w-6 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    <span className="ml-3 hidden truncate sm:block">
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="flex-grow space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <Outlet />
      </div>
    </div>
  );
}
