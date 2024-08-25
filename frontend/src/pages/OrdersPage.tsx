import React, { lazy, useState, useEffect, useRef } from "react";
import Layout from "../components/Layout/Layout";
import { usePaginatedOrders } from "../hooks/useOrders";
import { useDishes } from "../hooks/useDishes";
import { SearchIcon } from "lucide-react";
import { updateOrderStatusNew } from "@/services/api";
import KitchenPrint from "../components/Orders/KitchenPrint";
import SalesPrint from "../components/Orders/SalesPrint";

const OrderCard = lazy(() => import('../components/Orders/OrderCard'));
const PaginationControls = lazy(() => import('../components/Layout/PaginationControls'));

const OrdersPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showActionButton, setShowActionButton] = useState<boolean>(false);
  const [printType, setPrintType] = useState<"kitchen" | "sales" | null>(null);

  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = usePaginatedOrders(currentPage);

  const {
    dishes,
    isLoading: dishesLoading,
    isError: dishesError,
  } = useDishes();

  const printRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (orders) {
      setFilteredOrders(orders.results);
    }
  }, [orders]);

  useEffect(() => {
    if (orders && searchQuery) {
      const filtered = orders.results.filter((order: any) =>
        order.id.toString().includes(searchQuery)
      );
      setFilteredOrders(filtered);
    } else if (orders) {
      setFilteredOrders(orders.results);
    }
  }, [searchQuery, orders]);

  const handleSearch = () => {
    if (orders && searchQuery) {
      const filtered = orders.results.filter((order: any) =>
        order.id.toString().includes(searchQuery)
      );
      setFilteredOrders(filtered);
    } else if (orders) {
      setFilteredOrders(orders.results);
    }
  };

  const handleFilterOrders = (status: string) => {
    setStatusFilter(status);
    setSelectedOrders(
      orders.results.filter((order: any) => order.status === status).map((order: any) => order.id)
    );
    setShowActionButton(true);
  };

  const handleGenerateKitchenBills = async () => {
    try {
      await Promise.all(
        selectedOrders.map((orderId) =>
          updateOrderStatusNew(orderId, "approved")
        )
      );
      setPrintType("kitchen");
      triggerPrint();
    } catch (error) {
      console.error("Error generating kitchen bills:", error);
    }
  };

  const handlePrintSalesBills = async () => {
    try {
      await Promise.all(
        selectedOrders.map((orderId) =>
          updateOrderStatusNew(orderId, "delivered", { payment_method: "cash" })
        )
      );
      setPrintType("sales");
      triggerPrint();
    } catch (error) {
      console.error("Error printing sales bills:", error);
    }
  };

  const triggerPrint = () => {
    if (!printType || printRefs.current.length === 0) return; // Ensure printType is set

    const printWindow = window.open("", "PRINT", "height=600,width=800");

    if (printWindow) {
      printWindow.document.write("<html><head><title>Print</title>");
      printWindow.document.write("</head><body>");
      printRefs.current.forEach((printRef) => {
        if (printRef) {
          printWindow.document.write(printRef.innerHTML);
        }
      });
      printWindow.document.write("</body></html>");

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();

        setSelectedOrders([]);
        setShowActionButton(false);

        // Forcefully refresh the page after printing
        window.location.reload();
      }, 1000);
    }
  };

  if (ordersLoading || dishesLoading)
    return <Layout>Loading orders and dishes...</Layout>;

  if (ordersError || dishesError)
    return (
      <Layout>Error loading orders or dishes. Please try again later.</Layout>
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by ID..."
            className="border border-gray-300 rounded px-4 py-2"
          />
          <button onClick={handleSearch} className="text-black rounded p-2">
            <SearchIcon />
          </button>
        </div>
      </div>

      {/* Buttons for filtering */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => handleFilterOrders("pending")}
          className={`px-4 py-2 rounded-md ${
            statusFilter === "pending"
              ? "bg-blue-700 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Select Pending Orders
        </button>
        
        <button
          onClick={() => handleFilterOrders("approved")}
          className={`px-4 py-2 rounded-md ${
            statusFilter === "approved"
              ? "bg-yellow-700 text-white"
              : "bg-yellow-500 text-white hover:bg-yellow-600"
          }`}
        >
          Show Kitchen Orders
        </button>
      </div>

      {/* Centered action button */}
      {showActionButton && selectedOrders.length > 0 && (
        <div className="flex justify-center mb-4">
          <button
            onClick={
              statusFilter === "pending"
                ? handleGenerateKitchenBills
                : handlePrintSalesBills
            }
            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600"
          >
            {statusFilter === "pending"
              ? "Generate Kitchen Bills"
              : "Print Sales Bills"}
          </button>
        </div>
      )}

      {filteredOrders.length ? (
        <>
          {filteredOrders.map((order: any, index) => (
            <OrderCard
              key={order.id}
              order={order}
              dishes={dishes.results}
              selectedOrders={selectedOrders}
              onOrderSelection={setSelectedOrders}
              onStatusUpdated={refetchOrders}  // Pass the refetchOrders callback to OrderCard
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

      {/* Hidden print areas */}
      <div style={{ display: "none" }}>
        {filteredOrders
          .filter((order: any) => selectedOrders.includes(order.id))
          .map((order: any, index) => (
            <div
              key={order.id}
              ref={(el) => (printRefs.current[index] = el!)}
            >
              {printType === "kitchen" ? (
                <KitchenPrint order={order} dishes={dishes.results} />
              ) : (
                <SalesPrint order={order} dishes={dishes.results} />
              )}
            </div>
          ))}
      </div>
    </Layout>
  );
};

export default OrdersPage;
