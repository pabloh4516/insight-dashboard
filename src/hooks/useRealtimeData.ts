import { useState, useEffect, useCallback } from 'react';
import { AnyEntry, RequestEntry, ClientRequestEntry, JobEntry, ExceptionEntry, LogEntry, QueryEntry, MailEntry, EventEntry, CacheEntry, CommandEntry } from '@/data/mockData';

const generateRandomEntry = (): AnyEntry => {
  const now = new Date().toISOString();
  const types = ['request', 'client_request', 'job', 'exception', 'log', 'query', 'mail', 'event', 'cache', 'command'];
  const type = types[Math.floor(Math.random() * types.length)];

  const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  switch (type) {
    case 'request': {
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      const urls = ['/api/webhooks/bspay', '/api/webhooks/suitpay', '/api/checkout/create', '/api/merchant/balance', '/api/admin/dashboard'];
      const statuses = [200, 201, 400, 422, 500];
      return {
        id,
        type: 'request',
        method: methods[Math.floor(Math.random() * methods.length)],
        url: urls[Math.floor(Math.random() * urls.length)],
        statusCode: statuses[Math.floor(Math.random() * statuses.length)],
        duration: Math.floor(Math.random() * 3000) + 10,
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        timestamp: now,
      } as RequestEntry;
    }
    case 'client_request': {
      const methods = ['POST', 'GET'];
      const providers = ['BSPAY', 'SuitPay', 'EzzeBank'];
      const urls = ['https://api.bspay.com/v1/status', 'https://api.suitpay.io/pix/confirm', 'https://api.ezzebank.com/webhook'];
      return {
        id,
        type: 'client_request',
        method: methods[Math.floor(Math.random() * methods.length)],
        url: urls[Math.floor(Math.random() * urls.length)],
        statusCode: Math.random() > 0.1 ? 200 : 504,
        duration: Math.floor(Math.random() * 5000) + 100,
        provider: providers[Math.floor(Math.random() * providers.length)],
        timestamp: now,
      } as ClientRequestEntry;
    }
    case 'job': {
      const names = ['ProcessWebhook', 'SendPostback', 'SendNotification', 'GeneratePixQRCode', 'ReconcileTransactions'];
      const statuses = ['processed', 'processed', 'processed', 'failed', 'pending'] as const;
      return {
        id,
        type: 'job',
        name: names[Math.floor(Math.random() * names.length)],
        queue: 'default',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        duration: Math.floor(Math.random() * 30000),
        attempts: Math.floor(Math.random() * 3) + 1,
        connection: 'redis',
        timestamp: now,
      } as JobEntry;
    }
    case 'exception': {
      const messages = ['Connection timeout', 'Validation failed', 'Insufficient balance', 'Redis connection refused'];
      return {
        id,
        type: 'exception',
        class: 'Exception',
        message: messages[Math.floor(Math.random() * messages.length)],
        file: 'app/Service.php',
        line: Math.floor(Math.random() * 200) + 1,
        occurrences: 1,
        stackTrace: ['#0 app/Service.php:' + Math.floor(Math.random() * 200)],
        timestamp: now,
      } as ExceptionEntry;
    }
    case 'log': {
      const levels = ['info', 'info', 'info', 'warning', 'error', 'debug'] as const;
      const logHosts = ['pay.checkout.store', 'api.gateway.com', 'webhook.bspay.io', 'pix.suitpay.com', 'admin.painel.dev'];
      const logRoutes = ['/api/webhooks/bspay', '/api/checkout/create', '/api/pix/generate', '/api/merchant/balance', '/api/admin/dashboard'];
      const messages = [
        'Webhook processado com sucesso',
        'Slow query detectada: 342ms',
        'Rate limit atingindo 90%',
        'Transação confirmada via PIX',
        'Cache invalidado para merchant:42',
        'Conexão Redis restabelecida',
        'Postback enviado para merchant',
        'Falha na validação do payload',
        'Timeout na conexão com EzzeBank',
        'QR Code PIX gerado',
      ];
      return {
        id,
        type: 'log',
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        host: logHosts[Math.floor(Math.random() * logHosts.length)],
        route: logRoutes[Math.floor(Math.random() * logRoutes.length)],
        timestamp: now,
      } as LogEntry;
    }
    case 'query': {
      const queries = ['SELECT * FROM transactions', 'UPDATE balance SET amount = ?', 'INSERT INTO logs VALUES (?)', 'DELETE FROM cache WHERE expired'];
      return {
        id,
        type: 'query',
        sql: queries[Math.floor(Math.random() * queries.length)],
        duration: Math.floor(Math.random() * 500),
        connection: 'mysql',
        slow: Math.random() > 0.7,
        timestamp: now,
      } as QueryEntry;
    }
    case 'mail': {
      return {
        id,
        type: 'mail',
        to: `user${Math.floor(Math.random() * 1000)}@example.com`,
        subject: 'Notification',
        mailable: 'Mail\\Notification',
        status: Math.random() > 0.1 ? 'sent' : 'queued',
        timestamp: now,
      } as MailEntry;
    }
    case 'event': {
      const names = ['PaymentConfirmed', 'PaymentFailed', 'WebhookReceived', 'PixGenerated'];
      return {
        id,
        type: 'event',
        name: names[Math.floor(Math.random() * names.length)],
        listeners: ['Listener1', 'Listener2'],
        broadcast: Math.random() > 0.5,
        timestamp: now,
      } as EventEntry;
    }
    case 'cache': {
      const operations = ['hit', 'miss', 'set', 'forget'] as const;
      return {
        id,
        type: 'cache',
        operation: operations[Math.floor(Math.random() * operations.length)],
        key: `cache:key:${Math.floor(Math.random() * 1000)}`,
        timestamp: now,
      } as CacheEntry;
    }
    case 'command': {
      const commands = ['transactions:reconcile', 'queue:retry', 'cache:clear'];
      return {
        id,
        type: 'command',
        command: commands[Math.floor(Math.random() * commands.length)],
        exitCode: Math.random() > 0.1 ? 0 : 1,
        duration: Math.floor(Math.random() * 60000),
        arguments: [],
        options: {},
        timestamp: now,
      } as CommandEntry;
    }
    default:
      return null as any;
  }
};

export const useRealtimeData = () => {
  const [liveEntries, setLiveEntries] = useState<AnyEntry[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newEntry = generateRandomEntry();
      setLiveEntries(prev => [newEntry, ...prev].slice(0, 100)); // Keep last 100
    }, Math.random() * 2000 + 1000); // Every 1-3 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const toggleLive = useCallback(() => {
    setIsLive(prev => !prev);
  }, []);

  return { liveEntries, isLive, toggleLive };
};
