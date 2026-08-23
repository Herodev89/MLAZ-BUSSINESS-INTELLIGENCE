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
    <div id="receipt-print-area" className="hidden print:block p-10 bg-white text-black font-sans mx-auto border border-gray-300 shadow-md" style={{ maxWidth: '400px', width: '100%' }}>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              overflow: "hidden",
              margin: "0 auto",
            }}
          >
            <img src="/logo.jpg" alt="MLAZ Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
        <h3 className="text-lg font-bold" style={{ color: '#3D1F0E', marginBottom: '2px' }}>MLAZ LIMITED</h3>
        <p className="text-xs italic" style={{ color: '#B8860B', fontWeight: 600 }}>Guaranteed amble across the globe</p>
      </div>

      <div className="mb-6 text-sm border-b-2 border-dashed border-gray-300 pb-4">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-gray-600">Date:</span>
          <span>{date}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-gray-600">Receipt No:</span>
          <span className="font-mono">{saleId}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Sales Rep:</span>
          <span>{salesRep}</span>
        </div>
      </div>

      <div className="mb-6 border-b-2 border-dashed border-gray-300 pb-4">
        <div className="flex justify-between font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
          <span>Item Details</span>
          <span>Amount</span>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between mb-2 text-sm">
            <span>{item.quantity} x {item.name}</span>
            <span className="font-semibold">₦{(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-8">
        <span className="font-bold text-gray-800 text-lg uppercase tracking-wider">Total</span>
        <span className="font-black text-2xl" style={{ color: '#3D1F0E' }}>₦{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      <div className="text-center text-sm text-gray-600 mt-8">
        <p className="font-semibold italic mb-1">Thank you for shopping with MLAZ!</p>
        <p className="text-xs mt-2" style={{ color: '#B8860B' }}>Quality Guaranteed.</p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #receipt-print-area, #receipt-print-area * { visibility: visible; }
          #receipt-print-area {
            position: absolute;
            left: 50%;
            top: 20px;
            transform: translateX(-50%);
            width: 350px;
            border: none;
            box-shadow: none;
            padding: 0;
          }
        }
      `}} />
    </div>
  );
}
