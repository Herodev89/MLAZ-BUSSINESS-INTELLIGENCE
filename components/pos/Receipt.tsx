import React from "react";

interface ReceiptProps {
  saleId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  date: string;
  salesRep: string;
}

export function Receipt({ saleId, items, total, date, salesRep }: ReceiptProps) {
  return (
    <div id="receipt-print-area" className="hidden print:block p-8 bg-white text-black font-mono text-sm max-w-[300px] mx-auto border-dashed border-2 border-gray-300">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-1">MLAZ</h2>
        <p className="text-gray-500 text-xs">Business Intelligence</p>
      </div>

      <div className="mb-4 text-xs border-b border-dashed border-gray-300 pb-4">
        <div className="flex justify-between mb-1">
          <span>Date:</span>
          <span>{date}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Sale ID:</span>
          <span>{saleId.slice(0, 8)}...</span>
        </div>
        <div className="flex justify-between">
          <span>Rep:</span>
          <span>{salesRep}</span>
        </div>
      </div>

      <div className="mb-4 border-b border-dashed border-gray-300 pb-4">
        <div className="flex justify-between font-bold mb-2">
          <span>Item</span>
          <span>Total</span>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between mb-1 text-xs">
            <span>{item.quantity}x {item.name}</span>
            <span>₦{(item.quantity * item.price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between font-bold text-lg mb-6">
        <span>TOTAL</span>
        <span>₦{total.toFixed(2)}</span>
      </div>

      <div className="text-center text-xs text-gray-500 mt-8">
        <p>Thank you for your business!</p>
        <p className="mt-1">Powered by MLAZ</p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-print-area, #receipt-print-area * {
            visibility: visible;
          }
          #receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            padding: 0;
          }
        }
      `}} />
    </div>
  );
}
