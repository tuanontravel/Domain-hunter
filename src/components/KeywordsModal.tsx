import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Sliders, Tag, RefreshCw } from 'lucide-react';

interface KeywordItem {
  id: string;
  keyword: string;
  category: string;
  enabled: boolean;
  created_at?: string;
}

interface KeywordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeywordsChange?: () => void;
}

export const KeywordsModal: React.FC<KeywordsModalProps> = ({ isOpen, onClose, onKeywordsChange }) => {
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('Luxury & Custom');
  const [error, setError] = useState<string | null>(null);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/keywords');
      const data = await res.json();
      if (data.success && Array.isArray(data.keywords)) {
        setKeywords(data.keywords);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchKeywords();
    }
  }, [isOpen]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    try {
      setError(null);
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword.trim(), category: newCategory }),
      });
      const data = await res.json();
      if (data.success) {
        setNewKeyword('');
        fetchKeywords();
        if (onKeywordsChange) onKeywordsChange();
      } else {
        setError(data.error || 'Lỗi thêm từ khóa');
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch('/api/keywords', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled: !currentEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        setKeywords(prev => prev.map(k => k.id === id ? { ...k, enabled: !currentEnabled } : k));
        if (onKeywordsChange) onKeywordsChange();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Anh có chắc muốn xóa từ khóa này khỏi bộ lọc theo dõi?')) return;
    try {
      const res = await fetch(`/api/keywords?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setKeywords(prev => prev.filter(k => k.id !== id));
        if (onKeywordsChange) onKeywordsChange();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Thiết Lập Từ Khóa Theo Dõi (Domain Hunter)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tùy chỉnh danh sách keyword để bộ quét tự động phân loại và săn tên miền</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add keyword form */}
        <form onSubmit={handleAdd} className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Nhập từ khóa mới (vd: indochina, expedition, safari)..."
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            >
              <option value="Luxury & Custom">Luxury & Custom</option>
              <option value="Travel Experience">Travel Experience</option>
              <option value="Destination">Destination</option>
              <option value="B2B & Industry">B2B & Industry</option>
              <option value="General Travel">General Travel</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Thêm từ khóa
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </form>

        {/* Keywords list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
            <span>Tổng cộng: {keywords.length} từ khóa ({keywords.filter(k => k.enabled).length} đang hoạt động)</span>
            <button onClick={fetchKeywords} className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {keywords.map((kw) => (
              <div
                key={kw.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  kw.enabled
                    ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => handleToggle(kw.id, kw.enabled)}
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      kw.enabled
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {kw.enabled && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <div className="truncate">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {kw.keyword}
                    </span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      {kw.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleDelete(kw.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Xóa từ khóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500">
          <span>* Các thay đổi có hiệu lực ngay lập tức cho các lượt quét tên miền tiếp theo.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
