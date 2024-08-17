import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bell,
  LayoutDashboard,
  Sandwich,
  Settings,
  FileText,
  Receipt,
  HandPlatter,
  Gift,
  House,
  UtensilsCrossed,
  ScrollText,
} from "lucide-react";
import NotificationBadge from "./NotificationBadge";
import LogoutBtn from "./LogoutBtn";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      : "hover:bg-[#52088E7D]";
  };

  const menuItems = [
    { path: "/home", icon: House, label: "Home" },
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/dishes", icon: Sandwich, label: "Dishes" },
    { path: "/orders", icon: FileText, label: "Orders" },
    { path: "/bills", icon: Receipt, label: "Bills" },
    { path: "/dining-table", icon: HandPlatter, label: "Diningtable" },
    { path: "/coupons", icon: Gift, label: "Coupons" },
    { path: "/mess", icon: UtensilsCrossed, label: "Mess" },
    { path: "/salesreport", icon: ScrollText, label: "Salesreport" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const renderMenuItem = (item: {
    path: string;
    icon: React.ElementType;
    label: string;
  }) => (
    <TooltipProvider key={item.path}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={item.path}
            className={`flex items-center space-x-2 p-2 rounded ${isActive(
              item.path
            )}`}
          >
            <item.icon className="w-6 h-6" />
            <span className="hidden md:inline font-bold">{item.label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="md:hidden">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="w-20 md:w-64 bg-customLightPurple2 p-4 h-screen border-r border-gray-300 flex flex-col">
      <Link to="/" className="mb-8 flex justify-center md:justify-start">
        <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
      </Link>
      <nav className="flex-grow">
        <ul className="space-y-2">{menuItems.map(renderMenuItem)}</ul>
      </nav>
      <div className="mt-6">
        <h3 className="text-md text-black-500 mb-2 hidden md:block font-bold">
          Other
        </h3>
        <ul>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/notifications"
                  className={`flex items-center space-x-2 p-2 rounded ${isActive(
                    "/notifications"
                  )}`}
                >
                  <Bell className="w-6 h-6" />
                  <span className="hidden md:inline font-bold">
                    Notifications
                  </span>
                  <NotificationBadge className="ml-auto" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden">
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <LogoutBtn />
        </ul>
      </div>
      <a
        href="https://nasscript.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex justify-center items-center"
      >
        <p className="text-black-600 text-md md:text-md font-bold">Powered by</p>
        <img
          src="/images/nasscript_company_logo.jpg"
          alt="logo"
          className="w-8 h-8 md:w-10 md:h-10"
        />
      </a>
    </div>
  );
};

export default Sidebar;
