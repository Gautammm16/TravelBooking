// services/adminService.js
export const updateUserRole = async (userId, newRole) => {
    const response = await fetch(`/api/v1/users/${userId}/role`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ role: newRole })
    })
    return response.json()
  }