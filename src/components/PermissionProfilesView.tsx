import React, { useState } from 'react';
import { GeneralSettings, PermissionProfile, DistributorPermissions, Distributor } from '../types';
import { Shield, Plus, Edit2, Trash2, X, Check, Copy } from 'lucide-react';
import { PERMISSION_GROUPS, getDefaultDistributorPermissions, getFullPermissionsObject, getTotalPermissionsCount } from '../utils/permissions';
import { ConfirmModal } from './ConfirmModal';

interface PermissionProfilesViewProps {
  settings: GeneralSettings;
  onUpdateSettings: (settings: GeneralSettings) => void;
  distributors?: Distributor[];
  onUpdateDistributors?: (distributors: Distributor[]) => void;
  onClose?: () => void;
}

export default function PermissionProfilesView({ settings, onUpdateSettings, distributors, onUpdateDistributors, onClose }: PermissionProfilesViewProps) {
  const [profiles, setProfiles] = useState<PermissionProfile[]>(settings.permissionProfiles || []);
  const [editingProfile, setEditingProfile] = useState<PermissionProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    let savedProfile = { ...editingProfile };
    let updatedProfiles = [...profiles];
    if (editingProfile.id.startsWith('new_')) {
      savedProfile = { ...editingProfile, id: `prof_${Date.now()}` };
      updatedProfiles.push(savedProfile);
    } else {
      updatedProfiles = updatedProfiles.map(p => p.id === editingProfile.id ? savedProfile : p);
    }

    setProfiles(updatedProfiles);
    onUpdateSettings({ ...settings, permissionProfiles: updatedProfiles });

    // Auto-update distributors on this profile if handler provided
    if (distributors && onUpdateDistributors) {
      const updatedDistributors = distributors.map(d => {
        if (d?.permissionProfileId === savedProfile.id) {
          return {
            ...d,
            permissions: { ...savedProfile.permissions }
          };
        }
        return d;
      });
      onUpdateDistributors(updatedDistributors);
    }

    setShowForm(false);
    setEditingProfile(null);
  };

  const handleDeleteProfile = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "حذف قالب الصلاحيات",
      message: "هل أنت متأكد من حذف هذا القالب؟ لن يؤثر هذا على الموزعين الذين يستخدمون هذا القالب مسبقاً، ولكنه سيختفي من قائمة القوالب.",
      onConfirm: () => {
        const updatedProfiles = profiles.filter(p => p.id !== id);
        setProfiles(updatedProfiles);
        onUpdateSettings({ ...settings, permissionProfiles: updatedProfiles });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const startCreate = () => {
    setEditingProfile({
      id: `new_${Date.now()}`,
      name: "",
      description: "",
      permissions: getDefaultDistributorPermissions()
    });
    setShowForm(true);
  };

  const startEdit = (profile: PermissionProfile) => {
    setEditingProfile({ ...profile });
    setShowForm(true);
  };

  const handlePermissionChange = (key: keyof DistributorPermissions, value: boolean) => {
    if (!editingProfile) return;
    setEditingProfile({
      ...editingProfile,
      permissions: {
        ...editingProfile.permissions,
        [key]: value
      }
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 min-h-full p-4 md:p-6 rounded-2xl relative">
      <div className="w-full flex flex-wrap gap-4 items-center justify-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            إدارة قوالب الصلاحيات (Role Presets)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-bold">
            أنشئ قوالب صلاحيات جاهزة (مثل: موزع أساسي، موزع ميداني) لتطبيقها بسهولة عند إضافة الموزعين.
          </p>
        </div>
        <div className="flex gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all"
            >
              رجوع
            </button>
          )}
          {!showForm && (
            <button
              onClick={startCreate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              إنشاء قالب جديد
            </button>
          )}
        </div>
      </div>

      {!showForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-slate-500 dark:text-slate-400 font-bold">لا توجد قوالب صلاحيات محفوظة</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">انقر على "إنشاء قالب جديد" للبدء.</p>
            </div>
          ) : (
            profiles.map(profile => (
              <div key={profile.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative group hover:shadow-md transition-all">
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button onClick={() => startEdit(profile)} className="p-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteProfile(profile.id)} className="p-1.5 bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{profile.name}</h3>
                {profile.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{profile.description}</p>
                )}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
                    {Object.values(profile.permissions || {}).filter(Boolean).length} / {getTotalPermissionsCount()} صلاحيات مفعلة
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">اسم القالب <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editingProfile?.name || ""}
                  onChange={(e) => setEditingProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="مثال: موزع ميداني"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">وصف القالب (اختياري)</label>
                <input
                  type="text"
                  value={editingProfile?.description || ""}
                  onChange={(e) => setEditingProfile(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="وصف مختصر لدور هذا القالب..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">تحديد الصلاحيات الممنوحة</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditingProfile(prev => prev ? { ...prev, permissions: getFullPermissionsObject() } : null)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">تحديد الكل</button>
                  <button type="button" onClick={() => setEditingProfile(prev => prev ? { ...prev, permissions: {} as DistributorPermissions } : null)} className="text-xs font-bold text-slate-600 hover:text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">إلغاء تحديد الكل</button>
                </div>
              </div>
              
              <div className="space-y-6">
                {PERMISSION_GROUPS.map((group) => {
                  const GroupIcon = group.icon;
                  return (
                    <div key={group.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className={`p-4 border-b flex items-start gap-3 ${group.headerBg}`}>
                        <div className={`p-2 rounded-lg shrink-0 ${group.badgeColor}`}>
                          <GroupIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base">{group.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{group.description}</p>
                        </div>
                      </div>
                      <div className="px-2 py-3 text-xs md:text-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.permissions.map((perm) => {
                          const permKey = perm.key as keyof DistributorPermissions;
                          const isChecked = editingProfile?.permissions?.[permKey] || false;
                          return (
                            <label key={permKey} className={`flex items-start p-3 rounded-xl border cursor-pointer transition-colors ${isChecked ? 'bg-white border-indigo-200 shadow-sm dark:bg-indigo-900/10 dark:border-indigo-800/50' : 'bg-transparent border-slate-200 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
                              <div className="relative flex items-center mt-0.5">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handlePermissionChange(permKey, e.target.checked)}
                                  className="peer sr-only"
                                />
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600'}`}>
                                  {isChecked && <Check className="w-3.5 h-3.5 text-slate-900" />}
                                </div>
                              </div>
                              <div className="mr-3">
                                <h5 className={`text-xs font-bold leading-tight ${isChecked ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {perm.label}
                                </h5>
                                <p className="text-[10px] text-slate-500 mt-1 leading-snug">{perm.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                حفظ القالب
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
