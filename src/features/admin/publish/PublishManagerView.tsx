'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IssueSnapshot } from '@/features/magazine/types';
import {
  VersionHistoryRecord,
  publishLiveIssueAction,
  rollbackToVersionAction,
} from './actions';

interface PublishManagerViewProps {
  currentLiveIssue: IssueSnapshot;
  history: VersionHistoryRecord[];
}

export function PublishManagerView({
  currentLiveIssue,
  history,
}: PublishManagerViewProps) {
  const router = useRouter();
  const [releaseNote, setReleaseNote] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [rollingBackVersion, setRollingBackVersion] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setFeedback(null);

    const res = await publishLiveIssueAction(releaseNote.trim());
    if (res.success) {
      setFeedback({
        text: `تم تجميد ونشر الإصدار V${res.version} للعامة وتحديث الكاش بنجاح!`,
        type: 'success',
      });
      setReleaseNote('');
      router.refresh();
    } else {
      setFeedback({ text: res.error || 'حدث خطأ أثناء النشر', type: 'error' });
    }
    setPublishing(false);
  };

  const handleRollback = async (version: number) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في استعادة الإصدار V${version} فوراً؟`)) {
      return;
    }

    setRollingBackVersion(version);
    setFeedback(null);

    const res = await rollbackToVersionAction(version);
    if (res.success) {
      setFeedback({
        text: `تم استعادة الإصدار V${version} بنجاح إلى النسخة الحية!`,
        type: 'success',
      });
      router.refresh();
    } else {
      setFeedback({ text: res.error || 'فشل في استعادة الإصدار', type: 'error' });
    }
    setRollingBackVersion(null);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#443000]">النشر والتراجع الفوري للإصدارات</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          تجميد مسودة المجلة في إصدار رقمي ثابت ونشره للجمهور مع إمكانية التراجع لأي إصدار سابق بنقرة واحدة
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold text-center border animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Grid: Current Live Status & Publish Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Live Issue Card */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#B68763] bg-[#B68763]/10 px-3 py-1 rounded-full">
                الإصدار النشط حالياً في الموقع
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                مباشر للجمهور (Live)
              </span>
            </div>

            <div className="flex items-center gap-4 my-4">
              <div className="w-16 h-16 rounded-2xl bg-[#443000] text-[#B68763] flex flex-col items-center justify-center font-extrabold shadow-sm">
                <span className="text-[10px] text-stone-300">الإصدار</span>
                <span className="text-2xl font-mono">V{currentLiveIssue.version}</span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#443000]">
                  {currentLiveIssue.title_ar}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  تاريخ النشر:{' '}
                  {new Date(currentLiveIssue.publishedAt).toLocaleString('ar-EG')}
                </p>
                <p className="text-xs text-stone-500">
                  عدد الصفحات الإجمالي: <strong className="text-stone-700">{currentLiveIssue.totalPages} صفحة</strong>
                </p>

              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
            <Link
              href="/magazine"
              target="_blank"
              className="flex-1 text-center bg-stone-100 hover:bg-stone-200 text-[#443000] text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>فتح المجلة الحية</span>
              <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <Link
              href="/admin/composer"
              className="text-center bg-[#443000] hover:bg-[#5c4205] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              تحرير الصفحات
            </Link>
          </div>
        </div>

        {/* Publish New Version Form */}
        <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-3xl p-6 border border-amber-900/15 shadow-xs flex flex-col justify-between">
          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <span className="text-xs font-bold text-[#443000] bg-amber-100 px-3 py-1 rounded-full">
                نشر إصدار جديد
              </span>
              <h3 className="text-base font-extrabold text-[#443000] mt-2">
                تجميد المسودة الحالية ونشر V{(currentLiveIssue.version || 1) + 1}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                سيتم أخذ لقطة غير قابلة للتعديل من جميع الصفحات وتحديث الكتالوج العام للمستخدمين مباشرة.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ملاحظات الإصدار (اختياري)
              </label>
              <input
                type="text"
                value={releaseNote}
                onChange={(e) => setReleaseNote(e.target.value)}
                placeholder="مثال: تحديث أسعار الصندوق وإضافة منتجات الفخار الجديدة..."
                className="w-full text-xs bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-[#B68763]"
              />
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="w-full bg-[#443000] hover:bg-[#5c4205] text-white text-xs font-black py-3 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{publishing ? 'جاري التجميد والنشر...' : `نشر الإصدار V${(currentLiveIssue.version || 1) + 1} للعامة الآن`}</span>
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Version History Table */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
        <h3 className="text-base font-extrabold text-[#443000] mb-4">
          سجل الإصدارات السابقة (Version History & Rollback)
        </h3>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            الإصدار الحالي V{currentLiveIssue.version} هو الإصدار الأولي النشط. ستظهر الإصدارات المستقبلية هنا بعد النشر.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                  <th className="py-3 px-4">رقم الإصدار</th>
                  <th className="py-3 px-4">تاريخ النشر</th>
                  <th className="py-3 px-4">ملاحظات الإصدار</th>
                  <th className="py-3 px-4">الصفحات</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {history.map((rec) => (
                  <tr key={rec.version} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-mono font-extrabold text-[#443000]">
                      V{rec.version}
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {new Date(rec.publishedAt).toLocaleString('ar-EG')}
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-700">
                      {rec.note || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600">
                      {rec.totalPages} صفحة
                    </td>
                    <td className="py-3 px-4">
                      {rec.isLive ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          ● نشط حالياً
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-stone-400">
                          مؤرشف
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {!rec.isLive && (
                        <button
                          onClick={() => handleRollback(rec.version)}
                          disabled={rollingBackVersion === rec.version}
                          className="bg-amber-100/70 hover:bg-amber-200 text-[#443000] text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {rollingBackVersion === rec.version ? 'جاري الاستعادة...' : 'استعادة هذا الإصدار'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
