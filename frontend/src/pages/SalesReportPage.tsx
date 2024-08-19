import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import PaginationControls from "../components/Layout/PaginationControls";

interface OrderItem {
  dish: number;
  quantity: number;
}

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
  const itemsPerPage = 10;

  useEffect(() => {
    if (reportType === "sales") {
      fetchSalesReports();
    } else {
      fetchMessReports();
    }
  }, [reportType]);

  const fetchSalesReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/orders/",{
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.results); // Set the results array directly
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
      const response = await fetch("http://127.0.0.1:8000/api/messes/");
      if (response.ok) {
        const data = await response.json();
        setMessReports(data.results); // Set the results array directly
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
        <div className="flex space-x-4 mb-4">
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
