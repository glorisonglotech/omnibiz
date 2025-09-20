import React from 'react'

function AppointmentPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          Schedule Appointment
        </button>
      </div>
      {/* Appointments content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6">
          <h3 className="font-semibold mb-4">Calendar View</h3>
          <p className="text-muted-foreground">Calendar will be displayed here</p>
        </div>
        <div className="bg-card rounded-lg p-6">
          <h3 className="font-semibold mb-4">Upcoming Appointments</h3>
          <p className="text-muted-foreground">Appointment list will be displayed here</p>
        </div>
      </div>
    </div>
  )
}

export default AppointmentPage