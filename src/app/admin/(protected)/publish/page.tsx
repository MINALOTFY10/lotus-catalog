import React from 'react';
import { Metadata } from 'next';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import { getVersionHistoryAction } from '@/features/admin/publish/actions';
import { PublishManagerView } from '@/features/admin/publish/PublishManagerView';

export const metadata: Metadata = {
  title: 'النشر والتراجع الفوري | لوحة تحكم لوتس',
};

export default async function AdminPublishPage() {
  const liveIssue = await getLiveIssue();
  const history = await getVersionHistoryAction();

  return (
    <PublishManagerView
      currentLiveIssue={liveIssue}
      history={history}
    />
  );
}
