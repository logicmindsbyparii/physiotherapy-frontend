import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Edit, Trash2, X, Star, User, MessageSquare } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Type definition
interface Testimonial {
  id: number;
  client_name: string;
  client_image: string;
  rating: number;
  review: string;
  service: string;
  date: string;
  is_active: number;
}

const ratingOptions = [1, 2, 3, 4, 5];
const serviceOptions = ['Sports Injury Rehab', 'Spine Therapy', 'Posture Correction', 'Manual Therapy', 'Dry Needling', 'Neurological Physiotherapy', 'Orthopedic Rehabilitation', 'Home Visit Therapy', 'Post-Surgery Recovery'];

const TestimonialsCMS = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    client_image: '',
    rating: 5,
    review: '',
    service: '',
    date: new Date().toISOString().split('T')[0],
    is_active: 1,
  });
  const [dropdownId, setDropdownId] = useState<number | null>(null);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(`${API_BASE}/testimonials`, getAuthHeaders());
      setTestimonials(res.data);
    } catch (err) {
      console.error('Failed to fetch testimonials', err);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Filter testimonials
  const filtered = testimonials.filter(t => {
    const matchSearch = t.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || (statusFilter === 'Active' && t.is_active) || (statusFilter === 'Inactive' && !t.is_active);
    const matchRating = ratingFilter === 'All' || t.rating === parseInt(ratingFilter);
    return matchSearch && matchStatus && matchRating;
  });

  // Open modal for add/edit
  const openModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        client_name: testimonial.client_name,
        client_image: testimonial.client_image,
        rating: testimonial.rating,
        review: testimonial.review,
        service: testimonial.service,
        date: testimonial.date,
        is_active: testimonial.is_active,
      });
    } else {
      setEditingTestimonial(null);
      setFormData({
        client_name: '',
        client_image: '',
        rating: 5,
        review: '',
        service: '',
        date: new Date().toISOString().split('T')[0],
        is_active: 1,
      });
    }
    setModalOpen(true);
    setDropdownId(null);
  };

  // Save testimonial (add or update)
  const saveTestimonial = async () => {
    if (!formData.client_name || !formData.review || !formData.service) {
      alert('Please fill all required fields (Client Name, Review, Service)');
      return;
    }
    const avatarUrl = `https://ui-avatars.com/api/?background=0284c7&color=fff&name=${encodeURIComponent(formData.client_name)}`;
    const payload = { ...formData, client_image: avatarUrl };

    try {
      if (editingTestimonial) {
        await axios.put(`${API_BASE}/testimonials/${editingTestimonial.id}`, payload, getAuthHeaders());
      } else {
        await axios.post(`${API_BASE}/testimonials`, payload, getAuthHeaders());
      }
      fetchTestimonials();
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save testimonial', err);
      alert('Failed to save testimonial');
    }
  };

  // Delete testimonial
  const deleteTestimonial = async (id: number) => {
    if (confirm('Delete this testimonial permanently?')) {
      try {
        await axios.delete(`${API_BASE}/testimonials/${id}`, getAuthHeaders());
        fetchTestimonials();
        setDropdownId(null);
      } catch (err) {
        console.error('Failed to delete testimonial', err);
      }
    }
  };

  // Toggle active status
  const toggleStatus = async (id: number) => {
    const t = testimonials.find(x => x.id === id);
    if (!t) return;
    try {
      await axios.put(`${API_BASE}/testimonials/${id}`, { ...t, is_active: t.is_active ? 0 : 1 }, getAuthHeaders());
      fetchTestimonials();
      setDropdownId(null);
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star key={star} className={`w-3.5 h-3.5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Testimonials Management</h2>
          <p className="text-sm text-slate-500">Manage client reviews and success stories.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, service, or review..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="px-3 py-2 bg-slate-100 rounded-lg" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select className="px-3 py-2 bg-slate-100 rounded-lg" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
          <option value="All">All Ratings</option>
          {ratingOptions.map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
        </select>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(testimonial => (
          <div
            key={testimonial.id}
            className={`bg-white rounded-2xl border transition-all hover:shadow-md relative ${
              testimonial.is_active ? 'border-slate-200' : 'border-slate-100 bg-slate-50/50'
            }`}
          >
            <div className="p-6">
              {/* Header with avatar and menu */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.client_image || `https://ui-avatars.com/api/?background=0284c7&color=fff&name=${encodeURIComponent(testimonial.client_name)}`}
                    alt={testimonial.client_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">{testimonial.client_name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{testimonial.service}</span>
                      <span>•</span>
                      <span>{new Date(testimonial.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setDropdownId(dropdownId === testimonial.id ? null : testimonial.id)} className="p-1 rounded hover:bg-slate-100">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>
                  {dropdownId === testimonial.id && (
                    <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 w-36">
                      <button onClick={() => openModal(testimonial)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => toggleStatus(testimonial.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                        {testimonial.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => deleteTestimonial(testimonial.id)} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-slate-50 flex items-center gap-2">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-3">{renderStars(testimonial.rating)}</div>

              {/* Review text */}
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
                "{testimonial.review}"
              </p>

              {/* Status badge */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${testimonial.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {testimonial.is_active ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => openModal(testimonial)} className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-slate-50 rounded-2xl p-12 text-center">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">No testimonials found</h3>
          <p className="text-slate-500 mt-1">Add your first client testimonial using the button above.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={formData.client_name}
                  onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Received *</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={formData.service}
                  onChange={e => setFormData({ ...formData, service: e.target.value })}
                >
                  <option value="">Select service</option>
                  {serviceOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rating *</label>
                <div className="flex gap-2">
                  {ratingOptions.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: r })}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.rating === r ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {r} ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Review / Testimonial *</label>
                <textarea
                  rows={4}
                  className="w-full border rounded-lg p-2"
                  value={formData.review}
                  onChange={e => setFormData({ ...formData, review: e.target.value })}
                  placeholder="Write the client's feedback here..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={!!formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">Show this testimonial on the website</label>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={saveTestimonial} className="px-4 py-2 bg-sky-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsCMS;