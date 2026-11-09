import { MarketingSettings } from '../models/MarketingSettings.js';
import { generateDailyWebsiteCampaigns } from './websiteMarketingEngine.js';
import { processNewApprovedPropertyMarketing } from './propertyMarketingEngine.js';
import { Property } from '../models/Property.js';
import { AuditLog } from '../models/AuditLog.js';

export interface SchedulerExecutionReport {
  executionTimestamp: Date;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'SKIPPED';
  engine1Result?: {
    generatedCount: number;
    skippedCooldownCount: number;
  };
  engine2Result?: {
    scannedProperties: number;
    draftsCreated: number;
  };
  error?: string;
}

let schedulerInterval: NodeJS.Timeout | null = null;
let lastExecutedDateString = '';

/**
 * Runs the daily automated campaign generation cycle.
 * Respects settings, executes idempotently, and logs audit record.
 */
export async function executeScheduledCampaignCycle(
  triggerType: 'CRON_SCHEDULED' | 'MANUAL_OVERRIDE' = 'CRON_SCHEDULED'
): Promise<SchedulerExecutionReport> {
  const now = new Date();
  const report: SchedulerExecutionReport = {
    executionTimestamp: now,
    status: 'SUCCESS',
  };

  try {
    const settings = await MarketingSettings.findOne();

    // 1. Engine 1: Daily Website Marketing
    if (settings?.enableWebsiteMarketing !== false) {
      const e1Result = await generateDailyWebsiteCampaigns();
      report.engine1Result = {
        generatedCount: e1Result.generatedCount,
        skippedCooldownCount: e1Result.skippedCooldownCount,
      };
    }

    // 2. Engine 2: Property Marketing Scan (processes approved properties that don't have drafts yet)
    if (settings?.enablePropertyMarketing !== false) {
      const approvedProps = await Property.find({ status: 'APPROVED' })
        .sort({ createdAt: -1 })
        .limit(10);

      let totalE2Drafts = 0;
      for (const prop of approvedProps) {
        const res = await processNewApprovedPropertyMarketing(prop._id);
        totalE2Drafts += res.draftsCreated.length;
      }

      report.engine2Result = {
        scannedProperties: approvedProps.length,
        draftsCreated: totalE2Drafts,
      };
    }

    // Log to AuditLog
    await AuditLog.create({
      adminEmail: 'SYSTEM_MARKETING_SCHEDULER',
      action: 'STATUS_CHANGED',
      details: {
        action: 'SCHEDULED_CAMPAIGN_CYCLE_COMPLETED',
        triggerType,
        report,
      },
      ipAddress: '127.0.0.1',
      timestamp: now,
    });

    console.log(
      `[Marketing Scheduler] Cycle completed (${triggerType}): E1 Generated: ${report.engine1Result?.generatedCount || 0}, E2 Generated: ${report.engine2Result?.draftsCreated || 0}`
    );

    return report;
  } catch (error: any) {
    report.status = 'FAILED';
    report.error = error?.message || 'Unknown scheduler error';
    console.error('[Marketing Scheduler] Error running campaign cycle:', error);

    try {
      await AuditLog.create({
        adminEmail: 'SYSTEM_MARKETING_SCHEDULER',
        action: 'STATUS_CHANGED',
        details: {
          action: 'SCHEDULED_CAMPAIGN_CYCLE_FAILED',
          triggerType,
          error: report.error,
        },
        ipAddress: '127.0.0.1',
        timestamp: now,
      });
    } catch {
      // Ignore secondary logging failure
    }

    return report;
  }
}

/**
 * Initializes the background scheduler loop.
 * Runs check every minute against Asia/Karachi local time.
 */
export function startMarketingScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  console.log('[Marketing Scheduler] Initialized background scheduler (Timezone: Asia/Karachi).');

  schedulerInterval = setInterval(async () => {
    try {
      // Format current time in Asia/Karachi timezone
      const karachiTimeStr = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date());

      const karachiDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Karachi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());

      const settings = await MarketingSettings.findOne();
      const targetTime = settings?.dailyGenerationTime || '10:00';

      // Check if time matches target time and hasn't already run today
      if (karachiTimeStr === targetTime && lastExecutedDateString !== karachiDateStr) {
        lastExecutedDateString = karachiDateStr;
        console.log(`[Marketing Scheduler] Triggering daily run at ${targetTime} PKT for ${karachiDateStr}...`);
        await executeScheduledCampaignCycle('CRON_SCHEDULED');
      }
    } catch (err) {
      console.warn('[Marketing Scheduler] Polling tick error:', err);
    }
  }, 60000); // 60s tick
}

export function stopMarketingScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}
