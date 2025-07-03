'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Carrier {
  id: string;
  name: string;
  code: string;
}

interface ServiceType {
  id: string;
  name: string;
  code: string;
  category?: string;
}

export default function AddShippingMethod() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    price: '',
    estimatedDays: '',
    isActive: true,
    sortOrder: 0,
    carrierId: '',
    serviceTypeId: '',
    // Keep legacy fields for backward compatibility
    carrierCode: '',
    serviceCode: '',
  });

  useEffect(() => {
    fetchCarriersAndServiceTypes();
  }, []);

  const fetchCarriersAndServiceTypes = async () => {
    try {
      const [carriersRes, serviceTypesRes] = await Promise.all([
        fetch('/api/shipping-carriers'),
        fetch('/api/shipping-service-types')
      ]);

      if (carriersRes.ok) {
        const carriersData = await carriersRes.json();
        setCarriers(carriersData.filter((c: Carrier & { isActive: boolean }) => c.isActive));
      }

      if (serviceTypesRes.ok) {
        const serviceTypesData = await serviceTypesRes.json();
        setServiceTypes(serviceTypesData.filter((st: ServiceType & { isActive: boolean }) => st.isActive));
      }
    } catch (error) {
      console.error('Error fetching carriers and service types:', error);
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
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/shipping-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create shipping method');
      }

      router.push('/shipping-methods');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add New Shipping Method</h1>
        <button
          onClick={() => router.push('/shipping-methods')}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          ← Back to Shipping Methods
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-lg p-6 max-w-2xl">
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
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="carrierId">
                  Carrier
                </label>
                <select
                  id="carrierId"
                  name="carrierId"
                  value={formData.carrierId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Carrier (Optional)</option>
                  {carriers.map(carrier => (
                    <option key={carrier.id} value={carrier.id}>
                      {carrier.name} ({carrier.code})
                    </option>
                  ))}
                </select>
                {carriers.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    No carriers available. <a href="/shipping-carriers/add" className="text-blue-600 hover:text-blue-800">Add a carrier first</a>
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="serviceTypeId">
                  Service Type
                </label>
                <select
                  id="serviceTypeId"
                  name="serviceTypeId"
                  value={formData.serviceTypeId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Service Type (Optional)</option>
                  {serviceTypes.map(serviceType => (
                    <option key={serviceType.id} value={serviceType.id}>
                      {serviceType.name} ({serviceType.code})
                      {serviceType.category && ` - ${serviceType.category}`}
                    </option>
                  ))}
                </select>
                {serviceTypes.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    No service types available. <a href="/shipping-service-types/add" className="text-blue-600 hover:text-blue-800">Add a service type first</a>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tip</h4>
              <p className="text-sm text-blue-800">
                Carriers and service types can be managed separately in their respective sections. 
                This allows for better organization and reusability across multiple shipping methods.
              </p>
              <div className="mt-2 space-x-2">
                <a href="/shipping-carriers" className="text-blue-600 hover:text-blue-800 text-sm">Manage Carriers</a>
                <span className="text-blue-400">•</span>
                <a href="/shipping-service-types" className="text-blue-600 hover:text-blue-800 text-sm">Manage Service Types</a>
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
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Shipping Method'}
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
  );
} 