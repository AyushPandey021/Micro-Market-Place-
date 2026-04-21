import { useState, useCallback } from "react";
import {
  processQuery,
  searchProducts,
  addToCart,
  createCart,
  getCart,
} from "../services/aiBuddyApi";
import ProductCard from "../components/ProductCard";
import AlertBar from "../components/AlertBar";

export default function AIBuddy({ user }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const token = user?.token;

  const resetForm = useCallback(() => {
    setQuery("");
    setResponse("");
    setProducts([]);
    setError("");
    setCartMessage("");
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!query.trim() || loading) return;

      setLoading(true);
      setError("");

      try {
        const aiResponse = await processQuery(query.trim(), token);

        // Handle structured response
        setResponse(aiResponse.message);

        if (aiResponse.intent === "search" && aiResponse.tool_call.name) {
          // Execute tool
          const toolResult = await searchProducts(
            aiResponse.tool_call.arguments,
            token,
          );
          setProducts(toolResult.data || toolResult.products || []);
        } else if (
          aiResponse.intent === "add_to_cart" &&
          aiResponse.tool_call.name
        ) {
          // For demo, add first product or ask for product_id
          setCartMessage("Added to cart! (Demo)");
        } else if (aiResponse.intent === "create_cart") {
          const cartResult = await createCart(token);
          setCartMessage(cartResult.message || "Cart created!");
        }

        // Show error if clarification
        if (aiResponse.intent === "clarification") {
          setError(aiResponse.message);
        }
      } catch (err) {
        console.error("AI Buddy error:", err);
        setError("Failed to connect to AI Buddy. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [query, token],
  );

  const handleAddFirstProduct = useCallback(async () => {
    if (products.length === 0 || !token) {
      setError("No products available or login required.");
      return;
    }

    const firstProduct = products[0];
    setLoading(true);

    try {
      const result = await addSingleProductToCart(
        firstProduct._id || firstProduct.id,
        1,
        token,
      );
      if (result.success) {
        setCartMessage(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [products, token]);

  const handleRetry = useCallback(() => {
    handleSubmit({ preventDefault: () => {} });
  }, [handleSubmit]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          🤖 AI Shopping Buddy
        </h1>
        <p className="text-xl text-gray-600">
          Ask me anything about products! e.g. "Show me red shoes under 2000"
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "🤔 Thinking..." : "Ask AI"}
          </button>
        </div>
        {token ? (
          <button
            type="button"
            onClick={handleAddFirstProduct}
            disabled={loading || products.length === 0}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
          >
            🛒 Add First Product to Cart
          </button>
        ) : (
          <p className="text-sm text-gray-500 text-center">
            💡 Login to add products to cart
          </p>
        )}
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
          <p className="text-red-800 font-medium">❌ {error}</p>
          <button
            onClick={handleRetry}
            disabled={loading}
            className="text-sm text-red-600 hover:text-red-700 font-medium underline"
          >
            Try Again
          </button>
        </div>
      )}

      {cartMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-800 font-medium">✅ {cartMessage}</p>
        </div>
      )}

      {response && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 mb-4">
            <p className="text-gray-800 leading-relaxed">{response}</p>
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recommended Products:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {query && (
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={resetForm}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Clear Chat
          </button>
        </div>
      )}
    </div>
  );
}
