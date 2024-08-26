import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import MessMembers from "../components/Mess/MessMembers";
import Menus from "../components/Mess/Menus";
import AddMembers from "@/components/Mess/AddMembers";

const MessPage: React.FC = () => {
  const [activeButton, setActiveButton] = useState("Menus");

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  const renderContent = () => {
    switch (activeButton) {
      case "Menus":
        return <Menus />;
      case "Add Members":
        return <AddMembers />;
      case "Mess Members":
        return <MessMembers />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-4 bg-gray-100 min-h-screen">
        <header className="bg-white p-4 shadow-md rounded-md mb-4">
          <div className="flex justify-around">
            <button
              className={`py-2 px-4 rounded ${
                activeButton === "Menus" ? "bg-black text-white" : "bg-zinc-600 text-white hover:bg-gray-500"
              }`}
              onClick={() => handleButtonClick("Menus")}
            >
              Menus
            </button>
            <button
              className={`py-2 px-4 rounded ${
                activeButton === "Add Members" ? "bg-black text-white" : "bg-zinc-600 text-white hover:bg-gray-500"
              }`}
              onClick={() => handleButtonClick("Add Members")}
            >
              Add Members
            </button>
            <button
              className={`py-2 px-4 rounded ${
                activeButton === "Mess Members" ? "bg-black text-white" : "bg-zinc-600 text-white hover:bg-gray-500"
              }`}
              onClick={() => handleButtonClick("Mess Members")}
            >
              Mess Members
            </button>
          </div>
        </header>
        <div className="bg-white p-4 rounded-md shadow-md">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
};

export default MessPage;
