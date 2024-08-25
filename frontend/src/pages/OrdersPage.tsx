import React, { lazy, useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout/Layout";
import { usePaginatedOrders } from "../hooks/useOrders";
import { useDishes } from "../hooks/useDishes";
import { SearchIcon } from "lucide-react";
import { debounce } from "lodash";
import { fetchActiveCreditUsers } from "@/services/api";
import { CreditUser } from "@/types";

const OrderCard = lazy(() => import('../components/Orders/OrderCard'));
const PaginationControls = lazy(() => import('../components/Layout/PaginationControls'));

const OrdersPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [creditUsers, setCreditUsers] = useState<CreditUser[]>([]);

  useEffect(() => {
    const loadCreditCardUsers = async () => {
      try {
        const users = await fetchActiveCreditUsers();
        setCreditUsers(users);
      } catch (error) {
        console.error("Failed to load credit card users:", error);
      }
    };
    loadCreditCardUsers();
  }, []);

  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
  } = usePaginatedOrders(currentPage);
  
  const {
    dishes,
    isLoading: dishesLoading,
    isError: dishesError,
  } = useDishes();

  useEffect(() => {
    if (orders) {
      setFilteredOrders(orders.results);
    }
  }, [orders]);

  const filterOrders = useMemo(() => 
    debounce((query: string) => {
      if (orders && query) {
        const filtered = orders.results.filter((order: any) =>
          order.id.toString().includes(query)
        );
        setFilteredOrders(filtered);
      } else if (orders) {
        setFilteredOrders(orders.results);
      }
    }, 300)
  , [orders]);

  useEffect(() => {
    filterOrders(searchQuery);
    return () => filterOrders.cancel();
  }, [searchQuery, filterOrders]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (ordersLoading || dishesLoading)
    return <Layout>Loading orders and dishes...</Layout>;

  if (ordersError || dishesError)
    return (
      <Layout>Error loading data. Please try again later.</Layout>
    );

  if (!dishes || !dishes.results) {
    return <Layout>No dish data available.</Layout>;
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Orders</h1>
        <div className="flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search orders by ID..."
            className="border border-gray-300 rounded px-4 py-2"
          />
          <SearchIcon className="ml-2 text-gray-500" />
        </div>
      </div>
      {filteredOrders.length ? (
        <>
          {filteredOrders.map((order: any) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              dishes={dishes.results} 
              creditUsers={creditUsers}
            />
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(orders.count / 10)}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <p className="text-gray-600">No orders found for the provided ID.</p>
      )}
    </Layout>
  );
};

export default OrdersPage;