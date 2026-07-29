import React, { useState } from 'react';
import { Key, CheckSquare, Square, Search, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { DistributorPermissions } from '../types';
import { PERMISSION_GROUPS, getEnabledCount, getFullPermissionsObject, getTotalPermissionsCount } from '../utils/permissions';

interface Props {
  permissions: DistributorPermissions;
  onChange: (permissions: DistributorPermissions) => void;
  isModal?: boolean;
  allowedPermissions?: DistributorPermissions;
}

export function DistributorPermissionsFilterable({ permissions, onChange, isModal = false, allowedPermissions }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTabGroup, setActiveTabGroup] = useState<string>("all");
  
  const totalPermsCount = getTotalPermissionsCount(allowedPermissions);
  const enabledCount = getEnabledCount(permissions);

  const grantAll = () => {
    if (allowedPermissions) {
      const restrictedAll = getFullPermissionsObject();
      for (const key in restrictedAll) {
        if (!allowedPermissions[key as keyof DistributorPermissions]) {
          delete restrictedAll[key as keyof DistributorPermissions];
        }
      }
      onChange(restrictedAll);
    } else {
      onChange(getFullPermissionsObject());
    }
  };
  const revokeAll = () => onChange({});

  const filteredGroups = PERMISSION_GROUPS.map(group => {
    return {
      ...group,
      permissions: group.permissions.filter(p => {
        if (allowedPermissions && !allowedPermissions[p.key as keyof DistributorPermissions]) {
          return false;
        }
        return p.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
               p.desc.toLowerCase().includes(searchTerm.toLowerCase());
      })
    };
  }).filter(group => group.permissions.length > 0);

  const groupsToDisplay = filteredGroups.filter(g => activeTabGroup === "all" || activeTabGroup === g?.id);

  return (
    <div className={`bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col ${isModal ? 'flex-1 overflow-hidden' : 'space-y-4'}`}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 ${isModal ? 'p-2 bg-white dark:bg-slate-900 rounded-t-xl' : 'pb-3'}`}>
        <div className="flex items-center justify-between w-full sm:w-auto">
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-500" />
            <span>{isModal ? "تخصيص صلاحيات وأوامر الريديوس الممنوحة:" : "تخصيص الصلاحيات"}</span>
          </h4>
          <span className="hidden sm:inline-flex px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded-md text-[10px] font-black mr-2">
            {enabledCount} من {totalPermsCount} مفعّل
          </span>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={grantAll}
            className="flex-1 sm:flex-none px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            تحديد الكل
          </button>
          <button
            type="button"
            onClick={revokeAll}
            className="flex-1 sm:flex-none px-2.5 py-1.5 bg-rose-50 hover:bg-indigo-100 dark:bg-rose-950/60 text-indigo-700 dark:text-indigo-300 border border-rose-200 dark:border-rose-800 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5" />
            إلغاء الكل
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className={`flex flex-col sm:flex-row gap-3 ${isModal ? 'px-2 pt-2' : ''}`}>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث عن صلاحية أو أمر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTabGroup("all")}
            className={`whitespace-normal break-words px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTabGroup === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            الكل
          </button>
          {PERMISSION_GROUPS.map((group) => {
            const isSelected = activeTabGroup === group?.id;
            return (
              <button
                type="button"
                key={group?.id}
                onClick={() => setActiveTabGroup(group?.id)}
                className={`whitespace-normal break-words px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{group.title.split(". ")[1] || group.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permissions List Scrollable Container */}
      <div className={`overflow-y-auto space-y-4 pl-1 pr-1 ${isModal ? 'flex-1 p-2' : 'max-h-[400px]'}`}>
        {groupsToDisplay.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <Search className="w-10 h-10 mb-3 opacity-50" />
            <span className="font-bold text-sm">لم يتم العثور على صلاحيات تطابق بحثك</span>
          </div>
        ) : (
          groupsToDisplay.map((group) => {
            const GroupIcon = group.icon;
            // Get original length to show correctly
            const originalGroup = PERMISSION_GROUPS.find(g => g?.id === group?.id)!;
            const enabledInGroup = originalGroup.permissions.filter(p => !!(permissions as any)[p.key]).length;

            return (
              <div key={group?.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className={`p-3.5 border-b dark:border-slate-800 flex items-center justify-between ${group.headerBg}`}>
                  <div className="flex items-center gap-2.5">
                    <GroupIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{group.title}</h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{group.description}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border ${group.badgeColor}`}>
                    مفعّل: {enabledInGroup} من {originalGroup.permissions.length}
                  </span>
                </div>
                
                <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.permissions.map((perm) => {
                    const isChecked = !!(permissions as any)[perm.key];
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            onChange({
                              ...permissions,
                              [perm.key]: e.target.checked
                            });
                          }}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 shrink-0"
                        />
                        <div>
                          <span className="font-black block text-[11px] leading-tight mb-1">{perm.label}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block leading-tight">{perm.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
