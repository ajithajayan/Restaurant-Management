import React from "react";
import { Order, Dish } from "../../types";

interface KitchenPrintProps {
  order: Order;
  dishes: Dish[];
}

const KitchenPrint: React.FC<KitchenPrintProps> = ({ order, dishes }) => {
  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return date.toLocaleTimeString(undefined, options);
  };

  return (
    <div className="print-container w-64 p-4 text-sm bg-white border-2 border-dashed rounded-lg mx-auto">
      <h1 className="text-center text-lg font-bold mb-2">Kitchen Order</h1>
      <div className="print-order-id mb-2">Order_id #{order.id}</div>
      <div className="print-date mb-2">Date: {formatDate(order.created_at)}</div>
      <div className="print-time mb-2">Time: {formatTime(order.created_at)}</div>
      <div className="print-items">
        {order.items.map((item, index) => {
          const dish = dishes.find(dish => dish.id === item.dish);
          return (
            <div key={index} className="print-item flex justify-between mb-1">
              <span className="print-item-name">{dish ? dish.name : 'Unknown Dish'}</span>
              <span className="print-item-quantity">{item.quantity}x</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KitchenPrint;
