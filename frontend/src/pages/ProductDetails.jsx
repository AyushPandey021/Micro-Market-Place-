import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import FileUploader from "../components/FileUploader";

export default function ProductDetails({ user, showMessage, showError }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data);
    } catch (error) {
      showError("Product not found or could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await api.delete(`/products/${id}`);
      showMessage("Product deleted successfully.");
      navigate("/");
    } catch (error) {
      showError("Delete failed.");
    }
  };

  const handleFilesChange = (selectedFiles) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const isOwner = Boolean(
    user && product && (user.role === "admin" || product.seller === user.id),
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    showError("");
    showMessage("");

    if (!files.length) {
      showError("Select at least one image before uploading.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("Images", file));

    setSubmitting(true);
    try {
      await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showMessage("Images uploaded successfully!");
      setFiles([]);
      fetchProduct();
    } catch (error) {
      showError("Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <div className="relative mx-auto h-24 w-24 mb-12">
            <div className="absolute inset-0 h-full w-full animate-ping rounded-full bg-indigo-400/30" />
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-2xl flex items-center justify-center" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Loading...</h2>
          <p className="text-2xl text-slate-600">
            Product details coming right up
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mx-auto h-32 w-32 rounded-3xl bg-gradient-to-br from-slate-100 to-indigo-100 p-10 mb-12 shadow-xl flex items-center justify-center">
            <span className="text-6xl">❓</span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
            Product Not Found
          </h1>
          <p className="text-2xl text-slate-600 mb-12 leading-relaxed">
            The product you're looking for has vanished into the marketplace
            ether.
          </p>
          <Link
            to="/"
            className="btn-primary text-xl py-6 px-12 shadow-2xl inline-flex items-center gap-3 mx-auto"
          >
            <span>🏠</span>
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <header className="rounded-3xl border border-slate-200/50 bg-white/80 backdrop-blur-xl p-12 shadow-soft-lg">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="lg:flex-1">
              <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold mb-4">
                Product Showcase
              </p>
              <h1 className="text-5xl font-black text-slate-900 mb-6 leading-tight">
                {product.title}
              </h1>
              <p className="text-2xl text-slate-600 leading-relaxed max-w-3xl">
                {product.description || "No description provided."}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary text-lg py-4 px-8"
              >
                ← Back to Products
              </button>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="rounded-3xl bg-gradient-to-r from-rose-500 to-rose-600 px-8 py-4 text-lg font-bold text-white shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
                >
                  🗑️ Delete Product
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Main Content - Gallery & Stats */}
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="group rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-slate-50 p-10 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-4">
                  Price
                </div>
                <div className="text-4xl font-black text-slate-900">
                  {product.priceCurrency} {product.priceAmount}
                </div>
              </div>
              <div className="group rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-slate-50 p-10 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-4">
                  Seller
                </div>
                <div className="text-4xl font-black text-slate-900">
                  {product.sellerName || product.seller || "Unknown Seller"}
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600 text-2xl font-bold shadow-lg">
                  🖼️
                </span>
                Product Gallery
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {product.images && product.images.length > 0 ? (
                  product.images.map((image, index) => (
                    <div
                      key={image.fileId || image.url || index}
                      className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
                    >
                      <img
                        src={image.url}
                        alt={`${product.title} - image ${index + 1}`}
                        className="h-80 w-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                        <span className="text-white font-bold text-lg">
                          Image {index + 1}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-3xl border-2 border-dashed border-slate-300/50 bg-gradient-to-br from-slate-50 to-indigo-50 p-20 text-center shadow-inner hover:border-indigo-300 transition-all">
                    <div className="mx-auto mb-8 h-24 w-24 text-slate-400 bg-slate-100 rounded-3xl flex items-center justify-center shadow-lg">
                      <svg
                        className="h-12 w-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-700 mb-3">
                      No Images Available
                    </h3>
                    <p className="text-slate-500 text-lg">
                      Add images to showcase your amazing product
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div>
            <div className="sticky top-24 h-fit rounded-3xl border border-slate-200/50 bg-white/80 backdrop-blur-xl p-10 shadow-soft-lg">
              <div className="space-y-8">
                <div className="text-center mb-12 p-8 bg-gradient-to-r from-indigo-50 to-slate-50 rounded-3xl border border-indigo-200">
                  <h3 className="text-3xl font-black text-slate-900 mb-4 flex items-center justify-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600 font-bold shadow-lg">
                      👑
                    </span>
                    {isOwner ? "Your Product" : "Seller Actions"}
                  </h3>
                  {!isOwner ? (
                    <p className="text-xl text-slate-600 text-center">
                      Contact seller to ask questions or make offers
                    </p>
                  ) : (
                    <p className="text-lg text-slate-600">
                      Manage your product listing
                    </p>
                  )}
                </div>

                {isOwner ? (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 font-bold">
                          📤
                        </span>
                        Add More Images
                      </h4>
                      <p className="text-slate-600 mb-8">
                        Upload additional high-quality images to enhance your
                        listing. First image becomes cover photo.
                      </p>
                      <FileUploader
                        files={files}
                        onFilesChange={handleFilesChange}
                        onRemoveFile={removeFile}
                        label="Drag & drop images here or click to browse (JPG, PNG)"
                      />
                      <button
                        type="submit"
                        disabled={submitting || files.length === 0}
                        className="w-full mt-6 btn-primary py-5 text-lg flex items-center gap-3 shadow-xl"
                      >
                        {submitting ? (
                          <>
                            <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent" />
                            Uploading Images...
                          </>
                        ) : (
                          <>
                            <span>📤</span>
                            Upload {files.length > 0 &&
                              `(${files.length})`}{" "}
                            Images
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6 text-center py-12 border-2 border-dashed border-slate-300 bg-slate-50 rounded-3xl">
                    <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-500 text-3xl mb-6">
                      👤
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 mb-3">
                      Owner Only
                    </h4>
                    <p className="text-lg text-slate-600 mb-8">
                      Only the seller can upload more images or edit this
                      product.
                    </p>
                    <Link
                      to="/create"
                      className="btn-secondary text-lg py-4 px-8 shadow-lg inline-flex items-center gap-2"
                    >
                      <span>✨</span>
                      Create Your Own
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
