import React from "react";
import { Bill } from "../../types";
import { useOrder } from "../../hooks/useOrder";
import Loader from "../Layout/Loader";

interface BillCardProps {
  bill: Bill;
}

const BillCard: React.FC<BillCardProps> = ({ bill }) => {
  const { data: order, isLoading, isError } = useOrder(bill.order);

  if (isLoading) return <Loader />;
  if (isError) return <div>Error loading order details.</div>;

  return (
    <div key={bill.id} className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold">Bill #{bill.id}</h2>
      <p className="text-sm text-gray-600 mb-4">
        Billed on: {new Date(bill.billed_at).toLocaleString()}
      </p>
      {order && (
        <>
          <h3 className="text-lg text-gray-700 font-semibold">Order Details</h3>
          <p className="text-sm text-gray-600 mb-4">
            Order #{order.id} - Ordered on:{" "}
            {new Date(order.created_at).toLocaleString()}
          </p>
        </>
      )}
      <div className="mt-4 flex justify-between items-center">
        <span
          className={`px-3 py-1 rounded ${
            bill.paid ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {bill.paid ? "Paid" : "Unpaid"}
        </span>
        <span className="text-lg font-semibold">
          Total Amount: ${bill.total_amount}
        </span>
      </div>
    </div>
  );
};

export default BillCard;
