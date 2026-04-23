import { useState, useRef } from "react";
import {
  Building2, MapPin, Star, Thermometer, Upload,
  Plus, Trash2, Send, X, Image, IndianRupee, Hash
} from "lucide-react";

const DEFAULT_SHARINGS = [
  { shareType: "1 Share", monthlyPrice: 8000, dailyPrice: 400 },
  { shareType: "2 Share", monthlyPrice: 6000, dailyPrice: 300 },
  { shareType: "3 Share", monthlyPrice: 5000, dailyPrice: 250 },
  { shareType: "4 Share", monthlyPrice: 4500, dailyPrice: 200 },
];

const HOSTEL_TYPES = ["AC", "Non-AC", "Semi-AC"];

const Field = ({ label, icon: Icon, children, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-bold text-gray-300 flex items-center gap-1.5 tracking-wide">
      {Icon && <Icon size={13} className="text-emerald-400" />}
      {label} {required && <span className="text-emerald-400">*</span>}
    </label>
    {children}
  </div>
);

const inputClass = `w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white
  outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all
  placeholder:text-gray-500 font-medium`;

const CreateHostel = () => {
  const fileRef = useRef();

  const [form, setForm] = useState({
    categoryId: "", name: "", type: "AC", rating: "",
    latitude: "", longitude: "", address: "", monthlyAdvance: "",
  });
  const [sharings, setSharings] = useState(DEFAULT_SHARINGS);
  const [images,   setImages]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState(null);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const updateSharing = (i, k, v) =>
    setSharings((p) => p.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));
  const addSharing    = () => setSharings((p) => [...p, { shareType: "", monthlyPrice: "", dailyPrice: "" }]);
  const removeSharing = (i) => setSharings((p) => p.filter((_, idx) => idx !== i));
  const onImages      = (e) => {
    const files = Array.from(e.target.files);
    setImages((p) => [...p, ...files.map((f) => ({ file: f, url: URL.createObjectURL(f) }))]);
  };
  const removeImage = (i) => setImages((p) => p.filter((_, idx) => idx !== i));
  const showToast   = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const handleSubmit = async () => {
    if (!form.name || !form.categoryId || !form.address)
      return showToast("Please fill all required fields.", "error");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("sharings", JSON.stringify(sharings));
      images.forEach(({ file }) => fd.append("images", file));
      const res = await fetch("http://187.127.146.52:2003/api/Admin/createHostel", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      showToast("Hostel created successfully! 🎉");
      setForm({ categoryId: "", name: "", type: "AC", rating: "", latitude: "", longitude: "", address: "", monthlyAdvance: "" });
      setSharings(DEFAULT_SHARINGS);
      setImages([]);
    } catch (err) {
      showToast(err.message || "Something went wrong.", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm
          font-bold flex items-center gap-2 backdrop-blur-sm
          ${toast.type === "error"
            ? "bg-red-500/90 border border-red-400"
            : "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_8px_32px_rgba(16,185,129,0.3)]"
          }`}>
          {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="mb-7 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-white/10">
          <Building2 size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Hostel</h1>
          <p className="text-sm text-emerald-400 mt-0.5 font-medium">
            Fill in the details to list a new hostel property
          </p>
        </div>
      </div>

      <div className="space-y-5">

        {/* Basic Info */}
        <Section title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Hostel Name" icon={Building2} required>
              <input className={inputClass} placeholder="e.g. Ravi PG" value={form.name} onChange={set("name")} />
            </Field>
            <Field label="Category ID" icon={Hash} required>
              <input className={inputClass} placeholder="e.g. 69abca36655814c111cad824" value={form.categoryId} onChange={set("categoryId")} />
            </Field>
            <Field label="Type" icon={Thermometer} required>
              <select className={inputClass} value={form.type} onChange={set("type")}>
                {HOSTEL_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Rating" icon={Star}>
              <input className={inputClass} type="number" min="0" max="5" step="0.1" placeholder="e.g. 4.2" value={form.rating} onChange={set("rating")} />
            </Field>
            <Field label="Monthly Advance (₹)" icon={IndianRupee}>
              <input className={inputClass} type="number" placeholder="e.g. 1000" value={form.monthlyAdvance} onChange={set("monthlyAdvance")} />
            </Field>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location">
          <Field label="Full Address" icon={MapPin} required>
            <textarea className={`${inputClass} resize-none`} rows={2} placeholder="e.g. KPHB Hyderabad Kukatpally" value={form.address} onChange={set("address")} />
          </Field>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Field label="Latitude">
              <input className={inputClass} type="number" step="any" placeholder="e.g. 17.4948" value={form.latitude} onChange={set("latitude")} />
            </Field>
            <Field label="Longitude">
              <input className={inputClass} type="number" step="any" placeholder="e.g. 78.3996" value={form.longitude} onChange={set("longitude")} />
            </Field>
          </div>
        </Section>

        {/* Sharing Plans */}
        <Section title="Sharing Plans">
          <div className="space-y-3">
            <div className="hidden sm:grid grid-cols-12 gap-2 px-3 text-[11px] font-black text-emerald-400 uppercase tracking-widest">
              <div className="col-span-4">Share Type</div>
              <div className="col-span-3">Monthly (₹)</div>
              <div className="col-span-3">Daily (₹)</div>
              <div className="col-span-2" />
            </div>
            {sharings.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center bg-white/5 rounded-xl p-2 border border-white/10">
                <div className="col-span-12 sm:col-span-4">
                  <input className={`${inputClass} bg-white/10`} placeholder="e.g. 2 Share" value={s.shareType} onChange={(e) => updateSharing(i, "shareType", e.target.value)} />
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <input className={`${inputClass} bg-white/10`} type="number" placeholder="Monthly ₹" value={s.monthlyPrice} onChange={(e) => updateSharing(i, "monthlyPrice", +e.target.value)} />
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <input className={`${inputClass} bg-white/10`} type="number" placeholder="Daily ₹" value={s.dailyPrice} onChange={(e) => updateSharing(i, "dailyPrice", +e.target.value)} />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button onClick={() => removeSharing(i)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addSharing}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border-2
                border-dashed border-emerald-400/40 text-emerald-400 hover:bg-white/10 transition-colors"
            >
              <Plus size={15} /> Add Sharing Plan
            </button>
          </div>
        </Section>

        {/* Images */}
        <Section title="Hostel Images">
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={onImages} />
          <div
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-emerald-400/30 rounded-2xl p-8 flex flex-col items-center
              justify-center gap-3 cursor-pointer hover:bg-white/10 hover:border-emerald-400/60 transition-all"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] text-white 
              shadow-[0_4px_16px_rgba(0,0,0,0.35)] border border-white/10">
              <Upload size={22} />
            </div>
            <div className="text-center">
              <p className="font-bold text-white">Click to upload images</p>
              <p className="text-xs text-gray-500 mt-0.5">PNG, JPG, WEBP — multiple allowed</p>
            </div>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              {images.map((img, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-square
                  border border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                    transition-opacity flex items-center justify-center">
                    <button onClick={() => removeImage(i)} className="p-1.5 bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] rounded-full text-white border border-white/20">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-sm">
                    <Image size={10} /> {i + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Submit */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2.5 px-8 py-3 rounded-2xl text-white font-black text-sm
              bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_4px_24px_rgba(16,185,129,0.4)]
              hover:shadow-[0_8px_40px_rgba(16,185,129,0.5)] hover:scale-[1.02]
              active:scale-95 disabled:opacity-60 transition-all"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            ) : <Send size={16} />}
            {loading ? "Creating..." : "Create Hostel"}
          </button>
        </div>

      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden
    shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_32px_rgba(0,0,0,0.4)] transition-shadow">
    <div className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center gap-2">
      <h2 className="text-xs font-black text-white tracking-widest uppercase">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export default CreateHostel;