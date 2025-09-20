import React from 'react'

function FinancePage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Finance</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          Create Invoice
        </button>
      </div>
      {/* Finance content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6">
          <h3 className="font-semibold mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-primary">$0.00</p>
        </div>
        <div className="bg-card rounded-lg p-6">
          <h3 className="font-semibold mb-2">Pending Invoices</h3>
          <p className="text-2xl font-bold text-orange-500">0</p>
        </div>
        <div className="bg-card rounded-lg p-6">
          <h3 className="font-semibold mb-2">Expenses</h3>
          <p className="text-2xl font-bold text-red-500">$0.00</p>
        </div>
      </div>
    </div>
  )
}

export default FinancePage