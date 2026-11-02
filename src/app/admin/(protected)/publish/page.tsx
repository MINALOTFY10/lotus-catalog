import React from 'react';
import { Metadata } from 'next';
import { connection } from 'next/server';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import { getVersionHistoryAction } from '@/features/admin/publish/actions';
import { PublishManagerView } from '@/features/admin/publish/PublishManagerView';

export const metadata: Metadata = {
  title: 'النشر والتراجع الفوري | لوحة تحكم لوتس',
};

export const instant = false;

export default async function AdminPublishPage() {
  await connection();
  const liveIssue = await getLiveIssue({ forceFresh: true });
  const history = await getVersionHistoryAction();

  return (
    <PublishManagerView
      currentLiveIssue={liveIssue}
      history={history}
    />
  );
}
