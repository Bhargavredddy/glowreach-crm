'use client';

import { useEffect, useState } from 'react';
import { crmApi, Customer } from '@/lib/api';
import { 
  Search, 
  MapPin, 
  User, 
  Calendar, 
  ShoppingBag, 
  X, 
  Filter, 
  FileText 
} from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters State
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  
  // Selection State (for details drawer)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Available unique values for filters
  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Kochi"];
  const genders = ["Female", "Male", "Other"];

  const fetchCustomers = () => {
    setLoading(true);
    crmApi.getCustomers({
      search: search || undefined,
      gender: gender || undefined,
      city: city || undefined
    })
      .then(res => {
        setCustomers(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching customers:', err);
        setLoading(false);
      });
  };

  // Trigger search on parameter change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300); // Debounce search input
    return () => clearTimeout(timer);
  }, [search, gender, city]);

  return (
    <div className="space-y-8 relative min-h-[85vh]">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-slate-100">Customer Database</h1>
        <p className="text-slate-400 mt-1 text-sm font-medium">
          Search, filter, and view purchasing histories for customers in your CRM.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm placeholder:text-slate-500 text-slate-100 focus:outline-none focus:border-brand-500/80 transition-colors"
          />
        </div>

        {/* Gender Filter */}
        <div className="relative w-full md:w-48">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-brand-500/80 transition-colors appearance-none cursor-pointer"
          >
            <option value="">All Genders</option>
            {genders.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <Filter className="absolute right-4 top-4.5 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* City Filter */}
        <div className="relative w-full md:w-52">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-brand-500/80 transition-colors appearance-none cursor-pointer"
          >
            <option value="">All Cities</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Filter className="absolute right-4 top-4.5 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Reset */}
        {(search || gender || city) && (
          <button
            onClick={() => { setSearch(''); setGender(''); setCity(''); }}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Customers Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-xs">Querying database...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-20 text-center space-y-2">
            <User className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-slate-300 font-medium">No customers found</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">Try refining your search text or removing filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4.5">Name</th>
                  <th className="px-6 py-4.5">Email</th>
                  <th className="px-6 py-4.5">City</th>
                  <th className="px-6 py-4.5">Gender</th>
                  <th className="px-6 py-4.5 text-center">Orders</th>
                  <th className="px-6 py-4.5 text-right">Total Spent</th>
                  <th className="px-6 py-4.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {customers.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-slate-900/30 transition-colors cursor-pointer group"
                    onClick={() => setSelectedCustomer(c)}
                  >
                    <td className="px-6 py-4.5 font-medium text-slate-200 group-hover:text-brand-400 transition-colors">
                      {c.name}
                    </td>
                    <td className="px-6 py-4.5 text-slate-400 font-mono text-xs">{c.email}</td>
                    <td className="px-6 py-4.5 text-slate-400">{c.city}</td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.gender === 'Female' ? 'bg-pink-500/10 text-pink-400' :
                        c.gender === 'Male' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {c.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center text-slate-300 font-semibold">{c.ordersCount}</td>
                    <td className="px-6 py-4.5 text-right text-slate-200 font-semibold">
                      ₹{c.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); }}
                        className="text-xs font-semibold text-brand-400 hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details Slide-over Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300">
          <div className="w-full max-w-xl h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col p-6 space-y-6 relative animate-slide-in">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Summary */}
            <div className="space-y-4 pt-4 border-b border-slate-800 pb-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center font-display font-bold text-lg text-white">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-slate-100">{selectedCustomer.name}</h2>
                  <p className="text-slate-400 text-xs font-mono">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                <div className="flex items-center space-x-2 text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>City: <strong>{selectedCustomer.city}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Joined: <strong>{new Date(selectedCustomer.joinDate).toLocaleDateString()}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <ShoppingBag className="w-4 h-4 text-slate-500" />
                  <span>Orders: <strong>{selectedCustomer.ordersCount}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Spent: <strong>₹{selectedCustomer.totalSpent.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-400 mb-3.5">
                Purchase History
              </h3>
              <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900/20 divide-y divide-slate-800/40">
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                  selectedCustomer.orders.map((o) => (
                    <div key={o.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-900/20 transition-colors">
                      <div className="space-y-1 max-w-[70%]">
                        <p className="font-semibold text-slate-200 truncate">{o.product?.name || 'Unnamed Product'}</p>
                        <div className="flex items-center space-x-2 text-slate-400 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 font-semibold">{o.category}</span>
                          <span>{o.product?.brand || 'Brand'}</span>
                          <span>•</span>
                          <span>{new Date(o.purchaseDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-bold text-slate-200">
                          ₹{o.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-500 text-xs">
                    No purchase transactions recorded.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
