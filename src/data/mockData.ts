// Mock data for Telescope Dashboard

const now = Date.now();
const ago = (mins: number) => new Date(now - mins * 60000).toISOString();

export interface TelescopeEntry {
  id: string;
  type: string;
  timestamp: string;
  batchId?: string;
}

export interface RequestEntry extends TelescopeEntry {
  type: 'request';
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  ip: string;
  headers?: Record<string, string>;
  payload?: any;
  response?: any;
}

export interface ClientRequestEntry extends TelescopeEntry {
  type: 'client_request';
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  provider: string;
  payload?: any;
  response?: any;
}

export interface JobEntry extends TelescopeEntry {
  type: 'job';
  name: string;
  queue: string;
  status: 'processed' | 'failed' | 'pending';
  duration: number;
  attempts: number;
  connection: string;
  payload?: any;
  exception?: string;
}

export interface ExceptionEntry extends TelescopeEntry {
  type: 'exception';
  class: string;
  message: string;
  file: string;
  line: number;
  occurrences: number;
  stackTrace: string[];
}

export interface LogEntry extends TelescopeEntry {
  type: 'log';
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
}

export interface QueryEntry extends TelescopeEntry {
  type: 'query';
  sql: string;
  duration: number;
  connection: string;
  slow: boolean;
}

export interface MailEntry extends TelescopeEntry {
  type: 'mail';
  to: string;
  subject: string;
  mailable: string;
  status: 'sent' | 'failed' | 'queued';
}

export interface EventEntry extends TelescopeEntry {
  type: 'event';
  name: string;
  listeners: string[];
  payload?: Record<string, any>;
  broadcast: boolean;
}

export interface CacheEntry extends TelescopeEntry {
  type: 'cache';
  operation: 'hit' | 'miss' | 'set' | 'forget';
  key: string;
  ttl?: number;
  value?: string;
}

export interface CommandEntry extends TelescopeEntry {
  type: 'command';
  command: string;
  exitCode: number;
  duration: number;
  arguments: string[];
  options: Record<string, string>;
}

export type AnyEntry = RequestEntry | ClientRequestEntry | JobEntry | ExceptionEntry | LogEntry | QueryEntry | MailEntry | EventEntry | CacheEntry | CommandEntry;

// Batch IDs to link related entries
const batches = ['b-001', 'b-002', 'b-003', 'b-004', 'b-005'];

export const requests: RequestEntry[] = [
  { id: 'req-001', type: 'request', method: 'POST', url: '/api/webhooks/bspay', statusCode: 200, duration: 245, ip: '45.32.10.5', timestamp: ago(2), batchId: 'b-001', headers: { 'Content-Type': 'application/json', 'X-Signature': 'sha256=abc123' }, payload: { event: 'payment.confirmed', transaction_id: 'txn_8827', amount: 15000 }, response: { status: 'received' } },
  { id: 'req-002', type: 'request', method: 'POST', url: '/api/webhooks/suitpay', statusCode: 200, duration: 189, ip: '52.14.88.3', timestamp: ago(5), batchId: 'b-002', headers: { 'Content-Type': 'application/json' }, payload: { type: 'pix.received', value: 25000 }, response: { ok: true } },
  { id: 'req-003', type: 'request', method: 'GET', url: '/api/admin/transactions', statusCode: 200, duration: 120, ip: '192.168.1.10', timestamp: ago(8) },
  { id: 'req-004', type: 'request', method: 'POST', url: '/api/checkout/create', statusCode: 422, duration: 35, ip: '189.40.55.12', timestamp: ago(10), payload: { amount: -100 }, response: { error: 'Validation failed', errors: { amount: ['Must be positive'] } } },
  { id: 'req-005', type: 'request', method: 'GET', url: '/api/merchant/balance', statusCode: 200, duration: 88, ip: '10.0.0.5', timestamp: ago(12) },
  { id: 'req-006', type: 'request', method: 'POST', url: '/api/webhooks/ezzebank', statusCode: 500, duration: 3200, ip: '34.95.12.77', timestamp: ago(15), batchId: 'b-003' },
  { id: 'req-007', type: 'request', method: 'GET', url: '/api/admin/dashboard', statusCode: 200, duration: 340, ip: '192.168.1.10', timestamp: ago(18) },
  { id: 'req-008', type: 'request', method: 'POST', url: '/api/pix/generate', statusCode: 201, duration: 520, ip: '189.40.55.12', timestamp: ago(22), batchId: 'b-004' },
  { id: 'req-009', type: 'request', method: 'DELETE', url: '/api/admin/cache', statusCode: 204, duration: 12, ip: '192.168.1.10', timestamp: ago(25) },
  { id: 'req-010', type: 'request', method: 'POST', url: '/api/webhooks/bspay', statusCode: 200, duration: 198, ip: '45.32.10.5', timestamp: ago(30), batchId: 'b-005' },
];

export const clientRequests: ClientRequestEntry[] = [
  { id: 'creq-001', type: 'client_request', method: 'POST', url: 'https://api.bspay.com/v1/status', statusCode: 200, duration: 340, provider: 'BSPAY', timestamp: ago(2), batchId: 'b-001', payload: { transaction_id: 'txn_8827' }, response: { status: 'confirmed' } },
  { id: 'creq-002', type: 'client_request', method: 'POST', url: 'https://merchant.example.com/postback', statusCode: 200, duration: 120, provider: 'Postback', timestamp: ago(2), batchId: 'b-001' },
  { id: 'creq-003', type: 'client_request', method: 'POST', url: 'https://api.suitpay.io/pix/confirm', statusCode: 200, duration: 450, provider: 'SuitPay', timestamp: ago(5), batchId: 'b-002' },
  { id: 'creq-004', type: 'client_request', method: 'POST', url: 'https://api.ezzebank.com/webhook/ack', statusCode: 504, duration: 30000, provider: 'EzzeBank', timestamp: ago(15), batchId: 'b-003' },
  { id: 'creq-005', type: 'client_request', method: 'POST', url: 'https://api.bspay.com/v1/pix/create', statusCode: 201, duration: 890, provider: 'BSPAY', timestamp: ago(22), batchId: 'b-004' },
  { id: 'creq-006', type: 'client_request', method: 'POST', url: 'https://merchant2.example.com/callback', statusCode: 200, duration: 95, provider: 'Postback', timestamp: ago(30), batchId: 'b-005' },
];

export const jobs: JobEntry[] = [
  { id: 'job-001', type: 'job', name: 'ProcessWebhook', queue: 'webhooks', status: 'processed', duration: 1200, attempts: 1, connection: 'redis', timestamp: ago(2), batchId: 'b-001' },
  { id: 'job-002', type: 'job', name: 'SendPostback', queue: 'postbacks', status: 'processed', duration: 340, attempts: 1, connection: 'redis', timestamp: ago(2), batchId: 'b-001' },
  { id: 'job-003', type: 'job', name: 'ProcessWebhook', queue: 'webhooks', status: 'processed', duration: 980, attempts: 1, connection: 'redis', timestamp: ago(5), batchId: 'b-002' },
  { id: 'job-004', type: 'job', name: 'ProcessWebhook', queue: 'webhooks', status: 'failed', duration: 30000, attempts: 3, connection: 'redis', timestamp: ago(15), batchId: 'b-003', exception: 'GuzzleHttp\\Exception\\ConnectException: cURL error 28: Connection timed out' },
  { id: 'job-005', type: 'job', name: 'SendNotification', queue: 'notifications', status: 'processed', duration: 220, attempts: 1, connection: 'redis', timestamp: ago(18) },
  { id: 'job-006', type: 'job', name: 'GeneratePixQRCode', queue: 'pix', status: 'processed', duration: 1500, attempts: 1, connection: 'redis', timestamp: ago(22), batchId: 'b-004' },
  { id: 'job-007', type: 'job', name: 'SendPostback', queue: 'postbacks', status: 'pending', duration: 0, attempts: 0, connection: 'redis', timestamp: ago(1) },
  { id: 'job-008', type: 'job', name: 'ReconcileTransactions', queue: 'default', status: 'processed', duration: 45000, attempts: 1, connection: 'redis', timestamp: ago(60) },
];

export const exceptions: ExceptionEntry[] = [
  { id: 'exc-001', type: 'exception', class: 'GuzzleHttp\\Exception\\ConnectException', message: 'cURL error 28: Connection timed out after 30000ms', file: 'app/Services/EzzeBankService.php', line: 142, occurrences: 3, timestamp: ago(15), batchId: 'b-003', stackTrace: ['#0 app/Services/EzzeBankService.php:142', '#1 app/Jobs/ProcessWebhook.php:58', '#2 vendor/laravel/framework/src/Queue/Worker.php:367'] },
  { id: 'exc-002', type: 'exception', class: 'Illuminate\\Validation\\ValidationException', message: 'The given data was invalid.', file: 'app/Http/Controllers/CheckoutController.php', line: 45, occurrences: 12, timestamp: ago(10), stackTrace: ['#0 app/Http/Controllers/CheckoutController.php:45', '#1 vendor/laravel/framework/src/Routing/Controller.php:54'] },
  { id: 'exc-003', type: 'exception', class: 'App\\Exceptions\\InsufficientBalanceException', message: 'Merchant balance insufficient for withdrawal of R$ 5.000,00', file: 'app/Services/WithdrawalService.php', line: 89, occurrences: 1, timestamp: ago(35), stackTrace: ['#0 app/Services/WithdrawalService.php:89', '#1 app/Http/Controllers/MerchantController.php:120'] },
  { id: 'exc-004', type: 'exception', class: 'RuntimeException', message: 'Redis connection refused', file: 'vendor/predis/predis/src/Connection/StreamConnection.php', line: 128, occurrences: 5, timestamp: ago(45), stackTrace: ['#0 vendor/predis/predis/src/Connection/StreamConnection.php:128'] },
];

export const logs: LogEntry[] = [
  { id: 'log-001', type: 'log', level: 'info', message: 'Webhook received from BSPAY for transaction txn_8827', timestamp: ago(2), context: { provider: 'BSPAY', transaction_id: 'txn_8827', amount: 15000 } },
  { id: 'log-002', type: 'log', level: 'info', message: 'Payment confirmed. Updating transaction status to paid.', timestamp: ago(2), context: { transaction_id: 'txn_8827' } },
  { id: 'log-003', type: 'log', level: 'warning', message: 'Slow query detected: 245ms on transactions table', timestamp: ago(3), context: { duration_ms: 245, table: 'transactions' } },
  { id: 'log-004', type: 'log', level: 'error', message: 'Failed to connect to EzzeBank API after 3 attempts', timestamp: ago(15), context: { provider: 'EzzeBank', attempts: 3, last_error: 'Connection timed out' } },
  { id: 'log-005', type: 'log', level: 'info', message: 'PIX QR code generated successfully', timestamp: ago(22), context: { transaction_id: 'txn_9912', provider: 'BSPAY' } },
  { id: 'log-006', type: 'log', level: 'warning', message: 'Rate limit approaching for BSPAY API: 85/100 requests', timestamp: ago(28) },
  { id: 'log-007', type: 'log', level: 'info', message: 'Daily reconciliation completed. 342 transactions processed.', timestamp: ago(60) },
  { id: 'log-008', type: 'log', level: 'error', message: 'Redis connection lost. Reconnecting...', timestamp: ago(45) },
  { id: 'log-009', type: 'log', level: 'debug', message: 'Cache key merchant:balance:42 expired', timestamp: ago(50) },
];

export const queries: QueryEntry[] = [
  { id: 'qry-001', type: 'query', sql: "UPDATE transactions SET status = 'paid', paid_at = NOW() WHERE id = 8827", duration: 12, connection: 'mysql', slow: false, timestamp: ago(2), batchId: 'b-001' },
  { id: 'qry-002', type: 'query', sql: "SELECT * FROM transactions WHERE merchant_id = 42 AND created_at > '2024-01-01' ORDER BY created_at DESC LIMIT 50", duration: 245, connection: 'mysql', slow: true, timestamp: ago(3) },
  { id: 'qry-003', type: 'query', sql: "INSERT INTO webhook_logs (provider, payload, received_at) VALUES ('suitpay', '{...}', NOW())", duration: 8, connection: 'mysql', slow: false, timestamp: ago(5), batchId: 'b-002' },
  { id: 'qry-004', type: 'query', sql: "SELECT balance FROM merchant_wallets WHERE merchant_id = 42 FOR UPDATE", duration: 156, connection: 'mysql', slow: true, timestamp: ago(8) },
  { id: 'qry-005', type: 'query', sql: "UPDATE merchant_wallets SET balance = balance + 15000 WHERE merchant_id = 42", duration: 5, connection: 'mysql', slow: false, timestamp: ago(2), batchId: 'b-001' },
  { id: 'qry-006', type: 'query', sql: "SELECT COUNT(*) as total, status FROM transactions WHERE DATE(created_at) = CURDATE() GROUP BY status", duration: 320, connection: 'mysql-read', slow: true, timestamp: ago(18) },
];

export const mails: MailEntry[] = [
  { id: 'mail-001', type: 'mail', to: 'merchant@example.com', subject: 'Payment Received - R$ 150,00', mailable: 'App\\Mail\\PaymentReceivedMail', status: 'sent', timestamp: ago(2) },
  { id: 'mail-002', type: 'mail', to: 'admin@gateway.com', subject: 'Daily Report - Jan 15', mailable: 'App\\Mail\\DailyReportMail', status: 'sent', timestamp: ago(60) },
  { id: 'mail-003', type: 'mail', to: 'merchant2@example.com', subject: 'Withdrawal Approved - R$ 5.000,00', mailable: 'App\\Mail\\WithdrawalApprovedMail', status: 'queued', timestamp: ago(35) },
  { id: 'mail-004', type: 'mail', to: 'support@gateway.com', subject: 'Alert: EzzeBank API Down', mailable: 'App\\Mail\\AlertMail', status: 'sent', timestamp: ago(15) },
];

export const events: EventEntry[] = [
  { id: 'evt-001', type: 'event', name: 'PaymentConfirmed', listeners: ['UpdateTransactionStatus', 'NotifyMerchant', 'UpdateBalance'], payload: { transaction_id: 'txn_8827', amount: 15000, provider: 'BSPAY' }, broadcast: true, timestamp: ago(2), batchId: 'b-001' },
  { id: 'evt-002', type: 'event', name: 'WebhookReceived', listeners: ['LogWebhook', 'DispatchProcessJob'], payload: { provider: 'suitpay', type: 'pix.received' }, broadcast: false, timestamp: ago(5), batchId: 'b-002' },
  { id: 'evt-003', type: 'event', name: 'PaymentFailed', listeners: ['NotifyMerchant', 'LogFailure'], payload: { transaction_id: 'txn_9001', reason: 'timeout' }, broadcast: true, timestamp: ago(15), batchId: 'b-003' },
  { id: 'evt-004', type: 'event', name: 'PixGenerated', listeners: ['NotifyCheckout', 'SetExpiration'], payload: { transaction_id: 'txn_9912' }, broadcast: true, timestamp: ago(22), batchId: 'b-004' },
  { id: 'evt-005', type: 'event', name: 'PostbackSent', listeners: ['LogPostback'], payload: { merchant_id: 42, url: 'https://merchant.example.com/postback' }, broadcast: false, timestamp: ago(2), batchId: 'b-001' },
];

export const cacheEntries: CacheEntry[] = [
  { id: 'cache-001', type: 'cache', operation: 'hit', key: 'merchant:balance:42', ttl: 300, timestamp: ago(8) },
  { id: 'cache-002', type: 'cache', operation: 'miss', key: 'transaction:txn_8827:status', timestamp: ago(2) },
  { id: 'cache-003', type: 'cache', operation: 'set', key: 'transaction:txn_8827:status', ttl: 600, value: 'paid', timestamp: ago(2), batchId: 'b-001' },
  { id: 'cache-004', type: 'cache', operation: 'hit', key: 'config:gateway:rates', ttl: 3600, timestamp: ago(10) },
  { id: 'cache-005', type: 'cache', operation: 'forget', key: 'merchant:balance:42', timestamp: ago(2), batchId: 'b-001' },
  { id: 'cache-006', type: 'cache', operation: 'miss', key: 'provider:ezzebank:status', timestamp: ago(15) },
  { id: 'cache-007', type: 'cache', operation: 'set', key: 'provider:ezzebank:status', ttl: 60, value: 'down', timestamp: ago(15), batchId: 'b-003' },
];

export const commands: CommandEntry[] = [
  { id: 'cmd-001', type: 'command', command: 'transactions:reconcile', exitCode: 0, duration: 45000, arguments: ['--date=2024-01-15'], options: { '--force': 'false', '--provider': 'all' }, timestamp: ago(60) },
  { id: 'cmd-002', type: 'command', command: 'queue:retry', exitCode: 0, duration: 1200, arguments: ['job-004'], options: {}, timestamp: ago(14) },
  { id: 'cmd-003', type: 'command', command: 'cache:clear', exitCode: 0, duration: 340, arguments: [], options: { '--tags': 'merchants' }, timestamp: ago(25) },
  { id: 'cmd-004', type: 'command', command: 'horizon:snapshot', exitCode: 0, duration: 890, arguments: [], options: {}, timestamp: ago(30) },
  { id: 'cmd-005', type: 'command', command: 'providers:health-check', exitCode: 1, duration: 31000, arguments: [], options: { '--provider': 'ezzebank' }, timestamp: ago(15) },
];

// Summary stats
export const stats = {
  requests: requests.length,
  clientRequests: clientRequests.length,
  jobs: jobs.length,
  exceptions: exceptions.length,
  logs: logs.length,
  queries: queries.length,
  mails: mails.length,
  events: events.length,
  cache: cacheEntries.length,
  commands: commands.length,
  errorRate: ((exceptions.length / requests.length) * 100).toFixed(1),
  slowQueries: queries.filter(q => q.slow).length,
  failedJobs: jobs.filter(j => j.status === 'failed').length,
  pendingJobs: jobs.filter(j => j.status === 'pending').length,
};

// Activity data for chart (last 24h)
export const activityData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${23 - i}h`,
  requests: Math.floor(Math.random() * 50) + 10,
  exceptions: Math.floor(Math.random() * 5),
  jobs: Math.floor(Math.random() * 30) + 5,
  queries: Math.floor(Math.random() * 200) + 50,
})).reverse();

// All entries combined for timeline
export const allEntries: AnyEntry[] = [
  ...requests, ...clientRequests, ...jobs, ...exceptions,
  ...logs, ...queries, ...mails, ...events, ...cacheEntries, ...commands,
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
