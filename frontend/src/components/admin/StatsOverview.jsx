    // components/admin/StatsOverview.jsx
export const StatsOverview = ({ users, tours }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold">Total Users</h3>
          <p className="text-3xl">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold">Total Tours</h3>
          <p className="text-3xl">{tours.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold">Active Bookings</h3>
          <p className="text-3xl">0</p>
        </div>
      </div>
    )
  }