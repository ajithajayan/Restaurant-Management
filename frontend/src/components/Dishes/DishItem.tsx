import React from 'react';
import { DishItemProps } from '../../types';
import { Plus } from 'lucide-react';

const DishItem: React.FC<DishItemProps> = ({ dish, onAddDish }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <img src={dish.image} alt={dish.name} className="w-full h-48 object-cover mb-4 rounded" />
      <h3 className="text-xl font-semibold mb-2">{dish.name}</h3>
      <p className="text-gray-600 mb-2">{dish.description}</p>
      <div className="flex justify-between items-center mt-2">
        <span className='text-lg font-bold'>QR{dish.price}</span>
        <button onClick={() => onAddDish(dish)} className="bg-red-500 text-white rounded-full p-1">
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default DishItem;
