import React, { useState } from 'react';

// Example menus data
const allMenus = [
  {
    "mess_type": "Combo",
    "day": "Monday",
    "meals": [
      { "type": "Breakfast", "dish": "Porota", "image": "https://media.istockphoto.com/id/618764348/photo/famous-asian-flat-bread-known-as-parathas.jpg?s=612x612&w=0&k=20&c=yrz3Gn1RIHw8ohxG0uGNAU1H8wa2dB6xRli_DD3PJ6o=" },
      { "type": "Lunch", "dish": "Porota", "image": "" },
      { "type": "Dinner", "dish": "Porota", "image": "" }
    ]
  },
  {
    "mess_type": "Breakfast and Lunch",
    "day": "Monday",
    "meals": [
      { "type": "Breakfast", "dish": "Porota", "image": "" },
      { "type": "Lunch", "dish": "Porota", "image": "" }
    ]
  },
  {
    "mess_type": "Breakfast and Dinner",
    "day": "Monday",
    "meals": [
      { "type": "Breakfast", "dish": "Porota", "image": "" },
      { "type": "Dinner", "dish": "Porota", "image": "" }
    ]
  },
  {
    "mess_type": "Lunch and Dinner",
    "day": "Monday",
    "meals": [
      { "type": "Lunch", "dish": "Porota", "image": "" },
      { "type": "Dinner", "dish": "Porota", "image": "" }
    ]
  }
];

const Menus: React.FC = () => {
  const [filter, setFilter] = useState<string>('Combo');

  const handleFilterChange = (messType: string) => {
    setFilter(messType);
  };

  const filteredMenus = allMenus.filter(menu => menu.mess_type === filter);

  return (
    <div className="space-y-4">
      {/* Buttons for filtering */}
      <div className="mb-4 flex justify-around">
        {['Combo', 'Breakfast and Lunch', 'Breakfast and Dinner', 'Lunch and Dinner'].map((type) => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            className={`py-2 px-4 rounded-md ${
              filter === type ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Render filtered menus */}
      {filteredMenus.map((menu, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-2">{menu.day}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.meals.map((meal, mealIndex) => (
              <div
                key={mealIndex}
                className="bg-white p-4 rounded-md shadow-md flex flex-col items-center"
              >
                <h3 className="text-lg font-bold mb-2">{meal.type}</h3>
                <img
                  src={meal.image}
                  alt={meal.dish}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <p className="text-center">Dish: {meal.dish}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menus;
