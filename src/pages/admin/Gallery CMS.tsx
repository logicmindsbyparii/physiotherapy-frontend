import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X, Image as ImageIcon, Search, Upload } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

interface GalleryImage {
  id: number;
  url: string;
  title: string;
  category: string;
  date: string;
  order: number;
}

const categories = ['Clinic Interiors', 'Therapy Sessions', 'Equipment', 'Recovery Exercises', 'Before/After'];

const GalleryCMS = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: categories[0],
    url: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [dragOver, setDragOver] = useState(false);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchImages = async () => {
    try {
      const res = await axios.get(`${API_BASE}/gallery`, getAuthHeaders());
      setImages(res.data);
    } catch (err) {
      console.error('Failed to fetch gallery images', err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Filter images
  const filtered = images
    .filter(img => {
      const matchSearch = img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          img.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'All' || img.category === categoryFilter;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => a.order - b.order);

  // Open modal for add/edit
  const openModal = (image?: GalleryImage) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        title: image.title,
        category: image.category,
        url: image.url,
        date: image.date,
      });
    } else {
      setEditingImage(null);
      setFormData({
        title: '',
        category: categories[0],
        url: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setModalOpen(true);
  };

  const saveImage = async () => {
    if (!formData.title || !formData.url || !formData.category) {
      alert('Please fill all required fields');
      return;
    }
    try {
      if (editingImage) {
        await axios.put(`${API_BASE}/gallery/${editingImage.id}`, { ...formData, order: editingImage.order }, getAuthHeaders());
      } else {
        const maxOrder = images.length ? Math.max(...images.map(img => img.order)) : -1;
        await axios.post(`${API_BASE}/gallery`, { ...formData, order: maxOrder + 1 }, getAuthHeaders());
      }
      fetchImages();
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save image', err);
      alert('Failed to save image');
    }
  };

  const deleteImage = async (id: number) => {
    if (confirm('Delete this image permanently?')) {
      try {
        await axios.delete(`${API_BASE}/gallery/${id}`, getAuthHeaders());
        fetchImages();
      } catch (err) {
        console.error('Failed to delete image', err);
      }
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newImages = [...filtered];
    const temp = newImages[index];
    newImages[index] = newImages[index - 1];
    newImages[index - 1] = temp;
    
    try {
      await Promise.all(newImages.map((img, idx) => 
        axios.put(`${API_BASE}/gallery/${img.id}`, { ...img, order: idx }, getAuthHeaders())
      ));
      fetchImages();
    } catch (err) { console.error(err); }
  };

  const moveDown = async (index: number) => {
    if (index === filtered.length - 1) return;
    const newImages = [...filtered];
    const temp = newImages[index];
    newImages[index] = newImages[index + 1];
    newImages[index + 1] = temp;
    
    try {
      await Promise.all(newImages.map((img, idx) => 
        axios.put(`${API_BASE}/gallery/${img.id}`, { ...img, order: idx }, getAuthHeaders())
      ));
      fetchImages();
    } catch (err) { console.error(err); }
  };

  // Handle image upload (convert to base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gallery Manager</h2>
          <p className="text-sm text-slate-500">Upload and manage clinic photos (auto‑saved).</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg">
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="px-3 py-2 bg-slate-100 rounded-lg" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((img, idx) => (
          <div key={img.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="relative aspect-video bg-slate-100">
              <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => openModal(img)} className="p-1.5 bg-white/90 rounded-lg text-slate-700 hover:bg-white">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => deleteImage(img.id)} className="p-1.5 bg-white/90 rounded-lg text-rose-600 hover:bg-white">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-slate-900">{img.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{img.category}</p>
              <p className="text-xs text-slate-400 mt-2">{img.date}</p>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                <div className="flex gap-2">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-xs text-slate-500 disabled:opacity-30">↑ Up</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === filtered.length - 1} className="text-xs text-slate-500 disabled:opacity-30">↓ Down</button>
                </div>
                <span className="text-[10px] text-slate-400">Order: {img.order + 1}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-slate-50 rounded-2xl p-12 text-center">
          <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">No images found</h3>
          <p className="text-slate-500 mt-1">Upload your first clinic image using the Add Image button.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingImage ? 'Edit Image' : 'Add New Image'}</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image *</label>
                {formData.url && (
                  <div className="mb-2 rounded-lg overflow-hidden border">
                    <img src={formData.url} alt="Preview" className="w-full h-32 object-cover" />
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, GIF up to 2MB</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input type="text" className="w-full border rounded-lg p-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Modern Treatment Room" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select className="w-full border rounded-lg p-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" className="w-full border rounded-lg p-2" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={saveImage} className="px-4 py-2 bg-sky-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryCMS;