import React from 'react'

function InventoryPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          Add Item
        </button>
      </div>
      {/* Inventory content */}
      <div className="bg-card rounded-lg p-6">
        <p className="text-muted-foreground">Inventory items will be displayed here</p>
      </div>
    </div>
  )
}

export default InventoryPage