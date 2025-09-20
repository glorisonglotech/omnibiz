import React from 'react'

function ECommercePage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">E-Commerce</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          Add Product
        </button>
      </div>
      {/* E-commerce content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6">
          <p className="text-muted-foreground">Product catalog will be displayed here</p>
        </div>
      </div>
    </div>
  )
}

export default ECommercePage