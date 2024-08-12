import React from "react";

export type FloorName = "Ground floor" | "1st Floor" | "2nd floor" | "3rd floor";

export const initialFloors: FloorName[] = ["Ground floor", "1st Floor", "2nd floor", "3rd floor"];

interface FloorSelectorProps {
  floors: FloorName[];
  onFloorChange: (floor: FloorName) => void;
}

const FloorSelector: React.FC<FloorSelectorProps> = ({ floors, onFloorChange }) => {
  const [selectedFloor, setSelectedFloor] = React.useState<FloorName>(floors[0]);

  const handleFloorClick = (floor: FloorName) => {
    setSelectedFloor(floor);
    onFloorChange(floor);
  };

  return (
    <div className="w-1/4 bg-[#6a0dad] p-4 rounded-lg text-white space-y-4">
      <button 
        className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 py-2 px-4 rounded-full w-full mb-4"
        onClick={() => {}}
      >
        New
      </button>
      <ul className="space-y-2">
        {floors.map((floor) => (
          <li
            key={floor}
            className={`cursor-pointer p-2 rounded ${selectedFloor === floor ? 'bg-purple-900' : 'bg-purple-700'}`}
            onClick={() => handleFloorClick(floor)}
          >
            {floor}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FloorSelector;
