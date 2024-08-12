import { useQuery } from 'react-query';
import { getDishes } from '../services/api';
import { UseDishesReturn } from '../types';

export const useDishes = (): UseDishesReturn => {
  const { data, isLoading, isError, refetch } = useQuery('dishes', getDishes);
  const addDishToOrder = (id: any, quantity: any) => console.log(id, quantity);

  return {
    dishes: data,
    isLoading,
    isError,
    refetch,
    addDishToOrder,
  };
};
