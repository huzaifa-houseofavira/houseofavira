'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { uploadSingleImage, deleteImageFromCloudinary } from '@/app/actions/uploadActions';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { generateUniqueSlug } from '@/lib/slugify';
import {
  UploadCloud, X, Image as ImageIcon, Tag, Loader2,
  CheckCircle2, Plus, Trash2, GripVertical, Crop,
  Zap, RotateCcw, AlertCircle
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const CATEGORY_DATA = [
  {
    title: "Women",
    children: ["tops", "pants / jeans", "skirts", "dresses", "jackets", "beach wear", "co-ords", "t-shirts", "denim", "activewear", "homewear"]
  },
  {
    title: "Men",
    children: ["tops", "pants/jeans", "jackets"]
  },
  {
    title: "Footwear",
    children: ["heels", "boots", "shoes", "flats"]
  },
  {
    title: "Bags",
    children: ["Handbags", "mini bags", "shoulder Bags"]
  },
  {
    title: "Accessories",
    children: ["phone cases", "hair accessories / wigs", "belts / caps", "jewelry / watches", "nails and nail art supplies", "keychains / bag charms", "room decor"]
  },
  {
    title: "Collectibles",
    children: ["Sanrio", "Nagano Characters", "Miffy", "Other Characters"]
  },
  {
    title: "Pets",
    children: ["cats", "dogs"]
  }
];

const DRAFT_KEY = 'admin_product_draft';

/* ─────────────────────────────────────────────
   Utility: canvas crop helper
───────────────────────────────────────────── */
async function getCroppedBlob(imageSrc, pixelCrop) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.92);
  });
}

/* ─────────────────────────────────────────────
   Crop Modal Component
───────────────────────────────────────────── */
function CropModal({ imageSrc, fileName, onApply, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [applying, setApplying] = useState(false);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setApplying(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      const croppedFile = new File([blob], fileName.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
      const previewUrl = URL.createObjectURL(blob);
      onApply(croppedFile, previewUrl);
    } catch (e) {
      console.error('Crop failed:', e);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#d2d2d7]">
          <div>
            <h3 className="text-base font-semibold text-black flex items-center gap-2">
              <Crop className="w-4 h-4 text-[#0071e3]" /> Adjust Crop
            </h3>
            <p className="text-xs text-[#86868b] mt-0.5">Drag to reposition · Pinch or scroll to zoom</p>
          </div>
          <button onClick={onCancel} className="text-[#86868b] hover:text-black transition-colors p-1 rounded-lg hover:bg-[#F5F5F7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative bg-[#1a1a1a]" style={{ height: 380 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={3 / 4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: { border: '2px solid #0071e3', boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-5 py-3 border-b border-[#d2d2d7] bg-[#F5F5F7]">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#86868b] shrink-0">Zoom</span>
            <input
              type="range"
              min={1} max={3} step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[#0071e3] h-1"
            />
            <span className="text-xs text-[#86868b] w-10 text-right">{zoom.toFixed(1)}×</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm font-medium text-black hover:bg-[#F5F5F7] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={applying}
            className="flex-1 px-4 py-2.5 bg-[#0071e3] text-white rounded-xl text-sm font-medium hover:bg-[#0077ed] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crop className="w-4 h-4" />}
            {applying ? 'Applying...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Crop Choice Prompt (Auto vs Manual)
───────────────────────────────────────────── */
function CropChoiceModal({ pendingFiles, onChoice, onCancel }) {
  const file = pendingFiles[0];
  const previewUrl = file ? URL.createObjectURL(file) : null;
  const remaining = pendingFiles.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-base font-semibold text-black mb-1">How would you like to crop this image?</h3>
          <p className="text-xs text-[#86868b]">
            {remaining > 0 ? `${remaining} more image${remaining > 1 ? 's' : ''} will follow.` : 'This is the last image.'}
          </p>
        </div>
        {previewUrl && (
          <div className="mx-5 mb-4 rounded-xl overflow-hidden border border-[#d2d2d7] aspect-[3/4] relative bg-[#F5F5F7]">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex flex-col gap-2 px-5 pb-5">
          <button
            onClick={() => onChoice('auto')}
            className="flex items-center gap-3 px-4 py-3 border border-[#d2d2d7] rounded-xl hover:border-[#0071e3] hover:bg-[#0071e3]/5 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-full bg-[#F5F5F7] group-hover:bg-[#0071e3]/10 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#0071e3]" />
            </div>
            <div>
              <p className="text-sm font-medium text-black">Auto Crop</p>
              <p className="text-xs text-[#86868b]">AI-powered smart crop to 3:4</p>
            </div>
          </button>
          <button
            onClick={() => onChoice('manual')}
            className="flex items-center gap-3 px-4 py-3 border border-[#d2d2d7] rounded-xl hover:border-[#0071e3] hover:bg-[#0071e3]/5 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-full bg-[#F5F5F7] group-hover:bg-[#0071e3]/10 flex items-center justify-center shrink-0">
              <Crop className="w-4 h-4 text-[#0071e3]" />
            </div>
            <div>
              <p className="text-sm font-medium text-black">Manual Crop</p>
              <p className="text-xs text-[#86868b]">Adjust the crop frame yourself</p>
            </div>
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-sm text-[#86868b] hover:text-black transition-colors text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main ProductManager Component
───────────────────────────────────────────── */
export default function ProductManager({ initialProduct = null, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [hasDraft, setHasDraft] = useState(false);

  // ── Text fields ──
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState(['New Arrivals']);
  const [badge, setBadge] = useState('');
  const [categorySelections, setCategorySelections] = useState({});
  const [aesthetic, setAesthetic] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colors, setColors] = useState([]);
  const [inStock, setInStock] = useState(true);
  const [bestSeller, setBestSeller] = useState(false);

  // ── Size Chart State ──
  const [sizeChartFile, setSizeChartFile] = useState(null);
  const [sizeChartUrl, setSizeChartUrl] = useState('');
  const sizeChartInputRef = useRef(null);

  // ── Image state ──
  // Each image item: { id, type: 'existing'|'new', src: string (url/blob), file: File|null, isManualCrop: bool, uploading: bool, uploaded: bool, uploadedUrl: string }
  const [imageItems, setImageItems] = useState([]);

  // ── Crop modals ──
  const [pendingFiles, setPendingFiles] = useState([]); // queue of File objects waiting crop decision
  const [cropChoiceOpen, setCropChoiceOpen] = useState(false);
  const [manualCropTarget, setManualCropTarget] = useState(null); // { file, blobUrl, itemId? }

  // ── Drag state ──
  const [isDragging, setIsDragging] = useState(false); // drop zone highlight
  const dragItemRef = useRef(null);
  const dragOverRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ── Populate edit mode ── */
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setPrice(initialProduct.price?.toString() || '');
      setDescription(initialProduct.description || '');
      setSections(initialProduct.sections || [initialProduct.section || 'New Arrivals']);
      setBadge(initialProduct.badge || '');
      
      const initialSelections = {};
      if (initialProduct.category) {
        initialSelections[initialProduct.category] = initialProduct.subcategories || (initialProduct.subcategory ? [initialProduct.subcategory] : []);
      }
      if (initialProduct.secondaryCategory) {
        initialSelections[initialProduct.secondaryCategory] = initialProduct.secondarySubcategories || [];
      }
      setCategorySelections(initialSelections);
      const initialAesthetic = initialProduct.aesthetic;
      setAesthetic(Array.isArray(initialAesthetic) ? initialAesthetic : (initialAesthetic ? [initialAesthetic] : []));
      setSizes(initialProduct.sizes || []);
      setColors(initialProduct.swatches?.map((s, idx) => ({
        id: Date.now() + idx,
        colorName: s.colorName || s.color,
        colorHex: s.color,
        imageUrl: s.imageUrl || '',
        imageFile: null
      })) || []);
      setInStock(initialProduct.inStock !== false);
      setBestSeller(initialProduct.bestSeller || false);
      setSizeChartUrl(initialProduct.sizeChartUrl || '');

      // Load existing images into unified imageItems list
      const existing = (initialProduct.images || [initialProduct.imageUrl].filter(Boolean)).map((url, idx) => ({
        id: `existing-${idx}`,
        type: 'existing',
        src: url,
        file: null,
        isManualCrop: false,
        uploading: false,
        uploaded: true,
        uploadedUrl: url
      }));
      setImageItems(existing);
    }
  }, [initialProduct]);

  /* ── Draft persistence (text fields only, not in edit mode) ── */
  useEffect(() => {
    if (initialProduct) return; // don't restore drafts in edit mode
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        setHasDraft(true);
        setName(draft.name || '');
        setPrice(draft.price || '');
        setDescription(draft.description || '');
        setSections(draft.sections || ['New Arrivals']);
        setBadge(draft.badge || '');
        setCategorySelections(draft.categorySelections || {});
        const initialAesthetic = draft.aesthetic;
        setAesthetic(Array.isArray(initialAesthetic) ? initialAesthetic : (initialAesthetic ? [initialAesthetic] : []));
        setSizes(draft.sizes || []);
        setInStock(draft.inStock !== false);
        setBestSeller(draft.bestSeller || false);
      }
    } catch (_) {}
  }, [initialProduct]);

  // Auto-save draft on field changes
  useEffect(() => {
    if (initialProduct) return;
    const timer = setTimeout(() => {
      try {
        const draft = { name, price, description, sections, badge, categorySelections, aesthetic, sizes, inStock, bestSeller };
        if (name || price || description) {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        }
      } catch (_) {}
    }, 800);
    return () => clearTimeout(timer);
  }, [name, price, description, sections, badge, categorySelections, aesthetic, sizes, inStock, bestSeller, initialProduct]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  };

  /* ── Size handlers ── */
  const removeSize = (s) => setSizes(prev => prev.filter(x => x !== s));
  const processSizeInput = (value) => {
    const val = value.trim().toUpperCase();
    if (val && !sizes.includes(val)) setSizes(prev => [...prev, val]);
  };
  const handleSizeKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); processSizeInput(sizeInput); setSizeInput(''); }
  };
  const handleSizeBlur = () => { if (sizeInput.trim()) { processSizeInput(sizeInput); setSizeInput(''); } };
  const handleSizeChange = (e) => {
    const val = e.target.value;
    if (val.includes(',')) { val.split(',').forEach(v => { if (v.trim()) processSizeInput(v); }); setSizeInput(''); }
    else setSizeInput(val);
  };

  /* ── Color variant handlers ── */
  const addColorVariant = () => setColors(prev => [...prev, { id: Date.now(), colorName: '', colorHex: '', imageUrl: '', imageFile: null }]);
  const removeColorVariant = (id) => setColors(prev => prev.filter(c => c.id !== id));
  const updateColorVariant = (id, field, value) => setColors(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

  /* ── File selection → crop choice queue ── */
  const handleFilesAdded = (fileList) => {
    const validFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;
    setPendingFiles(validFiles);
    setCropChoiceOpen(true);
  };

  const processNextPending = (remaining) => {
    if (remaining.length === 0) {
      setPendingFiles([]);
      setCropChoiceOpen(false);
      return;
    }
    setPendingFiles(remaining);
    setCropChoiceOpen(true);
  };

  const handleCropChoice = (choice) => {
    const [current, ...rest] = pendingFiles;
    setCropChoiceOpen(false);

    if (choice === 'manual') {
      const blobUrl = URL.createObjectURL(current);
      setManualCropTarget({ file: current, blobUrl, remainingFiles: rest });
    } else {
      // auto crop — add directly
      const blobUrl = URL.createObjectURL(current);
      const newItem = {
        id: `new-${Date.now()}-${Math.random()}`,
        type: 'new',
        src: blobUrl,
        file: current,
        isManualCrop: false,
        uploading: false,
        uploaded: false,
        uploadedUrl: ''
      };
      setImageItems(prev => [...prev, newItem]);
      processNextPending(rest);
    }
  };

  const handleCropCancel = () => {
    setCropChoiceOpen(false);
    setPendingFiles([]);
  };

  const handleManualCropApply = (croppedFile, croppedPreviewUrl) => {
    const { remainingFiles } = manualCropTarget;
    const newItem = {
      id: `new-${Date.now()}-${Math.random()}`,
      type: 'new',
      src: croppedPreviewUrl,
      file: croppedFile,
      isManualCrop: true,
      uploading: false,
      uploaded: false,
      uploadedUrl: ''
    };
    setImageItems(prev => [...prev, newItem]);
    setManualCropTarget(null);
    processNextPending(remainingFiles);
  };

  const handleManualCropCancel = () => {
    const { remainingFiles } = manualCropTarget;
    setManualCropTarget(null);
    processNextPending(remainingFiles);
  };

  /* ── Image list management ── */
  const removeImage = (id) => setImageItems(prev => prev.filter(item => item.id !== id));

  /* ── Drag to reorder ── */
  const onDragStartItem = (e, index) => { dragItemRef.current = index; };
  const onDragEnterItem = (e, index) => { dragOverRef.current = index; };
  const onDragEndItem = () => {
    const from = dragItemRef.current;
    const to = dragOverRef.current;
    if (from === null || to === null || from === to) return;
    setImageItems(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
    dragItemRef.current = null;
    dragOverRef.current = null;
  };

  /* ── Drop zone handlers ── */
  const onDropZoneDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDropZoneDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDropZoneDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) handleFilesAdded(e.dataTransfer.files); };

  /* ── Form Submission ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (imageItems.length === 0) {
      setError('Please select at least one image.');
      setLoading(false);
      return;
    }

    try {
      // 1. Upload all new (non-uploaded) images sequentially
      const updatedItems = [...imageItems];
      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];
        if (item.type === 'new' && !item.uploaded) {
          setImageItems(prev => prev.map(x => x.id === item.id ? { ...x, uploading: true } : x));

          const formPayload = new FormData();
          formPayload.append('image', item.file);
          formPayload.append('manualCrop', String(item.isManualCrop));
          const result = await uploadSingleImage(formPayload);

          if (!result.success) throw new Error(`Failed to upload image: ${result.error}`);
          updatedItems[i] = { ...item, uploaded: true, uploading: false, uploadedUrl: result.url };
          setImageItems([...updatedItems]);
        }
      }

      // 2. Get final ordered URLs
      const finalImageUrls = updatedItems.map(item => item.uploadedUrl || item.src);

      // 3. Upload color variant images
      const swatchesArray = [];
      for (let i = 0; i < colors.length; i++) {
        const variant = colors[i];
        let vUrl = variant.imageUrl || '';
        if (variant.imageFile) {
          const vForm = new FormData();
          vForm.append('image', variant.imageFile);
          vForm.append('manualCrop', 'false');
          const vRes = await uploadSingleImage(vForm);
          if (vRes.success) vUrl = vRes.url;
        }
        swatchesArray.push({
          color: (variant.colorHex || variant.colorName).trim(),
          colorName: (variant.colorName || variant.colorHex).trim(),
          imageUrl: vUrl,
          active: i === 0
        });
      }

      // 4. Delete removed existing images from Cloudinary
      if (initialProduct) {
        const originalImages = initialProduct.images || [initialProduct.imageUrl].filter(Boolean);
        const keptUrls = updatedItems.filter(x => x.type === 'existing').map(x => x.src);
        const imagesToDelete = originalImages.filter(img => !keptUrls.includes(img));
        for (const imgUrl of imagesToDelete) {
          await deleteImageFromCloudinary(imgUrl).catch(console.error);
        }
      }

      // 5. Upload Size Chart if new file selected
      let finalSizeChartUrl = sizeChartUrl;
      if (sizeChartFile) {
        const scForm = new FormData();
        scForm.append('image', sizeChartFile);
        scForm.append('manualCrop', 'true'); // bypass 3:4 auto-crop
        const scRes = await uploadSingleImage(scForm);
        if (scRes.success) finalSizeChartUrl = scRes.url;
      }

      // 6. Convert categorySelections back to DB shape
      const selectedCats = Object.keys(categorySelections).filter(cat => categorySelections[cat].length > 0);
      
      if (selectedCats.length === 0) {
        setError('Please select at least one subcategory for the product.');
        setSubmitting(false);
        return;
      }

      const primaryCat = selectedCats[0];
      const primarySubs = categorySelections[primaryCat] || [];
      
      const secondaryCat = selectedCats.length > 1 ? selectedCats[1] : '';
      const secondarySubs = secondaryCat ? (categorySelections[secondaryCat] || []) : [];

      const allCategories = [primaryCat];
      if (secondaryCat) allCategories.push(secondaryCat);

      // 7. Build product data
      const productData = {
        name,
        price: parseFloat(price),
        description,
        section: sections[0] || '',
        sections,
        category: primaryCat,
        categories: allCategories, // multi-category support
        secondaryCategory: secondaryCat,
        subcategories: primarySubs,
        secondarySubcategories: secondarySubs,
        subcategory: primarySubs[0] || '',
        aesthetic: sections.includes('Shop Your Look') || sections.includes('Shop your aesthetic') ? aesthetic : [],
        badge,
        imageUrl: finalImageUrls[0] || '',
        images: finalImageUrls,
        sizeChartUrl: finalSizeChartUrl,
        sizes,
        swatches: swatchesArray,
        extraColors: swatchesArray.length > 3 ? swatchesArray.length - 3 : 0,
        inStock,
        bestSeller,
      };

      if (initialProduct) {
        if (name !== initialProduct.name) {
          productData.slug = await generateUniqueSlug(name, db, initialProduct.id);
        }
        await updateDoc(doc(db, 'products', initialProduct.id), productData);
        setSuccess('Product successfully updated!');
      } else {
        productData.slug = await generateUniqueSlug(name, db);
        productData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'products'), productData);
        setSuccess('Product successfully added!');

        // Clear form + draft
        clearDraft();
        setName(''); setPrice(''); setDescription(''); setSections(['New Arrivals']); setBadge('');
        setCategorySelections({}); setAesthetic([]);
        setSizes([]); setColors([]); setImageItems([]);
        setInStock(true); setBestSeller(false);
        setSizeChartFile(null); setSizeChartUrl('');
      }

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      } else {
        setTimeout(() => setSuccess(''), 5000);
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setImageItems(prev => prev.map(x => ({ ...x, uploading: false })));
    }
  };

  /* ─────────── RENDER ─────────── */
  return (
    <div className="bg-[#F5F5F7] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-10 min-h-screen">

      {/* Modals */}
      {cropChoiceOpen && pendingFiles.length > 0 && (
        <CropChoiceModal
          pendingFiles={pendingFiles}
          onChoice={handleCropChoice}
          onCancel={handleCropCancel}
        />
      )}
      {manualCropTarget && (
        <CropModal
          imageSrc={manualCropTarget.blobUrl}
          fileName={manualCropTarget.file.name}
          onApply={handleManualCropApply}
          onCancel={handleManualCropCancel}
        />
      )}

      {/* Sticky Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sticky top-[73px] z-20 bg-[#F5F5F7]/80 backdrop-blur-xl py-4 border-b border-[#d2d2d7]/50">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-black">{initialProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <p className="text-sm text-[#86868b] mt-1">{initialProduct ? 'Update the details of your product.' : 'Fill in the details below to publish a new product.'}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          {onSuccess && <button onClick={onSuccess} className="text-sm font-medium text-[#0071e3] hover:opacity-80 transition-opacity">Cancel</button>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#0071e3] text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-sm hover:bg-[#0077ed] disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Saving...' : (initialProduct ? 'Update Product' : 'Save Product')}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 bg-[#fff2f2] border border-[#ff3b30] text-[#ff3b30] text-sm rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-[#f0fdf4] border border-[#34c759] text-[#34c759] text-sm rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      {/* Draft restored banner */}
      {hasDraft && !initialProduct && (
        <div className="mb-6 p-4 bg-[#fff8e1] border border-[#f0c040] text-[#856404] text-sm rounded-2xl flex items-center justify-between gap-2">
          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> Draft restored — your previous progress has been loaded.</span>
          <button onClick={clearDraft} className="shrink-0 flex items-center gap-1 text-xs font-medium text-[#856404] hover:text-black underline transition-colors">
            <RotateCcw className="w-3 h-3" /> Clear Draft
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Left Column ── */}
        <div className="flex-1 flex flex-col gap-6">

          {/* General Info */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-semibold text-black mb-4 flex items-center gap-2"><Tag className="w-4 h-4 text-[#86868b]" /> General Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Product Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all text-sm" placeholder="e.g. Valerie Ruffle Dress" />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Description</label>
                <textarea required rows="4" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all text-sm" placeholder="Write a compelling description..." />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-semibold text-black mb-4">Pricing & Inventory</h3>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-black mb-1">Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-[#86868b] font-medium text-sm">₹</span>
                  <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#d2d2d7] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all text-sm" placeholder="0.00" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <label className="block text-sm font-medium text-black mb-2 flex items-center justify-between">
                  <span>Stock Status</span>
                  {inStock
                    ? <span className="text-[10px] font-bold tracking-widest uppercase bg-[#f0fdf4] text-[#34c759] px-2 py-0.5 rounded-full border border-[#34c759]/20">In Stock</span>
                    : <span className="text-[10px] font-bold tracking-widest uppercase bg-[#fff2f2] text-[#ff3b30] px-2 py-0.5 rounded-full border border-[#ff3b30]/20">Out of Stock</span>
                  }
                </label>
                <div onClick={() => setInStock(!inStock)} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${inStock ? 'bg-[#34c759]' : 'bg-[#d2d2d7]'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${inStock ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-semibold text-black mb-4">Variants</h3>
            <div className="space-y-6">
              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Sizes</label>
                <p className="text-[13px] text-[#86868b] mb-2">Type a size and press Enter or comma.</p>
                <div className="p-2 bg-white border border-[#d2d2d7] rounded-xl flex flex-wrap gap-2 focus-within:ring-4 focus-within:ring-[#0071e3]/20 focus-within:border-[#0071e3] transition-all min-h-[46px] items-center">
                  {sizes.map(size => (
                    <span key={size} className="bg-[#F5F5F7] text-black text-[13px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#d2d2d7]">
                      {size}
                      <button type="button" onClick={() => removeSize(size)} className="text-[#86868b] hover:text-[#ff3b30] focus:outline-none transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </span>
                  ))}
                  <input type="text" value={sizeInput} onChange={handleSizeChange} onKeyDown={handleSizeKeyDown} onBlur={handleSizeBlur} className="flex-1 min-w-[80px] outline-none text-[13px] px-1 bg-transparent" placeholder={sizes.length === 0 ? "e.g. S, M, L..." : ""} />
                </div>
              </div>

              {/* Colors */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Colors & Variations</label>
                    <p className="text-[13px] text-[#86868b]">Add a color and optionally attach a specific image.</p>
                  </div>
                  <button type="button" onClick={addColorVariant} className="text-[#0071e3] text-[13px] font-medium flex items-center gap-1 hover:underline"><Plus className="w-4 h-4" /> Add Variant</button>
                </div>
                <div className="space-y-3">
                  {colors.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-[#d2d2d7] rounded-xl bg-[#F5F5F7]">
                      <p className="text-[13px] text-[#86868b]">No variants added yet.</p>
                    </div>
                  )}
                  {colors.map((variant) => (
                    <div key={variant.id} className="flex items-start sm:items-center gap-4 bg-white border border-[#d2d2d7] p-3 rounded-xl shadow-sm">
                      {/* Image Upload Box */}
                      <div className="shrink-0 relative">
                        <label className="cursor-pointer flex items-center justify-center w-16 h-20 rounded-lg border border-[#d2d2d7] bg-[#F5F5F7] overflow-hidden hover:border-[#0071e3] transition-colors">
                          {variant.imageFile ? (
                            <img src={URL.createObjectURL(variant.imageFile)} className="w-full h-full object-cover" alt="variant" />
                          ) : variant.imageUrl ? (
                            <img src={variant.imageUrl} className="w-full h-full object-cover" alt="variant" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-[#86868b]" />
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) updateColorVariant(variant.id, 'imageFile', e.target.files[0]); }} />
                        </label>
                        {variant.imageFile && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-[#0071e3] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">NEW</span>}
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <input required type="text" placeholder="Color Name (e.g. Black)" value={variant.colorName} onChange={e => updateColorVariant(variant.id, 'colorName', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#d2d2d7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all text-[13px]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input required type="text" placeholder="Hex (e.g. #000000)" value={variant.colorHex} onChange={e => updateColorVariant(variant.id, 'colorHex', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#d2d2d7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all text-[13px]" />
                            {variant.colorHex && <div className="w-6 h-6 rounded-full border border-[#d2d2d7] shrink-0" style={{ backgroundColor: variant.colorHex }} />}
                          </div>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeColorVariant(variant.id)} className="p-2 text-[#86868b] hover:text-[#ff3b30] hover:bg-[#fff2f2] rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="w-full lg:w-[360px] flex flex-col gap-6">

          {/* Media Card */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-semibold text-black mb-1 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#86868b]" /> Media</h3>
            <p className="text-xs text-[#86868b] mb-4">Choose Auto Crop (AI-smart 3:4) or Manual Crop per image. Drag thumbnails to reorder.</p>

            {/* Drop Zone */}
            <div
              onDragOver={onDropZoneDragOver}
              onDragLeave={onDropZoneDragLeave}
              onDrop={onDropZoneDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragging ? 'border-[#0071e3] bg-[#0071e3]/5' : 'border-[#d2d2d7] hover:border-[#0071e3] hover:bg-black/[0.02]'}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-3">
                <UploadCloud className="w-5 h-5 text-[#0071e3]" />
              </div>
              <p className="text-[13px] font-semibold text-black">Click or drag images here</p>
              <p className="text-xs text-[#86868b] mt-1">You'll choose Auto or Manual crop per image</p>
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFilesAdded(e.target.files)} />
            </div>

            {/* Draggable Image Grid */}
            {imageItems.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {imageItems.map((item, idx) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => onDragStartItem(e, idx)}
                    onDragEnter={(e) => onDragEnterItem(e, idx)}
                    onDragEnd={onDragEndItem}
                    onDragOver={(e) => e.preventDefault()}
                    className="relative aspect-[3/4] rounded-lg overflow-hidden border border-[#d2d2d7] group shadow-sm cursor-grab active:cursor-grabbing select-none"
                    style={{ touchAction: 'none' }}
                  >
                    <img src={item.src} alt={`Product ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />

                    {/* Loading overlay */}
                    {item.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}

                    {/* NEW badge */}
                    {item.type === 'new' && !item.uploading && (
                      <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold text-[#0071e3] bg-white px-1.5 py-0.5 rounded shadow-sm">NEW</span>
                    )}

                    {/* Primary badge */}
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-full shadow-sm">Primary</span>
                    )}

                    {/* Drag handle */}
                    <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-6 h-6 bg-white/80 backdrop-blur-sm rounded flex items-center justify-center shadow-sm">
                        <GripVertical className="w-3 h-3 text-[#86868b]" />
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(item.id); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/80 hover:bg-[#ff3b30] hover:text-white text-black shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imageItems.length > 0 && (
              <p className="text-[11px] text-[#86868b] mt-3 text-center">Drag images to reorder · First image is the primary photo</p>
            )}
          </div>

          {/* Size Chart Card */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-semibold text-black mb-1 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#86868b]" /> Size Chart Image</h3>
            <p className="text-xs text-[#86868b] mb-4">Upload a specific size guide for this product.</p>

            {sizeChartUrl || sizeChartFile ? (
              <div className="relative aspect-square sm:aspect-video rounded-lg overflow-hidden border border-[#d2d2d7] group shadow-sm bg-[#F5F5F7] flex items-center justify-center">
                <img 
                  src={sizeChartFile ? URL.createObjectURL(sizeChartFile) : sizeChartUrl} 
                  alt="Size Chart" 
                  className="max-w-full max-h-full object-contain pointer-events-none" 
                />
                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSizeChartFile(null); setSizeChartUrl(''); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-[#ff3b30] hover:text-white text-black shadow-md rounded-full flex items-center justify-center transition-all backdrop-blur-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => sizeChartInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-[#d2d2d7] hover:border-[#0071e3] hover:bg-black/[0.02]"
              >
                <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-3">
                  <UploadCloud className="w-5 h-5 text-[#0071e3]" />
                </div>
                <p className="text-[13px] font-semibold text-black">Click to upload size chart</p>
                <p className="text-xs text-[#86868b] mt-1">Optional. PNG, JPG up to 5MB</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={sizeChartInputRef} 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      setSizeChartFile(file);
                    }
                  }} 
                />
              </div>
            )}
          </div>

          {/* Organization Card */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-semibold text-black mb-4">Organization</h3>
            <div className="space-y-4">

              {/* Sections */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Website Section</label>
                <p className="text-xs text-[#86868b] mb-2">Feature this product on homepage sections.</p>
                <div className="flex flex-col gap-3 mt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={sections.includes('New Arrivals')} onChange={(e) => {
                      if (e.target.checked) setSections([...sections, 'New Arrivals']);
                      else setSections(sections.filter(s => s !== 'New Arrivals'));
                    }} className="accent-[#0071e3] w-4 h-4 cursor-pointer" /> New Arrivals
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)} className="accent-[#0071e3] w-4 h-4 cursor-pointer" /> Best Seller
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={sections.includes('Shop Your Look')} onChange={(e) => {
                      if (e.target.checked) setSections([...sections, 'Shop Your Look']);
                      else setSections(sections.filter(s => s !== 'Shop Your Look'));
                    }} className="accent-[#0071e3] w-4 h-4 cursor-pointer" /> Shop Your Look
                  </label>
                  {sections.includes('Shop Your Look') && (
                    <div className="pl-6 mt-1 flex flex-col gap-2">
                      {[
                        'casual', 'summer', 'Summer vacation', 'festivals / concerts', 'trendy',
                        'babydoll / coquette', 'dark feminine', 'office siren',
                        'y2k', 'streetwear', 'elegant chic', 'grunge'
                      ].map(option => (
                        <label key={option} className="flex items-center gap-2 text-sm cursor-pointer text-[#333333]">
                          <input 
                            type="checkbox" 
                            checked={aesthetic.includes(option)} 
                            onChange={(e) => {
                              if (e.target.checked) setAesthetic([...aesthetic, option]);
                              else setAesthetic(aesthetic.filter(a => a !== option));
                            }} 
                            className="accent-[#0071e3] w-4 h-4 cursor-pointer" 
                          /> 
                          <span className="capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Unified Category Matrix */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">Where should this product appear?</label>
                <p className="text-[11px] text-[#86868b] mb-4">Check all applicable subcategories. The first selected category will be the primary one.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-white border border-[#d2d2d7] rounded-xl max-h-[400px] overflow-y-auto">
                  {CATEGORY_DATA.map(c => (
                    <div key={c.title} className="flex flex-col gap-2">
                      <span className="font-semibold text-sm text-black border-b border-gray-100 pb-1">{c.title}</span>
                      {c.children && c.children.length > 0 ? (
                        c.children.map(sub => (
                          <label key={sub} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-black">
                            <input
                              type="checkbox"
                              checked={categorySelections[c.title]?.includes(sub) || false}
                              onChange={(e) => {
                                const currentCatSubs = categorySelections[c.title] || [];
                                let newCatSubs;
                                if (e.target.checked) {
                                  newCatSubs = [...currentCatSubs, sub];
                                } else {
                                  newCatSubs = currentCatSubs.filter(s => s !== sub);
                                }
                                
                                setCategorySelections(prev => ({
                                  ...prev,
                                  [c.title]: newCatSubs
                                }));
                              }}
                              className="accent-[#0071e3] w-4 h-4 cursor-pointer"
                            />
                            <span className="capitalize">{sub}</span>
                          </label>
                        ))
                      ) : (
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-black">
                          <input
                            type="checkbox"
                            checked={categorySelections[c.title]?.includes('all') || false}
                            onChange={(e) => {
                              setCategorySelections(prev => ({
                                ...prev,
                                [c.title]: e.target.checked ? ['all'] : []
                              }));
                            }}
                            className="accent-[#0071e3] w-4 h-4 cursor-pointer"
                          />
                          <span className="capitalize">All {c.title}</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Badge */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Badge</label>
                <input type="text" value={badge} onChange={e => setBadge(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all text-sm" placeholder="e.g. MOST LOVED, NEW" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
