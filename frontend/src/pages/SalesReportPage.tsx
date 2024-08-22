import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import PaginationControls from "../components/Layout/PaginationControls";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the styles
import { RotateCcw } from 'lucide-react';
import SalesPrint from "@/components/SalesReport/SalesPrint";

interface SalesReport {
  id: number;
  total_amount: number;
  status: string;
  order_type: string;
  payment_method: string;
  created_at: string;
  invoice_number: string;
  cash_amount: string;
  bank_amount: string;
}
interface MessType {
  id: number;
  name: string;
}


interface MessReport {
  id: number;
  customer_name: string;
  mobile_number: string;
  mess_type:MessType;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  start_date: string;
  end_date: string;
  payment_method: string;
}

const SalesReportPage: React.FC = () => {
  const [reportType, setReportType] = useState<"sales" | "mess">("sales");
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [messReports, setMessReports] = useState<MessReport[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDataWithFilter({});
  }, [reportType, fromDate, toDate]);

  const fetchDataWithFilter = async (filter: Record<string, string>) => {
    try {
      const baseUrl = reportType === "sales"
        ? "http://127.0.0.1:8000/api/orders/sales_report/"
        : "http://127.0.0.1:8000/api/messes/mess_report/";

      const url = new URL(baseUrl);
      const token = localStorage.getItem("token");

      // Function to convert date to UTC format
      const convertToUTCDate = (date: Date) => {
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        return utcDate.toISOString().split("T")[0];
      };

      if (fromDate) {
        url.searchParams.append("from_date", convertToUTCDate(fromDate));
      }
      if (toDate) {
        url.searchParams.append("to_date", convertToUTCDate(toDate));
      }

      // Append filter parameters to the URL
      Object.entries(filter).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (reportType === "sales") {
          setReports(data);
        } else {
          setMessReports(data);
        }
        setCurrentPage(1);
      } else {
        console.error("HTTP error! status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleButtonClick = (buttonName: string) => {
    let filter = {};
    setActiveButton(buttonName); 

    if (reportType === "sales") {
      switch (buttonName) {
        case "Dining":
          filter = { order_type: "dining" };
          break;
        case "Takeaway":
          filter = { order_type: "takeaway" };
          break;
        case "Delivery":
          filter = { order_type: "delivery" };
          break;
        case "Cash":
          filter = { payment_method: "cash" };
          break;
        case "Bank":
          filter = { payment_method: "bank" };
          break;
        case "Cash-Bank":
          filter = { payment_method: "cash-bank" };
          break;
        case "Canceled":
          filter = { order_status: "cancelled" };
          break;
        case "Delivered":
          filter = { order_status: "delivered" };
          break;
        default:
          filter = {}; // No filter if the button name does not match
      }
    } else if (reportType === "mess") {
      switch (buttonName) {
        case "Cash":
          filter = { payment_method: "cash" };
          break;
        case "Bank":
          filter = { payment_method: "bank" };
          break;
        case "Cash-Bank":
          filter = { payment_method: "cash-bank" };
          break;
        case "Credit":
          filter = { credit: "credit" };
          break;
        case "Breakfast and Lunch":
          filter = { mess_type: "breakfast_lunch" };
          break;
        case "Breakfast and Dinner":
          filter = { mess_type: "lunch_dinner" };
          break;
        case "Lunch and Dinner":
          filter = { mess_type: "breakfast_dinner" };
          break;
        case "Breakfast and Lunch and Dinner":
          filter = { mess_type: "breakfast_lunch_dinner" };
          break;
        default:
          filter = {}; // No filter if the button name does not match
      }
    }

    fetchDataWithFilter(filter);
  };


  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    setCurrentPage(1);
    fetchDataWithFilter({});
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = reports.slice(startIndex, startIndex + itemsPerPage);
  const paginatedMessReports = messReports.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setReportType("sales")}
              className={`p-4 rounded-lg shadow-md cursor-pointer ${reportType === "sales" ? "bg-purple-500 text-white" : "bg-gray-200"}`}
            >
              Sales Report
            </button>
            <button
              onClick={() => setReportType("mess")}
              className={`p-4 rounded-lg shadow-md cursor-pointer ${reportType === "mess" ? "bg-purple-500 text-white" : "bg-gray-200"}`}
            >
              Mess Report
            </button>
          </div>

          {/* Date Pickers and Reset Button */}
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">From Date</label>
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date)}
                dateFormat="yyyy-MM-dd"
                className="mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">To Date</label>
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                dateFormat="yyyy-MM-dd"
                className="mt-1 p-2 border rounded"
              />
            </div>
            <button
              onClick={handleReset}
              className="mt-7 bg-red-500 text-white p-2 rounded-lg shadow-md"
            >
              <RotateCcw />
            </button>
          </div>
          <SalesPrint
          reportType={reportType}
          reports={reports}
          messReports={messReports}
        />
        </div>

        {/* New Buttons Row */}
        <div className="flex space-x-2 mb-4">
          {(reportType === "sales"
            ? ["Dining", "Takeaway", "Delivery", "Cash", "Bank", "Cash-Bank", "Canceled", "Delivered"]
            : ["Cash", "Bank", "Cash-Bank", "Credit","Breakfast and Lunch and Dinner","Breakfast and Lunch","Breakfast and Dinner","Lunch and Dinner"]
          ).map((name, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(name)}
              className={`p-2 rounded-lg shadow-md ${activeButton === name ? "bg-purple-500 text-white" : "bg-blue-500 text-white"} hover:bg-blue-600`}            >
              {name}
            </button>
          ))}
        </div>


        {/* Report Table */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          {reportType === "sales" ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Type</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Type</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.invoice_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.order_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.payment_method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.cash_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.bank_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile No</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mess Type</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMessReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.mobile_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.mess_type.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.total_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.paid_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.pending_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.start_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.end_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalItems={reportType === "sales" ? reports.length : messReports.length}
          totalPages={Math.ceil((reportType === "sales" ? reports.length : messReports.length) / itemsPerPage)}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />

      </div>
    </Layout>
  );
};

export default SalesReportPage;
