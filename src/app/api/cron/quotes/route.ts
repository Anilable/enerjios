import { NextRequest, NextResponse } from 'next/server';
import { QuoteScheduler } from '@/lib/quote-scheduler';

// This endpoint can be called by a cron service (like Vercel Cron or external cron)
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication for cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting scheduled quote tasks...');
    
    await QuoteScheduler.runScheduledTasks();

    return NextResponse.json({
      success: true,
      message: 'Scheduled tasks completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error running scheduled tasks:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to run scheduled tasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task } = body;

    // Allow running specific tasks
    switch (task) {
      case 'expired':
        await QuoteScheduler.checkExpiredQuotes();
        break;
      case 'warnings':
        await QuoteScheduler.sendExpiryWarnings();
        break;
      case 'reminders':
        await QuoteScheduler.sendPendingQuoteReminders();
        break;
      case 'cleanup':
        await QuoteScheduler.cleanupOldNotifications();
        break;
      case 'analytics':
        await QuoteScheduler.generateQuoteAnalytics();
        break;
      case 'all':
      default:
        await QuoteScheduler.runScheduledTasks();
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Task '${task}' completed successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error running scheduled task:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to run scheduled task',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}