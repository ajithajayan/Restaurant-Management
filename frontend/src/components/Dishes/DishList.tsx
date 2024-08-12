import React from 'react';
import DishItem from './DishItem';
import { DishListProps } from '../../types';

const DishList: React.FC<DishListProps> = ({ dishes, onAddDish }) => {
  if (dishes.length === 0) return <div>No dishes available</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {dishes.map((dish) => (
        <DishItem key={dish.id} dish={dish} onAddDish={onAddDish} />
      ))}
    </div>
  );
};

export default DishList;
