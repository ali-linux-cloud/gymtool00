import React from 'react';
import { Calendar, Clock, Pencil, Trash2 } from 'lucide-react';
import type { User } from '../../types/auth';

export default function ActiveSubscriptions() {
  const [users, setUsers] = React.useState<User[]>(() => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    return allUsers.filter(user => 
      user.isVerified && 
      user.subscriptionStatus === 'active' &&
      user.email !== 'admin@saasfactory.com'
    ).map(user => ({
      ...user,
      planType: user.planType || 'monthly'
    }));
  });

  const calculateDaysLeft = (endDate: string | undefined) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleDelete = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);

    // Update localStorage
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = allUsers.filter((user: User) => user.id !== userId);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
  };

  const handleEdit = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newPlan = prompt('Enter new plan type (monthly/yearly/lifetime):', user.planType);
    if (!newPlan || !['monthly', 'yearly', 'lifetime'].includes(newPlan)) return;

    const startDate = new Date();
    let durationInDays = 30;
    
    switch (newPlan) {
      case 'yearly':
        durationInDays = 365;
        break;
      case 'lifetime':
        durationInDays = 36500;
        break;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationInDays);

    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          planType: newPlan as 'monthly' | 'yearly' | 'lifetime',
          subscriptionStartDate: startDate.toISOString(),
          subscriptionEndDate: endDate.toISOString()
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    // Update localStorage
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedAllUsers = allUsers.map((u: User) => {
      if (u.id === userId) {
        return {
          ...u,
          planType: newPlan,
          subscriptionStartDate: startDate.toISOString(),
          subscriptionEndDate: endDate.toISOString()
        };
      }
      return u;
    });
    localStorage.setItem('users', JSON.stringify(updatedAllUsers));
  };

  if (users.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">No active subscriptions</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid gap-6">
        {users.map((user) => {
          const daysLeft = calculateDaysLeft(user.subscriptionEndDate);
          
          return (
            <div
              key={user.id}
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                  <p className="text-gray-400">{user.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  daysLeft > 7
                    ? 'bg-green-900/50 text-green-200 border border-green-700'
                    : 'bg-yellow-900/50 text-yellow-200 border border-yellow-700'
                }`}>
                  {daysLeft} days left
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                {user.subscriptionStartDate && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span>Started: {new Date(user.subscriptionStartDate).toLocaleDateString()}</span>
                  </div>
                )}
                {user.subscriptionEndDate && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>Ends: {new Date(user.subscriptionEndDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Plan:</span>
                  <span className="text-sm font-medium text-blue-400">
                    {user.planType.charAt(0).toUpperCase() + user.planType.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user.id)}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}