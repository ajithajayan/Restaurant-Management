import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import PaginationControls from "../components/Layout/PaginationControls";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the styles

interface SalesReport {
  id: number;
  total_amount: number;
  status: string;
  order_type: string;
  payment_method: string;
  created_at: string;
}

interface MessReport {
  id: number;
  customer_name: string;
  mobile_number: string;
  mess_type: string;
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
  const itemsPerPage = 10;

  useEffect(() => {
    if (reportType === "sales") {
      fetchSalesReports();
    } else {
      fetchMessReports();
    }
  }, [reportType, fromDate, toDate]);

  const fetchSalesReports = async () => {
    try {
      const url = new URL("http://127.0.0.1:8000/api/orders/");
      const token = localStorage.getItem("token");

      if (fromDate) url.searchParams.append("from_date", fromDate.toISOString().split("T")[0]);
      if (toDate) url.searchParams.append("to_date", toDate.toISOString().split("T")[0]);

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.results);
        setCurrentPage(1);
      } else {
        console.error("HTTP error! status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching sales reports:", error);
    }
  };

  const fetchMessReports = async () => {
    try {
      const url = new URL("http://127.0.0.1:8000/api/messes/");

      if (fromDate) url.searchParams.append("from_date", fromDate.toISOString().split("T")[0]);
      if (toDate) url.searchParams.append("to_date", toDate.toISOString().split("T")[0]);

      const response = await fetch(url.toString());

      if (response.ok) {
        const data = await response.json();
        setMessReports(data.results);
        setCurrentPage(1);
      } else {
        console.error("HTTP error! status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching mess reports:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
              className={`p-4 rounded-lg shadow-md cursor-pointer ${
                reportType === "sales" ? "bg-purple-500 text-white" : "bg-gray-200"
              }`}
            >
              Sales Report
            </button>
            <button
              onClick={() => setReportType("mess")}
              className={`p-4 rounded-lg shadow-md cursor-pointer ${
                reportType === "mess" ? "bg-purple-500 text-white" : "bg-gray-200"
              }`}
            >
              Mess Report
            </button>
          </div>

          {/* Date Pickers - Positioned on the right side */}
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
          </div>
        </div>

        {/* Report Table */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          {reportType === "sales" ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Type</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{report.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(report.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.order_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.payment_method}</td>
                    <td className="px-6 py-4 whitespace-nowrap">QR{report.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile No</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mess Type</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMessReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{report.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.mobile_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.mess_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(report.start_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(report.end_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">QR{report.paid_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">QR{report.pending_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">QR{report.total_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil((reportType === "sales" ? reports.length : messReports.length) / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </Layout>
  );
};

export default SalesReportPage;
