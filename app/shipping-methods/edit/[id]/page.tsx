'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  description?: string;
  price: string;
  estimatedDays?: number;
  isActive: boolean;
  sortOrder: number;
  carrierCode?: string;
  serviceCode?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditShippingMethod() {
  const router = useRouter();
  const params = useParams();
  const methodId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    price: '',
    estimatedDays: '',
    isActive: true,
    sortOrder: 0,
    carrierCode: '',
    serviceCode: '',
  });

  useEffect(() => {
    fetchShippingMethod();
  }, [methodId]);

  const fetchShippingMethod = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/shipping-methods/${methodId}`);
      if (!response.ok) {
        throw new Error('Shipping method not found');
      }
      
      const data = await response.json();
      setShippingMethod(data);
      setFormData({
        name: data.name,
        code: data.code,
        description: data.description || '',
        price: data.price,
        estimatedDays: data.estimatedDays?.toString() || '',
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        carrierCode: data.carrierCode || '',
        serviceCode: data.serviceCode || '',
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/shipping-methods/${methodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update shipping method');
      }

      router.push('/shipping-methods');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this shipping method? This action cannot be undone and may affect existing orders.')) {
      return;
    }

    try {
      const response = await fetch(`/api/shipping-methods/${methodId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete shipping method');
      }

      router.push('/shipping-methods');
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading shipping method...</div>;
  if (error && !shippingMethod) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!shippingMethod) return <div className="p-8 text-center">Shipping method not found</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Shipping Method</h1>
          <p className="text-gray-600">Modify shipping method details</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🗑️ Delete Method
          </button>
          <button
            onClick={() => router.push('/shipping-methods')}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            ← Back to Shipping Methods
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                      Method Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Standard Ground Shipping"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="code">
                      Method Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., standard-ground"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Unique identifier for this shipping method
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Optional description of this shipping method"
                  />
                </div>
              </div>

              {/* Pricing & Delivery */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Pricing & Delivery</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="price">
                      Shipping Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">$</span>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="estimatedDays">
                      Estimated Delivery Days
                    </label>
                    <input
                      type="number"
                      id="estimatedDays"
                      name="estimatedDays"
                      value={formData.estimatedDays}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      placeholder="e.g., 5"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty if delivery time varies
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="sortOrder">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      id="sortOrder"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>
              </div>

              {/* Carrier Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Carrier Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="carrierCode">
                      Carrier
                    </label>
                    <select
                      id="carrierCode"
                      name="carrierCode"
                      value={formData.carrierCode}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Carrier (Optional)</option>
                      <option value="ups">UPS</option>
                      <option value="fedex">FedEx</option>
                      <option value="usps">USPS</option>
                      <option value="dhl">DHL</option>
                      <option value="custom">Custom/Local Delivery</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="serviceCode">
                      Service Type
                    </label>
                    <select
                      id="serviceCode"
                      name="serviceCode"
                      value={formData.serviceCode}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Service (Optional)</option>
                      <option value="ground">Ground</option>
                      <option value="express">Express</option>
                      <option value="overnight">Overnight</option>
                      <option value="2day">2-Day</option>
                      <option value="standard">Standard</option>
                      <option value="expedited">Expedited</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Status</h3>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active shipping method
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Only active shipping methods will be available for customers to select during checkout
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Updating...' : 'Update Shipping Method'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/shipping-methods')}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Shipping Method Info</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Method ID:</span>
                <div className="font-mono text-xs text-gray-800 break-all">{shippingMethod.id}</div>
              </div>
              
              <div>
                <span className="text-gray-600">Created:</span>
                <div>{new Date(shippingMethod.createdAt).toLocaleDateString()}</div>
              </div>
              
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <div>{new Date(shippingMethod.updatedAt).toLocaleDateString()}</div>
              </div>
              
              <div>
                <span className="text-gray-600">Current Status:</span>
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    shippingMethod.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {shippingMethod.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-gray-600">Current Price:</span>
                <div className="font-semibold">${parseFloat(shippingMethod.price).toFixed(2)}</div>
              </div>
              
              {shippingMethod.estimatedDays && (
                <div>
                  <span className="text-gray-600">Delivery Time:</span>
                  <div>{shippingMethod.estimatedDays} days</div>
                </div>
              )}
              
              {shippingMethod.carrierCode && (
                <div>
                  <span className="text-gray-600">Carrier:</span>
                  <div className="uppercase">{shippingMethod.carrierCode}</div>
                </div>
              )}
              
              {shippingMethod.serviceCode && (
                <div>
                  <span className="text-gray-600">Service:</span>
                  <div className="capitalize">{shippingMethod.serviceCode}</div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 rounded hover:bg-gray-100"
                >
                  {formData.isActive ? '🔴 Deactivate Method' : '🟢 Activate Method'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
                >
                  🗑️ Delete Method
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 