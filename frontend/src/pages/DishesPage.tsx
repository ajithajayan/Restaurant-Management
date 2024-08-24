import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { Check, ChevronsUpDown, CircleCheckBig, Search } from "lucide-react";

import Layout from "../components/Layout/Layout";
import DishList from "../components/Dishes/DishList";
import OrderItem from "../components/Orders/OrderItem";
import { useDishes } from "../hooks/useDishes";
import { useOrders } from "../hooks/useOrders";
import {
  Dish,
  Category,
  OrderFormData,
  DeliveryDriver,
  CreditUser,
} from "../types";
import {
  fetchActiveCreditUsers,
  fetchDeliveryDrivers,
  fetchUnreadCount,
  getCategories,
} from "../services/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Loader from "@/components/Layout/Loader";

type OrderType = "dining" | "takeaway" | "delivery";
type PaymentMethodType = "cash" | "bank" | "cash-bank" | "credit";

type OrderDish = Dish & { quantity: number };

const DishesPage: React.FC = () => {
  const navigate = useNavigate();
  const { dishes, isLoading, isError, addDishToOrder, page, setPage } =
    useDishes();
  const { createOrder } = useOrders();
  const { data: categories } = useQuery<Category[]>(
    "categories",
    getCategories
  );
  const { data: deliveryDriversList } = useQuery<{ results: DeliveryDriver[] }>(
    "deliveryDrivers",
    fetchDeliveryDrivers
  );

  const [activeCreditUsers, setActiveCreditUsers] = useState<CreditUser[]>([]);
  const [orderItems, setOrderItems] = useState<OrderDish[]>([]);
  const [isOrderVisible, setIsOrderVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("dining");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("cash");
  const [bankAmount, setBankAmount] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<DeliveryDriver | null>(
    null
  );
  const [selectedCreditUser, setSelectedCreditUser] =
    useState<CreditUser | null>(null);

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [openDriverSelect, setOpenDriverSelect] = useState(false);
  const [openCreditUserSelect, setOpenCreditUserSelect] = useState(false);
  const [error, setError] = useState("");

  const data = dishes?.results || [];

  useEffect(() => {
    const loadActiveUsers = async () => {
      try {
        const users = await fetchActiveCreditUsers();
        setActiveCreditUsers(users);
      } catch (error) {
        console.error('Failed to load active users:', error);
      }
    };

    loadActiveUsers();
  }, []);

  const handleAddDish = (dish: Dish) => {
    addDishToOrder(dish.id, 1);
    const existingItem = orderItems.find((item) => item.id === dish.id);
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.id === dish.id
            ? { ...item, quantity: (item.quantity || 0) + 1 }
            : item
        )
      );
    } else {
      setOrderItems([...orderItems, { ...dish, quantity: 1 }]);
    }
    setIsOrderVisible(true);
  };

  const updateQuantity = (id: number, change: number) => {
    setOrderItems(
      orderItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max((item.quantity || 0) + change, 0) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCheckout = () => {
    try {
      if (orderType === "delivery") {
        if (!deliveryAddress) {
          setError("Delivery address is required for delivery orders.");
          return;
        }
        if (!selectedDriver) {
          setError("A delivery driver must be selected for delivery orders.");
          return;
        }
      }

      const orderData: OrderFormData = {
        items: orderItems.map((item) => ({
          dish: item.id,
          quantity: item.quantity || 0,
        })),
        total_amount: parseFloat(total.toFixed(2)),
        status: "pending",
        order_type: orderType,
        payment_method: paymentMethod,
        bank_amount:
          paymentMethod === "cash-bank"
            ? parseFloat(bankAmount) || 0
            : undefined,
        cash_amount:
          paymentMethod === "cash-bank"
            ? parseFloat(cashAmount) || 0
            : undefined,
        address: orderType === "delivery" ? deliveryAddress : "",
        delivery_driver_id:
          orderType === "delivery" && selectedDriver ? selectedDriver.id : null,
        credit_user_id:
          paymentMethod === "credit" && selectedCreditUser
            ? selectedCreditUser.id
            : null,
      };

      createOrder(orderData);
      setShowSuccessModal(true);
      setOrderItems([]);
      setIsOrderVisible(false);
    } catch (error) {
      console.error(`Error creating order:`, error);
      setError("An error occurred while creating the order. Please try again.");
    }
  };

  const handleCloseBtnClick = () => {
    fetchUnreadCount();
    setShowSuccessModal(false);
    navigate("/orders");
  };

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
  };

  const filteredDishes = data.filter((dish) => {
    const categoryMatch =
      selectedCategory === null ||
      (typeof dish.category === "number"
        ? dish.category === selectedCategory
        : dish.category.id === selectedCategory);
    const searchMatch = dish.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading)
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  if (isError)
    return (
      <div className="flex justify-center items-center h-screen">
        Error loading dishes
      </div>
    );

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal;

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row">
        <div className="w-full pr-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-bold mb-4 sm:mb-0">
              Choose Categories
            </h2>
            <div className="flex items-center w-full sm:w-auto">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full sm:w-64 mr-2"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              onClick={() => handleCategoryClick(null)}
              variant={selectedCategory === null ? "default" : "outline"}
            >
              All items
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
          <DishList dishes={filteredDishes} onAddDish={handleAddDish} />
          <div className="flex justify-center mt-16">
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="mr-2"
            >
              Previous
            </Button>
            <span className="px-4 py-2 bg-gray-200 rounded">{page}</span>
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={!dishes?.next}
              className="ml-2"
            >
              Next
            </Button>
          </div>
        </div>
        {orderItems.length > 0 && (
          <div
            className={`w-full lg:w-[550px] bg-white p-8 mt-2 ${
              isOrderVisible ? "block" : "hidden lg:block"
            }`}
          >
            <div className="sticky top-0">
              <h2 className="text-2xl font-bold mb-4">New Order</h2>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {orderItems.map((item) => (
                  <OrderItem
                    key={item.id}
                    orderItem={item}
                    incrementQuantity={() => updateQuantity(item.id, 1)}
                    decrementQuantity={() => updateQuantity(item.id, -1)}
                    removeItem={() =>
                      updateQuantity(item.id, -(item.quantity || 0))
                    }
                  />
                ))}
              </div>
              <div className="mt-8">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>QAR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>QAR {total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-8">
                <RadioGroup
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as OrderType)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dining" id="dining" />
                    <Label htmlFor="dining">Dining</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="takeaway" id="takeaway" />
                    <Label htmlFor="takeaway">Takeaway</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery">Delivery</Label>
                  </div>
                </RadioGroup>
              </div>
              {orderType === "delivery" && (
                <>
                  <div className="mt-4 flex flex-col gap-2">
                    <Label htmlFor="deliveryAddress">Delivery Address</Label>
                    <Input
                      id="deliveryAddress"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter delivery address"
                    />
                  </div>
                  <div className="mt-4">
                    <Label>Select Delivery Driver</Label>
                    <Popover
                      open={openDriverSelect}
                      onOpenChange={setOpenDriverSelect}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openDriverSelect}
                          className="w-full justify-between"
                        >
                          {selectedDriver
                            ? selectedDriver.username
                            : "Select driver..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search drivers..." />
                          <CommandList>
                            <CommandEmpty>No driver found.</CommandEmpty>
                            <CommandGroup>
                              {deliveryDriversList?.results.map((driver) => (
                                <CommandItem
                                  key={driver.id}
                                  value={driver.username}
                                  onSelect={() => {
                                    setSelectedDriver(driver);
                                    setOpenDriverSelect(false);
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedDriver?.id === driver.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  {driver.username}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}
              <div className="mt-8 mb-4">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as PaymentMethodType)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank">Bank</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash-bank" id="cash-bank" />
                    <Label htmlFor="cash-bank">Cash & Bank</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit">Credit</Label>
                  </div>
                </RadioGroup>
              </div>
              {paymentMethod === "cash-bank" && (
                <div className="flex flex-col gap-2">
                  <div className="flex w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="cash_value">Cash</Label>
                    <Input
                      type="text"
                      id="cash_value"
                      placeholder="Cash"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="bank_value">Bank</Label>
                    <Input
                      type="text"
                      id="bank_value"
                      placeholder="Bank"
                      value={bankAmount}
                      onChange={(e) => setBankAmount(e.target.value)}
                    />
                  </div>
                </div>
              )}
              {paymentMethod === "credit" && (
                <div className="mt-4 flex flex-col gap-2">
                  <Label>Select Credit User</Label>
                  <Popover
                    open={openCreditUserSelect}
                    onOpenChange={setOpenCreditUserSelect}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCreditUserSelect}
                        className="w-full justify-between"
                      >
                        {selectedCreditUser
                          ? selectedCreditUser.username
                          : "Select user..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search users..." />
                        <CommandList>
                          <CommandEmpty>No user found.</CommandEmpty>
                          <CommandGroup>
                            {activeCreditUsers?.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={user.username}
                                onSelect={() => {
                                  setSelectedCreditUser(user);
                                  setOpenCreditUserSelect(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedCreditUser?.id === user.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                {user.username}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button className="w-full mt-6" onClick={handleCheckout}>
                Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <CircleCheckBig size={48} className="text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Order Success</h2>
            <p>Your order has been placed successfully!</p>
            <Button className="mt-4" onClick={handleCloseBtnClick}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DishesPage;
