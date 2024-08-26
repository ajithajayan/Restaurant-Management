import React from "react";
import { Link } from "react-router-dom";

interface SettingItemProps {
  label: string;
}

const SettingItem: React.FC<SettingItemProps> = ({ label }) => {
  return (
    <div className="bg-[#6a0dad] p-4 rounded-lg text-white text-center font-bold transition-transform transform hover:scale-105 hover:bg-[#8b00ff]">
      {/* <span>{label}</span> */}
      <span>
        {label === "Admin Pannel" ? (
          <>
            <Link to={`${import.meta.env.VITE_APP_ADMIN_URL}`} target="blank">{label}</Link>
          </>
        ) : (
          <>{label}</>
        )}
      </span>
    </div>
  );
};

export default SettingItem;
