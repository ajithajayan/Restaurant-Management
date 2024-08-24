import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/services/api";
import { CreditUserModal } from "../modals/CreditUserModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { CreditPaymentModal } from "../modals/CreditPaymentModal";

interface CreditUser {
  id: number;
  username: string;
  last_payment_date: string;
  total_due: number;
  is_active: boolean;
}

export function CreditUserTable() {
  const [sorting, setSorting] = useState<any[]>([]);
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<CreditUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCreditUserId, setSelectedCreditUserId] = useState<
    number | null
  >(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [creditUserToDelete, setCreditUserToDelete] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetchCreditUsers();
  }, []);

  const fetchCreditUsers = async () => {
    try {
      const response = await api.get("/credit-users/");
      setData(response.data.results);
    } catch (error) {
      console.error("Error fetching credit users:", error);
    }
  };

  const handleAddCreditUser = () => {
    setSelectedCreditUserId(null);
    setIsModalOpen(true);
  };

  const handleEditCreditUser = (creditUserId: number) => {
    setSelectedCreditUserId(creditUserId);
    setIsModalOpen(true);
  };

  const handleDeleteCreditUser = (creditUserId: number) => {
    setCreditUserToDelete(creditUserId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (creditUserToDelete) {
      try {
        await api.delete(`/credit-users/${creditUserToDelete}/`);
        setData((prevData) =>
          prevData.filter((creditUser) => creditUser.id !== creditUserToDelete)
        );
      } catch (error) {
        console.error("Error deleting credit user:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setCreditUserToDelete(null);
      }
    }
  };

  const handleMakePayment = (creditUserId: number) => {
    setSelectedCreditUserId(creditUserId);
    setIsPaymentModalOpen(true);
  };

  const handleCreditUserChange = async () => {
    await fetchCreditUsers();
  };

  const columns = [
    {
      accessorKey: "username",
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => <div>{row.getValue("username")}</div>,
    },
    {
      accessorKey: "last_payment_date",
      header: "Last Payment Date",
      cell: ({ row }: any) => (
        <div>
          {new Date(row.getValue("last_payment_date")).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "time_period",
      header: "End Date",
      cell: ({ row }: any) => (
        <div>{new Date(row.getValue("time_period")).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "total_due",
      header: () => <div className="text-right">Total Due</div>,
      cell: ({ row }: any) => {
        const amount = parseFloat(row.getValue("total_due"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: any) => (
        <div
          className={`font-medium ${
            row.getValue("is_active") ? "text-green-600" : "text-red-600"
          }`}
        >
          {row.getValue("is_active") ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: any) => {
        const creditUser = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {creditUser.total_due > 0 && (
                <DropdownMenuItem
                  onClick={() => handleMakePayment(creditUser.id)}
                >
                  Make Payment
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleEditCreditUser(creditUser.id)}
              >
                Edit credit user
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteCreditUser(creditUser.id)}
              >
                Delete credit user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter credit users..."
          value={
            (table.getColumn("username")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("username")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button
          onClick={handleAddCreditUser}
          className="flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} />
          <span>Add Credit User</span>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      <CreditUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        creditUserId={selectedCreditUserId}
        onCreditUserChange={handleCreditUserChange}
      />
      <CreditPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        creditUserId={selectedCreditUserId}
        onPaymentSuccess={handleCreditUserChange}
      />
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this credit user? This action cannot be undone."
      />
    </div>
  );
}
