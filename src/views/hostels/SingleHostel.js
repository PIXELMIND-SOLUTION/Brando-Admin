import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Building2, Eye, Calendar, MapPin, Star, IndianRupee,
  Users, Image as ImageIcon, Thermometer, ChevronLeft,
  Home, Clock, QrCode, User, Shield, Link, Wind, Snowflake,
  ChevronRight, X, ZoomIn, Wifi, Car, Coffee, Dumbbell,
  Sparkles, Layers, List, CheckCircle, AlertCircle, Phone, Mail
} from "lucide-react";
import { CiDiscount1 } from "react-icons/ci";
import { MdDiscount } from "react-icons/md";

const API = "https://api.brando.org.in/api/Admin";

const showAlert = (icon, title, text) =>
  Swal.fire({
    icon, title, text,
    background: "#0f172a",
    color: "#fff",
    customClass: {
      popup: "rounded-2xl",
      title: "text-lg font-bold",
      confirmButton:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold border-none",
    },
  });

/* ─── Image Lightbox Modal ─────────────────────────────────────────── */
const ImageModal = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.95)" }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.05)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white font-semibold text-sm">
          {current + 1} / {images.length}
        </span>
        <div className="flex items-center gap-3">
          <a
            href={images[current]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <ZoomIn size={14} /> Open Full
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main image */}
      <div
        className="flex-1 flex items-center justify-center relative min-h-0 px-14 sm:px-20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={prev}
          className="absolute left-2 sm:left-4 p-2 sm:p-3 rounded-full text-white transition-all hover:scale-110 z-10"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <ChevronLeft size={22} />
        </button>

        <img
          key={current}
          src={images[current]}
          alt={`Image ${current + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg select-none"
          style={{ maxHeight: "calc(100vh - 180px)", animation: "fadeIn 0.2s ease" }}
          draggable={false}
        />

        <button
          onClick={next}
          className="absolute right-2 sm:right-4 p-2 sm:p-3 rounded-full text-white transition-all hover:scale-110 z-10"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div
        className="flex-shrink-0 py-3 px-4 overflow-x-auto"
        style={{ background: "rgba(255,255,255,0.04)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-2 justify-center min-w-min">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`flex-shrink-0 w-14 h-10 sm:w-16 sm:h-12 rounded-md overflow-hidden border-2 transition-all ${idx === current
                ? "border-emerald-400 opacity-100 scale-105"
                : "border-transparent opacity-50 hover:opacity-80"
                }`}
            >
              <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
};

/* ─── Info Card Component ─────────────────────────────────────────── */
const InfoCard = ({ title, icon: Icon, children, gradient = "from-emerald-500 to-emerald-600" }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
    <div className={`px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r ${gradient}`}>
      <h2 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
        <Icon size={14} /> {title}
      </h2>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

/* ─── Feature Badge Component ─────────────────────────────────────── */
const FeatureBadge = ({ feature }) => {
  const getIcon = () => {
    switch (feature.toLowerCase()) {
      case "wifi": return <Wifi size={14} />;
      case "parking": return <Car size={14} />;
      case "breakfast": return <Coffee size={14} />;
      case "gym": return <Dumbbell size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium text-gray-300">
      {getIcon()}
      {feature}
    </span>
  );
};

/* ─── Main Component ───────────────────────────────────────────────── */
const SingleHostel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomType, setRoomType] = useState("AC");
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  const fetchHostel = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${API}/hostel/${id}`);
      setHostel(data.hostel);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch hostel details");
      showAlert("error", "Failed", "Could not fetch hostel details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHostel(); }, [id]);

  const openLightbox = (index) => setLightbox({ open: true, index });
  const closeLightbox = () => setLightbox({ open: false, index: 0 });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const getCoordinates = (h) => {
    if (h.latitude != null && h.longitude != null) return { lat: h.latitude, lng: h.longitude };
    if (h.location?.coordinates) return { lat: h.location.coordinates[1], lng: h.location.coordinates[0] };
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Loading hostel details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hostel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <Building2 size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400 font-medium">{error || "Hostel not found"}</p>
            <button onClick={() => navigate("/dashboard/hostels")}
              className="mt-4 text-emerald-400 hover:text-emerald-300 font-semibold">
              Back to Hostels
            </button>
          </div>
        </div>
      </div>
    );
  }

  const coords = getCoordinates(hostel);
  const images = hostel.images || [];
  const allSharings = hostel.sharings || [];
  const filteredSharings = allSharings.filter((s) => s.type === roomType);
  const hasAC = allSharings.some((s) => s.type === "AC");
  const hasNonAC = allSharings.some((s) => s.type === "Non-AC");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">

        {lightbox.open && images.length > 0 && (
          <ImageModal images={images} startIndex={lightbox.index} onClose={closeLightbox} />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-400" />
            </button>

            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl 
              bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] 
              text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-white/10">
              <Building2 size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {hostel.name}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-400 font-medium">
                {hostel.category?.name ? `${hostel.category.name} • ` : ""}
                ID: {hostel._id.slice(-8)}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => navigate(`/dashboard/hostel/users/${hostel._id}`)}
              className="flex items-center gap-2 px-4 py-2 
                bg-gradient-to-r from-emerald-500 to-emerald-600 
                text-white text-sm font-semibold rounded-xl 
                hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <Users size={16} />
              View Users
            </button>
          </div>
        </div>

        {/* Room Type Toggle */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setRoomType("AC")}
            disabled={!hasAC}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${roomType === "AC"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
          >
            <Snowflake size={16} />
            AC Rooms
            {hasAC && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${roomType === "AC" ? "bg-white/20" : "bg-white/10"}`}>
                {allSharings.filter(s => s.type === "AC").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setRoomType("Non-AC")}
            disabled={!hasNonAC}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${roomType === "Non-AC"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
          >
            <Wind size={16} />
            Non-AC Rooms
            {hasNonAC && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${roomType === "Non-AC" ? "bg-white/20" : "bg-white/10"}`}>
                {allSharings.filter(s => s.type === "Non-AC").length}
              </span>
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">

            {/* Images Gallery */}
            <InfoCard title="GALLERY" icon={ImageIcon}>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-lg overflow-hidden border border-white/10 aspect-video cursor-pointer"
                      onClick={() => openLightbox(idx)}
                    >
                      <img
                        src={img}
                        alt={`${hostel.name} ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye size={24} className="text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon size={48} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400 text-sm">No images available</p>
                </div>
              )}
            </InfoCard>

            {/* Sharing Plans */}
            <InfoCard title={`${roomType} SHARING PLANS`} icon={Users}>
              {filteredSharings.length > 0 ? (
                <div className="grid gap-3">
                  {filteredSharings.map((sharing, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-4 p-4 bg-white/10 rounded-xl border border-white/10 hover:bg-white/15 transition-colors"
                    >
                      {/* Top */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Left */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] flex items-center justify-center text-white font-bold text-lg border border-white/20">
                            {idx + 1}
                          </div>

                          <div>
                            <p className="font-bold text-white">
                              {sharing.shareType}
                            </p>

                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-1 ${sharing.type === "AC"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-orange-500/20 text-orange-300"
                                  }`}
                              >
                                {sharing.type === "AC" ? (
                                  <>
                                    <Snowflake size={10} /> AC
                                  </>
                                ) : (
                                  <>
                                    <Wind size={10} /> Non-AC
                                  </>
                                )}
                              </span>

                              <p className="text-xs text-gray-400">
                                Monthly / Daily
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-left sm:text-right">
                          <p className="font-black text-white text-lg">
                            {formatCurrency(sharing.monthlyPrice)}
                          </p>

                          <p className="text-xs text-gray-400">
                            {formatCurrency(sharing.dailyPrice)}/day
                          </p>
                        </div>
                      </div>

                      {/* Room Numbers */}
                      {sharing.roomNumbers?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2 font-medium">
                            Room Numbers
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {sharing.roomNumbers.map((room, roomIdx) => (
                              <button
                                key={roomIdx}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-sm font-semibold hover:scale-105 hover:bg-emerald-500/30 transition-all"
                              >
                                Room {room}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Thermometer size={36} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400 font-medium">No {roomType} rooms available</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Try switching to {roomType === "AC" ? "Non-AC" : "AC"} rooms
                  </p>
                </div>
              )}
            </InfoCard>

            {/* Features & Amenities */}
            {hostel.features && hostel.features.length > 0 && (
              <InfoCard title="FEATURES & AMENITIES" icon={Sparkles}>
                <div className="flex flex-wrap gap-2">
                  {hostel.features.map((feature, idx) => (
                    <FeatureBadge key={idx} feature={feature} />
                  ))}
                </div>
              </InfoCard>
            )}

            {/* Furnishing Details */}
            {hostel.furnishing && (
              <InfoCard title="FURNISHING" icon={Layers} gradient="from-purple-500 to-purple-600">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/10">
                    <Home size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Furnishing Status</p>
                    <p className="text-lg font-bold text-white">{hostel.furnishing}</p>
                  </div>
                </div>
              </InfoCard>
            )}

            {/* QR Code Section */}
            {(hostel.qrCode || hostel.qrUrl) && (
              <InfoCard title="QR CODE" icon={QrCode} gradient="from-indigo-500 to-indigo-600">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {hostel.qrCode && (
                    <div className="p-3 bg-white rounded-xl shadow-lg flex-shrink-0">
                      <img src={hostel.qrCode} alt="Hostel QR Code" className="w-32 h-32 sm:w-40 sm:h-40 object-contain" />
                    </div>
                  )}
                  <div className="space-y-3 w-full">
                    <p className="text-sm text-gray-300">Scan to view hostel details directly on mobile.</p>
                    {hostel.qrUrl && (
                      <div className="p-3 bg-white/10 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Link size={12} /> QR URL</p>
                        <a href={hostel.qrUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-emerald-400 hover:text-emerald-300 break-all underline underline-offset-2">
                          {hostel.qrUrl}
                        </a>
                      </div>
                    )}
                    {hostel.qrCode && (
                      <a href={hostel.qrCode} download={`${hostel.name}-qr.png`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg text-sm font-medium text-white hover:shadow-lg transition-all">
                        <QrCode size={14} /> Download QR
                      </a>
                    )}
                  </div>
                </div>
              </InfoCard>
            )}
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">

            {/* Property Details */}
            <InfoCard title="PROPERTY DETAILS" icon={Home}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {hostel.category?.name && (
                    <div className="p-3 bg-white/10 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Category</p>
                      <div className="flex items-center gap-2">
                        {hostel.category.image && (
                          <img src={hostel.category.image} alt={hostel.category.name} className="w-6 h-6 rounded object-cover" />
                        )}
                        <p className="font-semibold text-white text-sm">{hostel.category.name}</p>
                      </div>
                    </div>
                  )}
                  <div className="p-3 bg-white/10 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-white">{hostel.rating}</span>
                      <span className="text-xs text-gray-400">/5</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <MapPin size={12} /> Address
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">{hostel.address}</p>
                </div>

                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <MdDiscount size={12} /> Discount
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">₹ {hostel.discount}/-</p>
                </div>

                <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/20">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <IndianRupee size={12} /> Monthly Advance
                  </p>
                  <p className="text-xl font-black text-emerald-400">{formatCurrency(hostel.monthlyAdvance)}</p>
                  <p className="text-xs text-gray-500 mt-1">Refundable security deposit</p>
                </div>

                {coords && (
                  <div className="p-3 bg-white/10 rounded-lg">
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                      <MapPin size={12} /> Location Coordinates
                    </p>
                    <p className="text-xs text-gray-300 font-mono">
                      Lat: {coords.lat.toFixed(6)}<br />
                      Lng: {coords.lng.toFixed(6)}
                    </p>
                    <a href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
                      <MapPin size={14} /> View on Google Maps
                    </a>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Ownership Information */}
            <InfoCard title="OWNERSHIP" icon={User} gradient="from-blue-500 to-blue-600">
              <div className="space-y-3">
                {hostel.vendorId && (
                  <div className="p-3 bg-white/10 rounded-lg">
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                      <User size={12} /> Vendor Information
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">{hostel.vendorId.name || 'N/A'}</p>
                      {hostel.vendorId.mobileNumber && (
                        <p className="text-xs text-gray-300 flex items-center gap-1">
                          <Phone size={10} /> {hostel.vendorId.mobileNumber}
                        </p>
                      )}
                      {hostel.vendorId.email && (
                        <p className="text-xs text-gray-300 flex items-center gap-1 break-all">
                          <Mail size={10} /> {hostel.vendorId.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <Shield size={12} /> Admin ID
                  </p>
                  <p className="text-sm font-mono text-gray-300 break-all">
                    {hostel.adminId ? (
                      typeof hostel.adminId === 'object' ? hostel.adminId._id : hostel.adminId
                    ) : (
                      <span className="text-gray-500 italic">Not assigned</span>
                    )}
                  </p>
                </div>

                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Hostel ID</p>
                  <p className="text-xs font-mono text-gray-300 break-all">{hostel._id}</p>
                </div>
              </div>
            </InfoCard>

            {/* Timeline */}
            <InfoCard title="TIMELINE" icon={Clock} gradient="from-orange-500 to-orange-600">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
                  <Calendar size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Created</p>
                    <p className="text-sm font-medium text-white">{formatDate(hostel.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
                  <Calendar size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Last Updated</p>
                    <p className="text-sm font-medium text-white">{formatDate(hostel.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-5 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                Quick Actions
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => images.length > 0 && openLightbox(0)}
                  disabled={!images.length}
                  className="flex-1 px-4 py-2.5 bg-white/10 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Eye size={14} className="inline mr-2" />
                  View Images
                </button>
                <button
                  onClick={() => navigate("/dashboard/hostels")}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg text-sm font-medium text-white hover:shadow-lg transition-all"
                >
                  <List size={14} className="inline mr-2" />
                  Back to List
                </button>
              </div>
            </div>

            {/* Status Badge */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <p className="text-xs text-emerald-400 font-semibold">ACTIVE HOSTEL</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                This hostel is currently active and accepting bookings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleHostel;