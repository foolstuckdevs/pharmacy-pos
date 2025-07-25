'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ProductCard';
import { Cart, CartItem } from '@/components/Cart';
import { PaymentModal } from '@/components/PaymentModal';
import type { Pharmacy, Product } from '@/types';
import { processSale } from '@/lib/actions/sales';
import { PrintUtility } from '@/lib/PrintUtility';

interface POSPageProps {
  products: Product[];
  pharmacyInfo: Pharmacy | null;
  pharmacyId: number;
}

export default function POSPage({
  products: initialProducts,
  pharmacyInfo,
  pharmacyId,
}: POSPageProps) {
  const { data: session } = useSession();
  const [products] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [cashReceived, setCashReceived] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate totals
  const totalAmount = cart.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const discountAmount = (totalAmount * discountPercentage) / 100;
  const discountedTotal = totalAmount - discountAmount;
  const change = cashReceived - discountedTotal;

  // Cart functions
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity + 1,
          product.quantity,
        );
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item,
        );
      } else {
        return [
          ...prevCart,
          {
            ...product,
            quantity: 1,
            unitPrice: parseFloat(product.sellingPrice),
          },
        ];
      }
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    const product = products.find((p) => p.id === productId);
    const maxQuantity = product?.quantity || 1;
    const validatedQuantity = Math.max(
      1,
      Math.min(maxQuantity, Math.floor(newQuantity) || 1),
    );
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          return { ...item, quantity: validatedQuantity };
        }
        return item;
      }),
    );
  };

  const handleDiscountChange = (discount: number) => {
    setDiscountPercentage(discount);
  };

  // Payment functions
  const handleCheckout = async () => {
    setShowPaymentModal(true);
  };

  const handleCashChange = (amount: number) => {
    setCashReceived(amount);
  };

  const handleCancelPayment = () => {
    setShowPaymentModal(false);
  };

  const handleConfirmPayment = async () => {
    if (!pharmacyId || cart.length === 0) return;
    if (cashReceived < discountedTotal) {
      toast.error('Insufficient cash received');
      return;
    }
    setIsProcessing(true);
    try {
      const result = await processSale(
        cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
        })),
        'CASH',
        discountAmount,
        pharmacyId,
        session?.user?.id ?? '',
        cashReceived,
      );
      if (result.success && result.data) {
        toast.success('Sale processed successfully');
        const printSuccess = await PrintUtility.printDynamicReceipt(
          {
            invoiceNumber: result.data.invoiceNumber,
            createdAt: result.data.createdAt,
            totalAmount: result.data.totalAmount,
            discount: discountAmount,
            amountReceived: cashReceived,
            changeDue: Math.max(0, change),
          },
          cart.map((item) => ({
            ...item,
            unitPrice: parseFloat(item.unitPrice.toString()),
          })),
          pharmacyInfo,
        );
        if (!printSuccess) {
          toast.warning('Receipt printed with issues - sale was processed');
        }
        setCart([]);
        setCashReceived(0);
        setDiscountPercentage(0);
        setShowPaymentModal(false);
        // Optionally, re-fetch products here if needed
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to process sale');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Product Grid */}
      <div className="lg:col-span-3">
        <div className="mb-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white"
          />
        </div>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No products found
          </div>
        )}
      </div>
      {/* Cart Section */}
      <div className="lg:col-span-1">
        <Cart
          cart={cart}
          products={products}
          discountPercentage={discountPercentage}
          isProcessing={isProcessing}
          totalAmount={totalAmount}
          discountAmount={discountAmount}
          discountedTotal={discountedTotal}
          onRemoveFromCart={handleRemoveFromCart}
          onQuantityChange={handleQuantityChange}
          onDiscountChange={handleDiscountChange}
          onCheckout={handleCheckout}
        />
      </div>
      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        discountedTotal={discountedTotal}
        cashReceived={cashReceived}
        change={change}
        isProcessing={isProcessing}
        onCashChange={handleCashChange}
        onCancel={handleCancelPayment}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}
