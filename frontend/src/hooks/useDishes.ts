import { useState } from 'react';
import { useQuery } from 'react-query';
import { getDishes } from '../services/api';
import { UseDishesReturn } from '../types';

export const useDishes = (): UseDishesReturn => {
  const [page, setPage] = useState(1);
  const pageSize = 10; // You can change the page size as needed

  const { data, isLoading, isError, refetch } = useQuery(['dishes', page], () => getDishes(page, pageSize), {
    keepPreviousData: true,
  });

  const addDishToOrder = (id: any, quantity: any) => console.log(id, quantity);

  return {
    dishes: data,
    isLoading,
    isError,
    refetch,
    addDishToOrder,
    page,
    setPage,
  };
};
