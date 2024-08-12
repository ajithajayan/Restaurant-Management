import React from "react";
import Layout from "../components/Layout/Layout";
import SettingItem from "../components/Settings/SettingItem";

const settingsItems = [
  "Service provider category",
  "Service provider",
  "Service provider commission",
  "User privilege",
  "Voucher type",
  "What's new",
  "Email broadcast",
  "About us",
  "Support",
  "Email",
  "Discount",
  "Role",
  "Exchange rate",
  "Dayshift",
  "Open cash drawer",
  "Help request",
  "Settings",
  "Printer options",
  "Additional printers",
  "Quick menu",
  "POS quick menu",
  "Menu font & colour",
  "Backup",
  "Card type",
  "Company update"
];

const SettingsPage: React.FC = () => {
  return (
    <Layout>
      <div className="grid grid-cols-4 gap-4 p-4 bg-[#52088E]">
        {settingsItems.map((item, index) => (
          <SettingItem key={index} label={item} />
        ))}
      </div>
    </Layout>
  );
};

export default SettingsPage;
