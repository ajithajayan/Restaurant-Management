import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";

interface CreditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditUserId: number | null;
  onPaymentSuccess: () => void;
}

export function CreditPaymentModal({
  isOpen,
  onClose,
  creditUserId,
  onPaymentSuccess,
}: CreditPaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState<number | string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentAmount(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (creditUserId === null) return;

    try {
      await api.post(`/credit-users/${creditUserId}/make_payment/`, {
        payment_amount: paymentAmount,
      });
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error("Error making payment:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_amount" className="text-right">
                Payment Amount
              </Label>
              <Input
                id="payment_amount"
                name="payment_amount"
                type="number"
                value={paymentAmount}
                onChange={handleInputChange}
                className="col-span-3"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Make Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
