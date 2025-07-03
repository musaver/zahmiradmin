'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        setProducts(products.filter((product: any) => product.product.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const formatPrice = (price: string, productType?: string) => {
    const numPrice = parseFloat(price);
    if (productType === 'group' && numPrice === 0) {
      return 'From addons';
    }
    return `$${numPrice.toFixed(2)}`;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <Link 
            href="/products/add" 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add New Product
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Image</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">SKU</th>
              <th className="border p-2 text-left">Price</th>
              <th className="border p-2 text-left">Category</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Featured</th>
              <th className="border p-2 text-left">Created At</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((item: any) => {
                // Safely get the first image
                const firstImage = (() => {
                  try {
                    // Handle both string and array formats
                    let images = item.product.images;
                    
                    // If it's a string, try to parse it
                    if (typeof images === 'string') {
                      try {
                        images = JSON.parse(images);
                      } catch (e) {
                        console.error('Error parsing images JSON:', e);
                        return null;
                      }
                    }
                    
                    // Ensure we have an array
                    if (!Array.isArray(images)) {
                      console.error('Images is not an array:', images);
                      return null;
                    }
                    
                    // Get the first valid image URL
                    return images.find(img => typeof img === 'string' && img.trim() !== '') || null;
                  } catch (e) {
                    console.error('Error processing product images:', e);
                    return null;
                  }
                })();
                
                return (
                  <tr key={item.product.id}>
                    <td className="border p-2">
                      {firstImage ? (
                        <div className="relative w-16 h-16">
                          <img 
                            src={firstImage} 
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              console.error('Error loading image:', firstImage);
                              (e.target as HTMLImageElement).src = '/placeholder-product.svg';
                            }}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="border p-2">
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-gray-500">{item.product.slug}</div>
                    </td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.product.productType === 'variable' 
                          ? 'bg-purple-100 text-purple-800' 
                          : item.product.productType === 'group'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.product.productType === 'variable' 
                          ? 'Variable' 
                          : item.product.productType === 'group'
                          ? 'Group'
                          : 'Simple'}
                      </span>
                    </td>
                    <td className="border p-2 font-mono text-sm">{item.product.sku || 'N/A'}</td>
                    <td className="border p-2 font-semibold text-green-600">{formatPrice(item.product.price, item.product.productType)}</td>
                    <td className="border p-2">{item.category?.name || 'Uncategorized'}</td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.product.isFeatured 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.product.isFeatured ? 'Featured' : 'Normal'}
                      </span>
                    </td>
                    <td className="border p-2">{new Date(item.product.createdAt).toLocaleString()}</td>
                    <td className="border p-2">
                      <div className="flex gap-2">
                        <Link 
                          href={`/products/edit/${item.product.id}`}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          Edit
                        </Link>
                        {item.product.productType === 'variable' && (
                          <Link 
                            href={`/product-variants?productId=${item.product.id}`}
                            className="px-2 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                          >
                            Variants
                          </Link>
                        )}
                        {item.product.productType === 'group' && (
                          <Link 
                            href={`/product-addons?productId=${item.product.id}`}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            Addons
                          </Link>
                        )}
                        <button 
                          onClick={() => handleDelete(item.product.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="border p-2 text-center">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 