
import React from 'react';
import type { InvoiceLine } from '../types.ts';
import { TrashIcon } from './icons.tsx';

interface InvoiceLineRowProps {
  line: InvoiceLine;
  index: number;
  onUpdate: (index: number, field: keyof InvoiceLine, value: string | number | boolean) => void;
  onRemove: (index: number) => void;
  priceAfterDiscount: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
};

export const InvoiceLineRow: React.FC<InvoiceLineRowProps> = ({ line, index, onUpdate, onRemove, priceAfterDiscount }) => {
  const lineTotal = line.quantity * line.price;

  return (
    <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center p-3 bg-white border-b border-slate-200 last:border-b-0 first:rounded-t-lg last:rounded-b-lg">
      <div className="col-span-12 sm:col-span-3">
        <label className="text-xs text-slate-500 sm:hidden">Item Name</label>
        <input
          type="text"
          placeholder="e.g. Website Development"
          value={line.name}
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>
      <div className="col-span-4 sm:col-span-1">
        <label className="text-xs text-slate-500 sm:hidden">Qty</label>
        <input
          type="number"
          value={line.quantity}
          onChange={(e) => onUpdate(index, 'quantity', parseFloat(e.target.value) || 0)}
          min="0"
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>
      <div className="col-span-8 sm:col-span-2">
        <label className="text-xs text-slate-500 sm:hidden">Price</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">€</span>
          <input
            type="number"
            value={line.price}
            onChange={(e) => onUpdate(index, 'price', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="w-full p-2 pl-7 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
      </div>
      <div className="col-span-4 sm:col-span-2 text-center sm:text-right">
        <span className="text-xs text-slate-500 block">Line Total</span>
        <span className="font-semibold text-slate-700">{formatCurrency(lineTotal)}</span>
      </div>
      <div className="col-span-4 sm:col-span-2 text-center sm:text-right">
        <span className="text-xs text-slate-500 block">Discounted</span>
        <span className="font-semibold text-green-600">{formatCurrency(priceAfterDiscount)}</span>
      </div>
      <div className="col-span-2 sm:col-span-1 flex justify-center items-center">
        <input
          type="checkbox"
          checked={line.applyDiscount}
          onChange={(e) => onUpdate(index, 'applyDiscount', e.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>
      <div className="col-span-2 sm:col-span-1 flex justify-center items-center">
        <button
          onClick={() => onRemove(index)}
          className="text-slate-400 hover:text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors"
          aria-label="Remove line"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};