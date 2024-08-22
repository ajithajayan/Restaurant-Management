import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Dish {
  name: string;
  image: string;
  price: string; // Added price to Dish interface
}

interface Meal {
  meal_type: string;
  dish: Dish;
}

interface Menu {
  name: string;
  day_of_week: string;
  menu_items: Meal[];
  mess_type: number;
  sub_total: string; // Added sub_total to Menu interface
}

const Menus: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filter, setFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const messTypeMap: { [key: number]: string } = {
    1: 'breakfast_lunch_dinner',
    2: 'breakfast_lunch',
    3: 'breakfast_dinner',
    4: 'lunch_dinner'
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/menus/?is_custom=false');
        console.log("API Response:", response.data.results);
        setMenus(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching menus:', error);
        setError('Failed to load menus');
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const handleFilterChange = (messType: number | null) => {
    setFilter(messType);
    console.log("Selected filter:", messType);
  };

  const filteredMenus = menus.filter(menu => menu.mess_type === filter);

  console.log("Filtered menus:", filteredMenus);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex justify-around">
        {Object.entries(messTypeMap).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleFilterChange(Number(key))}
            className={`py-2 px-4 rounded-md ${
              filter === Number(key) ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {filteredMenus.length === 0 && <div>No menus available for this filter.</div>}
      {filteredMenus.map((menu, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-md shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{menu.day_of_week}</h2>
            <p className="text-lg font-semibold">{menu.sub_total}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.menu_items.map((meal, mealIndex) => (
              <div
                key={mealIndex}
                className="bg-white p-4 rounded-md shadow-md flex flex-col items-center"
              >
                <h3 className="text-lg font-bold mb-2">{meal.meal_type}</h3>
                {meal.dish.image ? (
                  <img
                    src={meal.dish.image}
                    alt={meal.dish.name}
                    className="w-full h-auto object-cover rounded-md mb-2"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                    <p>No Image Available</p>
                  </div>
                )}
                <p className="text-center">
                  Dish: {meal.dish.name} <span className="text-sm text-gray-500">(${meal.dish.price})</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menus;
