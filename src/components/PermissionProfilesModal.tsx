import React, { useState } from "react";
import { PermissionProfile, DistributorPermissions } from "../types";
import { DistributorPermissionsFilterable } from "./DistributorPermissionsFilterable";
import { X, Plus, Edit, Trash2, Save, FileText } from "lucide-react";

interface Props {
  profiles: PermissionProfile[];
  onSaveProfiles: (profiles: PermissionProfile[]) => void;
  onClose: () => void;
}

export default function PermissionProfilesModal({ profiles, onSaveProfiles, onClose }: Props) {
  const [editingProfile, setEditingProfile] = useState<PermissionProfile | null>(null);

  const handleAdd = () => {
    setEditingProfile({
      id: "profile_" + Date.now(),
      name: "قالب جديد",
      description: "",
      permissions: {}
    });
  };

  const handleSave = () => {
    if (editingProfile) {
      if (!editingProfile.name.trim()) return;
      const exists = profiles.some(p => p.id === editingProfile.id);
      if (exists) {
        onSaveProfiles(profiles.map(p => p.id === editingProfile.id ? editingProfile : p));
      } else {
        onSaveProfiles([...profiles, editingProfile]);
      }
      setEditingProfile(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا القالب؟")) {
      onSaveProfiles(profiles.filter(p => p.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8">
        <div className="px-2 py-3 text-xs md:text-sm sm:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            إدارة قوالب الصلاحيات
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {editingProfile ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">اسم القالب</label>
                  <input
                    type="text"
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-white dark:text-white"
                    placeholder="مثال: موزع معتمد، مدير دعم فني..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">وصف القالب (اختياري)</label>
                  <input
                    type="text"
                    value={editingProfile.description || ""}
                    onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-white dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                <DistributorPermissionsFilterable
                  permissions={editingProfile.permissions}
                  onChange={(perms) => setEditingProfile({ ...editingProfile, permissions: perms })}
                  isModal={false}
                />
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button onClick={handleSave} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2">
                  <Save className="w-5 h-5" /> حفظ القالب
                </button>
                <button onClick={() => setEditingProfile(null)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold">
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-500">قم بإنشاء قوالب جاهزة للصلاحيات لتسهيل تعيينها للموزعين الجدد.</p>
                <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> قالب جديد
                </button>
              </div>

              {profiles.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold">لا توجد قوالب محفوظة حالياً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profiles.map(p => (
                    <div key={p.id} className="px-2 py-3 text-xs md:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">{p.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-100 dark:border-indigo-800">
                          {Object.keys(p.permissions).length} صلاحية مفعلة
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingProfile(p)} className="p-2 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 hover:text-indigo-600 dark:text-slate-300 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 bg-slate-100 hover:bg-rose-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 hover:text-indigo-600 dark:text-slate-300 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
