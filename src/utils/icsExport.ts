import type { Subscription } from '../types/subscription';
import type { Bill } from '../types/bills';
import type { Document } from '../types/documents';

function toIcsDate(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

function toNextDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function toBillingCycleRRule(cycle: Subscription['billingCycle']): string {
  switch (cycle) {
    case 'Monthly':   return 'RRULE:FREQ=MONTHLY';
    case 'Yearly':    return 'RRULE:FREQ=YEARLY';
    case 'Quarterly': return 'RRULE:FREQ=MONTHLY;INTERVAL=3';
    case 'Weekly':    return 'RRULE:FREQ=WEEKLY';
  }
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatAmount(amount: number, currency: Subscription['currency']): string {
  const symbols: Record<Subscription['currency'], string> = {
    EUR: '€', INR: '₹', USD: '$', GBP: '£',
  };
  const formatted = currency === 'INR' ? Math.round(amount).toString() : amount.toFixed(2);
  return `${symbols[currency]}${formatted}`;
}

function buildSubscriptionEvent(sub: Subscription): string {
  const summary = escapeIcsText(`${sub.name} - Payment Due (${formatAmount(sub.amount, sub.currency)})`);
  const descParts = [`Billing cycle: ${sub.billingCycle}`];
  if (sub.notes) descParts.push(sub.notes);
  return [
    'BEGIN:VEVENT',
    `UID:${sub.id}@trackr`,
    `DTSTART;VALUE=DATE:${toIcsDate(sub.nextPaymentDate)}`,
    `DTEND;VALUE=DATE:${toNextDate(sub.nextPaymentDate)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${escapeIcsText(descParts.join('\\n'))}`,
    toBillingCycleRRule(sub.billingCycle),
    'CATEGORIES:SUBSCRIPTION',
    'END:VEVENT',
  ].join('\r\n');
}

function buildBillEvent(bill: Bill): string {
  const nameLabel = bill.autopay ? `${bill.name} [Autopay]` : bill.name;
  const summary = escapeIcsText(`${nameLabel} - Payment Due (${formatAmount(bill.amount, bill.currency)})`);
  const descParts = [`Billing cycle: ${bill.billingCycle}`];
  if (bill.notes) descParts.push(bill.notes);
  return [
    'BEGIN:VEVENT',
    `UID:${bill.id}@trackr`,
    `DTSTART;VALUE=DATE:${toIcsDate(bill.dueDate)}`,
    `DTEND;VALUE=DATE:${toNextDate(bill.dueDate)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${escapeIcsText(descParts.join('\\n'))}`,
    toBillingCycleRRule(bill.billingCycle),
    'CATEGORIES:BILL',
    'END:VEVENT',
  ].join('\r\n');
}

function buildDocumentEvent(doc: Document): string {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${doc.id}@trackr`,
    `DTSTART;VALUE=DATE:${toIcsDate(doc.expiryDate)}`,
    `DTEND;VALUE=DATE:${toNextDate(doc.expiryDate)}`,
    `SUMMARY:${escapeIcsText(`${doc.name} Expires`)}`,
    `DESCRIPTION:${escapeIcsText(`Category: ${doc.category}`)}`,
    'CATEGORIES:DOCUMENT',
  ];
  if (doc.reminderDaysBefore > 0) {
    lines.push(
      'BEGIN:VALARM',
      `TRIGGER:-P${doc.reminderDaysBefore}D`,
      'ACTION:DISPLAY',
      'DESCRIPTION:Document expiry reminder',
      'END:VALARM',
    );
  }
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

export function generateIcsContent(
  subscriptions: Subscription[],
  bills: Bill[],
  documents: Document[],
): string {
  const events: string[] = [];
  for (const sub of subscriptions) {
    if (sub.status === 'Active' && sub.nextPaymentDate) events.push(buildSubscriptionEvent(sub));
  }
  for (const bill of bills) {
    if (bill.status === 'Active' && bill.dueDate) events.push(buildBillEvent(bill));
  }
  for (const doc of documents) {
    if (doc.expiryDate) events.push(buildDocumentEvent(doc));
  }
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Trackr//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(content: string, filename = 'trackr-calendar.ics'): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
