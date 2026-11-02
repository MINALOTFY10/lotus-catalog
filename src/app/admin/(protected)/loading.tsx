import React from 'react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-amber-900/20 border-t-[#B68763] animate-spin" />
      </div>
      <p className="text-sm font-bold text-stone-600 animate-pulse">
        جاري تحميل البيانات الحية...
      </p>
    </div>
  );
}
