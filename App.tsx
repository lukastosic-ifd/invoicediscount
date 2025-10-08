
import React from 'react';
import { useState, useMemo, useCallback } from 'react';
import type { InvoiceLine } from './types';
import { InvoiceLineRow } from './components/InvoiceLineRow';
import { PlusIcon } from './components/icons';

const createNewLine = (): InvoiceLine => ({
  id: crypto.randomUUID(),
  name: '',
  quantity: 1,
  price: 0,
  applyDiscount: true,
});

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
};

const App: React.FC = () => {
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([
    createNewLine(),
    createNewLine(),
    createNewLine(),
  ]);
  const [finalAmountStr, setFinalAmountStr] = useState<string>('');
  
  const finalAmount = parseFloat(finalAmountStr) || 0;

  const handleUpdateLine = useCallback((index: number, field: keyof InvoiceLine, value: string | number | boolean) => {
    const newLines = [...invoiceLines];
    // Create a new object for the updated line to ensure immutability
    newLines[index] = { ...newLines[index], [field]: value };
    setInvoiceLines(newLines);
  }, [invoiceLines]);

  const handleAddLine = useCallback(() => {
    setInvoiceLines([...invoiceLines, createNewLine()]);
  }, [invoiceLines]);

  const handleRemoveLine = useCallback((index: number) => {
    if (invoiceLines.length > 1) {
      const newLines = invoiceLines.filter((_, i) => i !== index);
      setInvoiceLines(newLines);
    }
  }, [invoiceLines]);

  const { totalPreDiscount, discountableTotal, nonDiscountableTotal, discountPercentage } = useMemo(() => {
    let totalPreDiscount = 0;
    let discountableTotal = 0;
    let nonDiscountableTotal = 0;

    invoiceLines.forEach(line => {
      const lineTotal = line.quantity * line.price;
      totalPreDiscount += lineTotal;
      if (line.applyDiscount) {
        discountableTotal += lineTotal;
      } else {
        nonDiscountableTotal += lineTotal;
      }
    });

    const finalAmountForDiscountedItems = finalAmount - nonDiscountableTotal;
    const totalDiscountValue = discountableTotal - finalAmountForDiscountedItems;
    
    let discountPercentage = 0;
    if (discountableTotal > 0 && totalDiscountValue > 0) {
      discountPercentage = (totalDiscountValue / discountableTotal) * 100;
    }

    return { totalPreDiscount, discountableTotal, nonDiscountableTotal, discountPercentage };
  }, [invoiceLines, finalAmount]);

  const totalDiscountAmount = finalAmount > 0 && totalPreDiscount > finalAmount ? totalPreDiscount - finalAmount : 0;
  
  const getPriceAfterDiscount = useCallback((line: InvoiceLine) => {
    const lineTotal = line.quantity * line.price;
    if (line.applyDiscount && discountPercentage > 0) {
      return lineTotal * (1 - discountPercentage / 100);
    }
    return lineTotal;
  }, [discountPercentage]);

  const calculatedFinalAmount = nonDiscountableTotal + (discountableTotal * (1- (discountPercentage/100)));

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <main className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Invoice Discount Calculator</h1>
          <p className="text-slate-600 mt-2">Calculate a uniform discount across multiple invoice lines.</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="hidden sm:grid grid-cols-12 gap-4 items-center mb-2 px-3 text-left text-sm font-semibold text-slate-500 uppercase">
            <div className="col-span-3">Item Name</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2 text-right">Line Total</div>
            <div className="col-span-2 text-right">Discounted Price</div>
            <div className="col-span-1 text-center">Apply Discount</div>
            <div className="col-span-1 text-center">Remove</div>
          </div>
          
          <div className="space-y-2">
            {invoiceLines.map((line, index) => (
              <InvoiceLineRow
                key={line.id}
                line={line}
                index={index}
                onUpdate={handleUpdateLine}
                onRemove={handleRemoveLine}
                priceAfterDiscount={getPriceAfterDiscount(line)}
              />
            ))}
          </div>

          <div className="mt-4 flex justify-start">
            <button
              onClick={handleAddLine}
              className="flex items-center gap-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors shadow"
            >
              <PlusIcon />
              Add Line Item
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-700 border-b pb-3 mb-4">Calculation Summary</h2>
            <div className="space-y-3 text-lg">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Pre-Discount:</span>
                <span className="font-bold text-slate-800">{formatCurrency(totalPreDiscount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sum of Discountable Lines:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(discountableTotal)}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-slate-600">Sum of Non-Discountable Lines:</span>
                <span className="font-semibold text-slate-600">{formatCurrency(nonDiscountableTotal)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="text-slate-600">Total Discount Amount:</span>
                <span className="font-bold text-red-600">{formatCurrency(totalDiscountAmount)}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
                <label htmlFor="finalAmount" className="font-bold text-slate-800">Final Invoice Amount:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">€</span>
                  <input
                    id="finalAmount"
                    type="number"
                    value={finalAmountStr}
                    onChange={(e) => setFinalAmountStr(e.target.value)}
                    placeholder="0.00"
                    className="w-40 p-2 pl-7 border border-slate-300 rounded-md text-right font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-800 text-white p-6 rounded-xl shadow-lg flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-semibold text-blue-200">Result</h2>
            <p className="text-6xl font-bold my-2 text-yellow-300">
                {discountPercentage.toFixed(5)}%
            </p>
            <p className="text-blue-200">Calculated Discount Rate</p>
            <div className="mt-4 bg-blue-900/50 p-3 rounded-lg w-full">
              <div className="flex justify-between">
                <span className="text-blue-200">Calculated Total After Discount:</span>
                <span className="font-semibold text-white">{formatCurrency(calculatedFinalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
