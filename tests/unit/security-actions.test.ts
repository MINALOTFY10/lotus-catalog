import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sessionModule from '@/lib/auth/session';
import { updateProductAction, getAdminProductsList, uploadProductImageAction } from '@/features/admin/products/actions';
import { saveSlotAssignmentAction, swapPageSlotsAction, updatePageSectionTitleAction } from '@/features/admin/composer/actions';
import { publishLiveIssueAction, rollbackToVersionAction, getVersionHistoryAction } from '@/features/admin/publish/actions';

describe('Server Action Authorization Guards', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Products Admin Actions', () => {
    it('rejects updateProductAction when no session exists', async () => {
      vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
      const result = await updateProductAction('prod-1', { name_ar: 'اختبار', sale_price: 100 });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/غير مصرح|Unauthorized/i);
    });

    it('rejects getAdminProductsList when no session exists', async () => {
      vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
      await expect(getAdminProductsList()).rejects.toThrow(/غير مصرح|Unauthorized/i);
    });

    it('rejects uploadProductImageAction when no session exists', async () => {
      vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
      const fd = new FormData();
      const result = await uploadProductImageAction(fd);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/غير مصرح|Unauthorized/i);
    });
  });

  describe('Composer Admin Actions', () => {
    it('rejects saveSlotAssignmentAction when no session exists', async () => {
      vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
      const result = await saveSlotAssignmentAction(1, 1, 'prod-1');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/غير مصرح|Unauthorized/i);
    });

    it('rejects swapPageSlotsAction when no session exists', async () => {
      vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
      const result = await swapPageSlotsAction(1, 0, 1);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/غير مصرح|Unauthorized/i);
    });

    it('rejects updatePageSectionTitleAction when no session exists', async () => {
      vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
      const result = await updatePageSectionTitleAction(1, 'قسم جديد');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/غير مصرح|Unauthorized/i);
    });
  });

  describe('Publish Admin Actions', () => {
    it('rejects publishLiveIssueAction when no session exists', async () => {
      vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
      const result = await publishLiveIssueAction('Release 2');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/غير مصرح|Unauthorized/i);
    });

    it('rejects rollbackToVersionAction when no session exists', async () => {
      vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
      const result = await rollbackToVersionAction(1);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/غير مصرح|Unauthorized/i);
    });

    it('rejects getVersionHistoryAction when no session exists', async () => {
      vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
      await expect(getVersionHistoryAction()).rejects.toThrow(/غير مصرح|Unauthorized/i);
    });
  });
});
