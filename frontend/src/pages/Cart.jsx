import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Cart({ user }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const [addressErrors, setAddressErrors] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/cart");
      setCart(response.data.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      setUpdating(true);
      await api.patch(`/cart/items/${productId}`, { quantity });
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      setUpdating(true);
      await api.delete(`/cart/items/${productId}`);
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    try {
      setUpdating(true);
      await api.delete("/cart");
      setCart(null);
    } catch (error) {
      console.error("Error clearing cart:", error);
    } finally {
      setUpdating(false);
    }
  };

  const validateAddress = () => {
    const errors = {};
    if (!address.street.trim()) errors.street = "Street is required";
    if (!address.city.trim()) errors.city = "City is required";
    if (!address.state.trim()) errors.state = "State is required";
    if (!address.country.trim()) errors.country = "Country is required";
    if (!address.zipCode.trim()) errors.zipCode = "Zip code is required";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createOrder = async () => {
    if (!validateAddress()) return;
    try {
      setPlacingOrder(true);
      const response = await api.post("/orders", { shippingAddress: address });
      alert(`Order created successfully! Order ID: ${response.data.data.orderId}`);
      setCart(null);
      setAddress({
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      });
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-6">Add some products to get started!</p>
        <Link
          to="/"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Cart Items */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Cart Items ({cart.items.length})
            </h2>
            <button
              onClick={clearCart}
              disabled={updating}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.name || `Product ${item.productId.slice(-8)}`}
                    </h3>
                    <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    disabled={updating}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, parseInt(e.target.value))
                      }
                      disabled={updating}
                      className="border border-gray-300 px-2 py-1 w-16 rounded disabled:opacity-50"
                    />
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address + Total */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Street Address"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                className={`w-full border px-3 py-2 rounded ${
                  addressErrors.street
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {addressErrors.street && (
                <p className="text-red-500 text-sm mt-1">
                  {addressErrors.street}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded ${
                    addressErrors.city
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {addressErrors.city && (
                  <p className="text-red-500 text-sm mt-1">
                    {addressErrors.city}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={(e) =>
                    setAddress({ ...address, state: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded ${
                    addressErrors.state
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {addressErrors.state && (
                  <p className="text-red-500 text-sm mt-1">
                    {addressErrors.state}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Country"
                  value={address.country}
                  onChange={(e) =>
                    setAddress({ ...address, country: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded ${
                    addressErrors.country
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {addressErrors.country && (
                  <p className="text-red-500 text-sm mt-1">
                    {addressErrors.country}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={address.zipCode}
                  onChange={(e) =>
                    setAddress({ ...address, zipCode: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded ${
                    addressErrors.zipCode
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {addressErrors.zipCode && (
                  <p className="text-red-500 text-sm mt-1">
                    {addressErrors.zipCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>

            <button
              onClick={createOrder}
              disabled={placingOrder}
              className="bg-green-500 text-white px-6 py-3 rounded-lg w-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {placingOrder ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Placing Order...
                </div>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
