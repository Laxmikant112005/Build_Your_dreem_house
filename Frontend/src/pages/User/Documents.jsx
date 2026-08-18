import React, { useState, useEffect } from 'react';
import { documentService } from '../../services/documentService';
import { FileText, Image, FolderOpen, Star, Archive, Upload, Search, Trash2, MoreVertical, Download, Eye, Plus, X, Grid, List } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';

const CATEGORY_ICONS = {
  property_document: FileText, land_record: FileText, legal_document: FileText,
  quotation: FileText, agreement: FileText, bill: FileText, receipt: FileText,
  property_image: Image, identification: FileText, contract: FileText,
  permit: FileText, insurance: FileText, warranty: FileText, other: FileText,
};

const CATEGORY_LABELS = {
  property_document: 'Property Document', land_record: 'Land Record',
  legal_document: 'Legal Document', quotation: 'Quotation', agreement: 'Agreement',
  bill: 'Bill', receipt: 'Receipt', property_image: 'Property Image',
  identification: 'Identification', contract: 'Contract', permit: 'Permit',
  insurance: 'Insurance', warranty: 'Warranty', other: 'Other',
};

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [folders, setFolders] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [stats, setStats] = useState(null);

  useEffect(() => { loadDocuments(); }, [selectedCategory, selectedFolder, pagination.page]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentService.getAll({
        page: pagination.page,
        limit: 20,
        category: selectedCategory || undefined,
        folder: selectedFolder || undefined,
        search: search || undefined,
      });
      setDocuments(res.data || []);
      setFolders(res.folders || []);
      setCategoryCounts(res.categoryCounts || []);
      setPagination(prev => ({ ...prev, ...res.meta?.pagination }));
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    documentService.getStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!search && !selectedCategory && !selectedFolder) return;
    const timer = setTimeout(() => loadDocuments(), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    try {
      await documentService.delete(id);
      toast.success('Document deleted');
      loadDocuments();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handleToggleFav = async (id) => {
    try {
      await documentService.toggleFavorite(id);
      loadDocuments();
    } catch (err) { toast.error('Failed to toggle'); }
  };

  const handleToggleArchive = async (id) => {
    try {
      await documentService.toggleArchive(id);
      toast.success('Document archived');
      loadDocuments();
    } catch (err) { toast.error('Failed to archive'); }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      await documentService.createFolder(newFolderName);
      toast.success('Folder created!');
      setShowFolderModal(false);
      setNewFolderName('');
      loadDocuments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create folder'); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6 py-8 px-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-navy">Document Management</h1>
        <p className="text-slate-600">Upload, organize, and manage your project documents</p>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
          <div className="bg-white rounded-2xl p-4 text-center border border-slate-200">
            <p className="text-2xl font-black text-navy">{stats.totalDocuments}</p>
            <p className="text-xs text-slate-500">Documents</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-slate-200">
            <p className="text-2xl font-black text-navy">{formatSize(stats.totalSize)}</p>
            <p className="text-xs text-slate-500">Total Size</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-slate-200">
            <p className="text-2xl font-black text-navy">{folders.length}</p>
            <p className="text-xs text-slate-500">Folders</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
        <div className="flex gap-3 items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search documents..." className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30 bg-slate-50"
            />
          </div>
          <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="p-3 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-gold/30">
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select value={selectedFolder} onChange={e => { setSelectedFolder(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="p-3 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-gold/30">
            <option value="">All Folders</option>
            {folders.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFolderModal(true)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all" title="New Folder">
            <FolderOpen className="w-5 h-5 text-navy" />
          </button>
          <button onClick={() => setShowUploadModal(true)} className="btn-gold px-5 py-3 rounded-2xl font-bold flex items-center gap-2">
            <Upload className="w-5 h-5" /> Upload
          </button>
          <div className="flex border border-slate-200 rounded-2xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={cn('p-3', viewMode === 'grid' ? 'bg-navy text-white' : 'bg-white text-slate-400')}>
              <Grid className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('list')} className={cn('p-3', viewMode === 'list' ? 'bg-navy text-white' : 'bg-white text-slate-400')}>
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => { setSelectedCategory(''); setPagination(p => ({ ...p, page: 1 })); }}
          className={cn('px-4 py-2 rounded-2xl text-sm font-bold transition-all', !selectedCategory ? 'bg-gold text-navy' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
          All
        </button>
        {categoryCounts.slice(0, 8).map(cc => (
          <button key={cc._id} onClick={() => { setSelectedCategory(cc._id); setPagination(p => ({ ...p, page: 1 })); }}
            className={cn('px-4 py-2 rounded-2xl text-sm font-bold transition-all', selectedCategory === cc._id ? 'bg-gold text-navy' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            {CATEGORY_LABELS[cc._id] || cc._id} ({cc.count})
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div></div>}

      {/* Empty State */}
      {!loading && documents.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-4xl border border-slate-200">
          <FileText className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-navy mb-2">No Documents Yet</h3>
          <p className="text-slate-500 mb-6">Upload your property documents, bills, agreements, and more</p>
          <button onClick={() => setShowUploadModal(true)} className="btn-gold px-8 py-4 rounded-2xl font-bold inline-flex items-center gap-2">
            <Upload className="w-5 h-5" /> Upload Your First Document
          </button>
        </div>
      )}

      {/* Grid View */}
      {!loading && documents.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map(doc => {
            const Icon = CATEGORY_ICONS[doc.category] || FileText;
            const isImage = doc.file?.mimeType?.startsWith('image/');
            return (
              <div key={doc._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
                {/* Preview */}
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  {isImage ? (
                    <img src={doc.file.url} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="w-16 h-16 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {doc.isFavorite && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button onClick={() => setPreviewDoc(doc)} className="p-2 bg-white rounded-xl shadow-lg hover:scale-110 transition-all">
                      <Eye className="w-5 h-5 text-navy" />
                    </button>
                    <a href={doc.file.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-xl shadow-lg hover:scale-110 transition-all">
                      <Download className="w-5 h-5 text-navy" />
                    </a>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-navy truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400">{CATEGORY_LABELS[doc.category] || doc.category}</p>
                    </div>
                    <div className="relative group/actions">
                      <button className="p-1 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical className="w-5 h-5 text-slate-500" />
                      </button>
                      <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 w-40 hidden group-hover/actions:block z-10">
                        <button onClick={() => handleToggleFav(doc._id)} className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 rounded-xl text-sm">
                          <Star className="w-4 h-4" /> {doc.isFavorite ? 'Unfavorite' : 'Favorite'}
                        </button>
                        <button onClick={() => handleToggleArchive(doc._id)} className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 rounded-xl text-sm">
                          <Archive className="w-4 h-4" /> Archive
                        </button>
                        <button onClick={() => handleDelete(doc._id)} className="w-full flex items-center gap-2 p-2 hover:bg-red-50 text-red-500 rounded-xl text-sm">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{formatSize(doc.file?.size)}</span>
                    <span>•</span>
                    <span>{formatDate(doc.createdAt)}</span>
                    {doc.folder && <><span>•</span><span className="bg-slate-100 px-2 py-0.5 rounded-full">{doc.folder}</span></>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {!loading && documents.length > 0 && viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {documents.map(doc => {
              const Icon = CATEGORY_ICONS[doc.category] || FileText;
              const isImage = doc.file?.mimeType?.startsWith('image/');
              return (
                <div key={doc._id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {isImage ? (
                      <img src={doc.file.thumbnailUrl || doc.file.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Icon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy truncate">{doc.name}</p>
                    <p className="text-xs text-slate-400">{CATEGORY_LABELS[doc.category] || doc.category} • {formatSize(doc.file?.size)} • {formatDate(doc.createdAt)}</p>
                  </div>
                  {doc.folder && <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500">{doc.folder}</span>}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setPreviewDoc(doc)} className="p-2 hover:bg-slate-100 rounded-xl" title="Preview"><Eye className="w-4 h-4" /></button>
                    <a href={doc.file.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 rounded-xl" title="Download"><Download className="w-4 h-4" /></a>
                    <button onClick={() => handleToggleFav(doc._id)} className="p-2 hover:bg-slate-100 rounded-xl" title="Favorite">
                      <Star className={cn('w-4 h-4', doc.isFavorite && 'fill-amber-400 text-amber-400')} />
                    </button>
                    <button onClick={() => handleDelete(doc._id)} className="p-2 hover:bg-red-50 text-red-400 rounded-xl" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            className="px-4 py-2 bg-white border border-slate-200 rounded-2xl disabled:opacity-40 font-bold">Previous</button>
          <span className="px-4 py-2 text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            className="px-4 py-2 bg-white border border-slate-200 rounded-2xl disabled:opacity-40 font-bold">Next</button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-4xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-navy">Upload Document</h3>
              <button onClick={() => setShowUploadModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <DocumentUploadForm onSuccess={() => { setShowUploadModal(false); loadDocuments(); }} />
          </div>
        </div>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowFolderModal(false)}>
          <div className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-navy mb-6">Create Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input required value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name"
                className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowFolderModal(false)} className="flex-1 p-3 bg-slate-100 rounded-2xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-gold text-navy rounded-2xl font-bold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-4xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10 rounded-t-4xl">
              <div>
                <h3 className="text-xl font-bold text-navy">{previewDoc.name}</h3>
                <p className="text-sm text-slate-400">{CATEGORY_LABELS[previewDoc.category] || previewDoc.category}</p>
              </div>
              <div className="flex gap-2">
                <a href={previewDoc.file.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-gold text-navy rounded-2xl font-bold flex items-center gap-2">
                  <Download className="w-5 h-5" /> Download
                </a>
                <button onClick={() => setPreviewDoc(null)} className="p-3 bg-slate-100 rounded-2xl"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-8">
              {previewDoc.file?.mimeType?.startsWith('image/') ? (
                <img src={previewDoc.file.url} alt={previewDoc.name} className="w-full rounded-3xl" />
              ) : previewDoc.file?.mimeType === 'application/pdf' ? (
                <iframe src={previewDoc.file.url} className="w-full h-[70vh] rounded-3xl" title={previewDoc.name} />
              ) : (
                <div className="text-center py-16 bg-slate-50 rounded-3xl">
                  <FileText className="w-24 h-24 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-bold text-navy mb-2">Preview not available</p>
                  <p className="text-slate-500 mb-4">Download the file to view its contents</p>
                  <a href={previewDoc.file.url} target="_blank" rel="noopener noreferrer" className="btn-gold px-6 py-3 rounded-2xl font-bold inline-flex items-center gap-2">
                    <Download className="w-5 h-5" /> Download {previewDoc.file.name}
                  </a>
                </div>
              )}
              {/* Metadata */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4"><p className="text-xs text-slate-400">Size</p><p className="font-bold text-navy">{formatSize(previewDoc.file?.size)}</p></div>
                <div className="bg-slate-50 rounded-2xl p-4"><p className="text-xs text-slate-400">Type</p><p className="font-bold text-navy">{previewDoc.file?.mimeType}</p></div>
                <div className="bg-slate-50 rounded-2xl p-4"><p className="text-xs text-slate-400">Uploaded</p><p className="font-bold text-navy">{formatDate(previewDoc.createdAt)}</p></div>
                <div className="bg-slate-50 rounded-2xl p-4"><p className="text-xs text-slate-400">Folder</p><p className="font-bold text-navy">{previewDoc.folder || '—'}</p></div>
              </div>
              {previewDoc.description && (
                <div className="mt-4 bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Description</p>
                  <p className="text-navy">{previewDoc.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline Upload Form Component
const DocumentUploadForm = ({ onSuccess }) => {
  const [step, setStep] = useState('select'); // select | details
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('property_document');
  const [folder, setFolder] = useState('General');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setName(f.name.replace(/\.[^/.]+$/, ''));
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    }
    setStep('details');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      // First upload file via uploads endpoint
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await import('../../services/api').then(m => m.default.post('/uploads/file', formData));
      const fileData = uploadRes.data.data;

      // Then create document record
      await documentService.create({
        name,
        category,
        folder,
        description,
        file: {
          url: fileData.url,
          name: fileData.filename || file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        },
      });
      toast.success('Document uploaded!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (step === 'select') {
    return (
      <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center hover:border-gold transition-all cursor-pointer"
        onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFileSelect({ target: { files: e.dataTransfer.files } }); }}>
        <input type="file" onChange={handleFileSelect} className="hidden" id="doc-upload" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx" />
        <label htmlFor="doc-upload" className="cursor-pointer">
          <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-bold text-navy mb-2">Drop files here or click to browse</p>
          <p className="text-sm text-slate-400">Supports PDF, Images, Documents, Spreadsheets</p>
        </label>
      </div>
    );
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {preview && <img src={preview} alt="" className="w-full h-40 object-cover rounded-2xl" />}
      {!preview && file && (
        <div className="bg-slate-50 rounded-2xl p-6 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-navy">{file.name}</p>
          <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Document Name</label>
        <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Folder</label>
        <input value={folder} onChange={e => setFolder(e.target.value)} placeholder="General" className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Description (optional)</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setStep('select')} className="flex-1 p-3 bg-slate-100 rounded-2xl font-bold">Change File</button>
        <button type="submit" disabled={uploading} className="flex-1 p-3 bg-gold text-navy rounded-2xl font-bold disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </form>
  );
};

export default Documents;

