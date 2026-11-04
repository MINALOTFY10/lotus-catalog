'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { IssueSnapshot, syncLiveIssueToSupabase, getLiveIssue, safeWriteJsonFile } from '@/features/magazine/services/publishIssue';
import { requireStaffSession } from '@/lib/auth/session';

export interface VersionHistoryRecord {
  version: number;
  publishedAt: string;
  totalPages: number;
  note?: string;
  isLive: boolean;
  snapshotPath: string;
}

function ensureVersionsDir(): string {
  const versionsDir = path.resolve(process.cwd(), 'data', 'versions');
  try {
    if (!fs.existsSync(versionsDir)) {
      fs.mkdirSync(versionsDir, { recursive: true });
    }
  } catch (err: any) {
    if (err.code !== 'EROFS' && !err.message?.includes('read-only')) {
      console.warn('ensureVersionsDir error:', err);
    }
  }
  return versionsDir;
}

function getHistoryFilePath(): string {
  return path.resolve(process.cwd(), 'data', 'version_history.json');
}

/**
 * Returns list of all previously published versions
 */
export async function getVersionHistoryAction(): Promise<VersionHistoryRecord[]> {
  await requireStaffSession();
  const historyPath = getHistoryFilePath();
  if (!fs.existsSync(historyPath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * Publishes draft as a new immutable version and sets it live
 */
export async function publishLiveIssueAction(
  note?: string
): Promise<{ success: boolean; version?: number; error?: string }> {
  try {
    await requireStaffSession();
  } catch {
    return { success: false, error: 'غير مصرح: يجب تسجيل الدخول كمسؤول' };
  }

  const liveIssuePath = path.resolve(process.cwd(), 'data', 'live_issue.json');

  try {
    const currentIssue: IssueSnapshot = await getLiveIssue({ forceFresh: true });
    if (!currentIssue) {
      return { success: false, error: 'تعذر قراءة بيانات المجلة' };
    }

    const versionsDir = ensureVersionsDir();
    const historyPath = getHistoryFilePath();

    const history: VersionHistoryRecord[] = fs.existsSync(historyPath)
      ? JSON.parse(fs.readFileSync(historyPath, 'utf8'))
      : [];

    const nextVersion = (currentIssue.version || 1) + 1;
    currentIssue.version = nextVersion;
    currentIssue.publishedAt = new Date().toISOString();

    const snapshotFilename = `version_${nextVersion}.json`;
    const snapshotPath = path.join(versionsDir, snapshotFilename);

    // Write version snapshot (safe for serverless)
    safeWriteJsonFile(snapshotPath, currentIssue);

    // Update live_issue.json and Supabase Storage
    safeWriteJsonFile(liveIssuePath, currentIssue);
    await syncLiveIssueToSupabase(currentIssue);

    // Update history registry (mark others not live)
    const newRecord: VersionHistoryRecord = {
      version: nextVersion,
      publishedAt: currentIssue.publishedAt,
      totalPages: currentIssue.totalPages,
      note: note || `إصدار المجلة رقم ${nextVersion}`,
      isLive: true,
      snapshotPath: `data/versions/${snapshotFilename}`,
    };

    const updatedHistory = history.map((h) => ({ ...h, isLive: false }));
    updatedHistory.unshift(newRecord);

    safeWriteJsonFile(historyPath, updatedHistory);

    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/magazine');
    revalidatePath('/products');
    revalidatePath('/admin/publish');

    return { success: true, version: nextVersion };
  } catch (err: any) {
    console.error('Failed to publish live issue:', err);
    return { success: false, error: err.message || 'حدث خطأ أثناء النشر' };
  }
}

/**
 * Rollback to any previous frozen version snapshot
 */
export async function rollbackToVersionAction(
  targetVersion: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireStaffSession();
  } catch {
    return { success: false, error: 'غير مصرح: يجب تسجيل الدخول كمسؤول' };
  }

  if (!Number.isInteger(targetVersion) || targetVersion <= 0) {
    return { success: false, error: 'رقم النسخة غير صالح' };
  }

  const versionsDir = ensureVersionsDir();
  const snapshotPath = path.join(versionsDir, `version_${targetVersion}.json`);
  const liveIssuePath = path.resolve(process.cwd(), 'data', 'live_issue.json');
  const historyPath = getHistoryFilePath();

  if (!fs.existsSync(snapshotPath)) {
    return { success: false, error: `النسخة رقم ${targetVersion} غير موجودة` };
  }

  try {
    const targetSnapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

    // Restore to live_issue.json and Supabase
    safeWriteJsonFile(liveIssuePath, targetSnapshot);
    await syncLiveIssueToSupabase(targetSnapshot);

    // Update history isLive flags
    if (fs.existsSync(historyPath)) {
      const history: VersionHistoryRecord[] = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      const updated = history.map((h) => ({
        ...h,
        isLive: h.version === targetVersion,
      }));
      safeWriteJsonFile(historyPath, updated);
    }

    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/magazine');
    revalidatePath('/products');
    revalidatePath('/admin/publish');

    return { success: true };
  } catch (err: any) {
    console.error('Failed to rollback:', err);
    return { success: false, error: err.message || 'فشل في استعادة الإصدار' };
  }
}
