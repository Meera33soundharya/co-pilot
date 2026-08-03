// Real-time data service for automatic updates and live data feeds
import { useState, useEffect, useCallback } from 'react';

export interface RealTimeConfig {
  autoRefresh: boolean;
  refreshInterval: number; // in milliseconds
  liveUpdates: boolean;
  maxRetries: number;
}

export interface DataUpdate<T> {
  timestamp: number;
  data: T;
  type: 'full' | 'partial' | 'incremental';
  source: 'api' | 'websocket' | 'polling';
}

export class RealTimeService {
  private static instance: RealTimeService;
  private config: RealTimeConfig = {
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    liveUpdates: true,
    maxRetries: 3
  };
  
  private subscribers: Map<string, (data: any) => void> = new Map();
  private intervals: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private websocket: WebSocket | null = null;
  private retryCount = 0;

  private constructor() {
    this.initWebSocket();
  }

  static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }

  private initWebSocket() {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      this.websocket = new WebSocket(`${protocol}//${host}/ws/realtime`);

      this.websocket.onopen = () => {
        console.log('WebSocket connected for real-time updates');
        this.retryCount = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          this.notifySubscribers(update.channel, update.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        this.reconnectWebSocket();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  private reconnectWebSocket() {
    if (this.retryCount < this.config.maxRetries) {
      this.retryCount++;
      setTimeout(() => {
        console.log(`Reconnection attempt ${this.retryCount}`);
        this.initWebSocket();
      }, 5000 * this.retryCount); // Exponential backoff
    }
  }

  // Subscribe to real-time updates for a specific channel
  subscribe<T>(channel: string, callback: (data: T) => void): string {
    const id = `${channel}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.subscribers.set(id, callback as (data: any) => void);
    
    // Start polling if WebSocket is not available
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      this.startPolling(channel);
    }
    
    return id;
  }

  unsubscribe(id: string) {
    this.subscribers.delete(id);
    
    // Clean up interval if no more subscribers for this channel
    const channel = id.split('_')[0];
    const hasSubscribers = Array.from(this.subscribers.keys()).some(key => key.startsWith(channel));
    
    if (!hasSubscribers) {
      this.stopPolling(channel);
    }
  }

  private startPolling(channel: string) {
    if (this.intervals.has(channel)) return;

    const interval = setInterval(async () => {
      try {
        const data = await this.fetchData(channel);
        this.notifySubscribers(channel, data);
      } catch (error) {
        console.error(`Error polling ${channel}:`, error);
      }
    }, this.config.refreshInterval);

    this.intervals.set(channel, interval);
  }

  private stopPolling(channel: string) {
    const interval = this.intervals.get(channel);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(channel);
    }
  }

  async fetchData(channel: string): Promise<any> {
    // Simulate API call - in production, this would be a real API endpoint
    switch (channel) {
      case 'complaints':
        return this.fetchComplaintsData();
      case 'reports':
        return this.fetchReportsData();
      case 'metrics':
        return this.fetchMetricsData();
      case 'ai-insights':
        return this.fetchAIInsightsData();
      default:
        return {};
    }
  }

  private async fetchComplaintsData() {
    // Simulate API response
    return {
      total: Math.floor(Math.random() * 100) + 50,
      resolved: Math.floor(Math.random() * 50) + 20,
      pending: Math.floor(Math.random() * 30) + 10,
      timestamp: Date.now()
    };
  }

  private async fetchReportsData() {
    return {
      executiveSummary: {
        kpi: Math.floor(Math.random() * 20) + 80,
        budget: Math.floor(Math.random() * 20) + 70,
        satisfaction: Math.floor(Math.random() * 20) + 75
      },
      timestamp: Date.now()
    };
  }

  private async fetchMetricsData() {
    return {
      departments: [
        { name: 'Water', performance: Math.floor(Math.random() * 20) + 75 },
        { name: 'Electricity', performance: Math.floor(Math.random() * 20) + 80 },
        { name: 'Roads', performance: Math.floor(Math.random() * 20) + 70 },
        { name: 'Sanitation', performance: Math.floor(Math.random() * 20) + 85 }
      ],
      timestamp: Date.now()
    };
  }

  private async fetchAIInsightsData() {
    const insights = [
      "Governance performance trending upward",
      "Citizen satisfaction improved by 5%",
      "AI accuracy at 94% this week",
      "Budget utilization optimized",
      "Risk level: Low"
    ];
    
    return {
      insights: insights[Math.floor(Math.random() * insights.length)],
      confidence: Math.floor(Math.random() * 20) + 80,
      timestamp: Date.now()
    };
  }

  private notifySubscribers(channel: string, data: any) {
    this.subscribers.forEach((callback, id) => {
      if (id.startsWith(channel)) {
        callback(data);
      }
    });
  }

  updateConfig(newConfig: Partial<RealTimeConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Update intervals if refresh interval changed
    this.intervals.forEach((interval, channel) => {
      clearInterval(interval);
      this.startPolling(channel);
    });
  }

  getConfig(): RealTimeConfig {
    return { ...this.config };
  }

  sendWebSocketMessage(channel: string, data: any) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ channel, data }));
    }
  }

  disconnect() {
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    // Close WebSocket
    if (this.websocket) {
      this.websocket.close();
    }
    
    // Clear subscribers
    this.subscribers.clear();
  }
}

// React hook for real-time data
export function useRealTimeData<T>(channel: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const service = RealTimeService.getInstance();
    setIsLoading(true);

    const subscriptionId = service.subscribe<T>(channel, (newData) => {
      setData(newData);
      setLastUpdated(Date.now());
      setIsLoading(false);
      setError(null);
    });

    // Initial fetch
    service.fetchData(channel)
      .then(initialData => {
        setData(initialData);
        setLastUpdated(Date.now());
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch initial data');
        setIsLoading(false);
      });

    return () => {
      service.unsubscribe(subscriptionId);
    };
  }, [channel]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const service = RealTimeService.getInstance();
      const newData = await service.fetchData(channel);
      setData(newData);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [channel]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
    timeSinceUpdate: Date.now() - lastUpdated
  };
}

// Automated report generation service
export class AutomatedReportService {
  private static instance: AutomatedReportService;
  private schedules: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private reports: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): AutomatedReportService {
    if (!AutomatedReportService.instance) {
      AutomatedReportService.instance = new AutomatedReportService();
    }
    return AutomatedReportService.instance;
  }

  scheduleReport(
    reportId: string,
    interval: number, // in milliseconds
    generateFn: () => Promise<any>,
    onGenerated?: (report: any) => void
  ) {
    // Clear existing schedule if any
    this.cancelSchedule(reportId);

    // Generate immediately
    this.generateReport(reportId, generateFn, onGenerated);

    // Schedule periodic generation
    const intervalId = setInterval(() => {
      this.generateReport(reportId, generateFn, onGenerated);
    }, interval);

    this.schedules.set(reportId, intervalId);
    console.log(`Scheduled report ${reportId} to run every ${interval}ms`);
  }

  private async generateReport(
    reportId: string,
    generateFn: () => Promise<any>,
    onGenerated?: (report: any) => void
  ) {
    try {
      console.log(`Generating automated report: ${reportId}`);
      const report = await generateFn();
      this.reports.set(reportId, {
        ...report,
        generatedAt: Date.now(),
        reportId
      });

      if (onGenerated) {
        onGenerated(report);
      }

      // Notify via WebSocket
      const realtimeService = RealTimeService.getInstance();
      realtimeService.sendWebSocketMessage('automated-reports', {
        reportId,
        generatedAt: Date.now(),
        type: 'report_generated'
      });

      console.log(`Report ${reportId} generated successfully`);
    } catch (error) {
      console.error(`Failed to generate report ${reportId}:`, error);
    }
  }

  cancelSchedule(reportId: string) {
    const intervalId = this.schedules.get(reportId);
    if (intervalId) {
      clearInterval(intervalId);
      this.schedules.delete(reportId);
      console.log(`Cancelled schedule for report ${reportId}`);
    }
  }

  getReport(reportId: string) {
    return this.reports.get(reportId);
  }

  getAllSchedules() {
    return Array.from(this.schedules.keys());
  }

  stopAll() {
    this.schedules.forEach(intervalId => clearInterval(intervalId));
    this.schedules.clear();
    console.log('Stopped all automated report schedules');
  }
}

// Alert service for automated notifications
export class AlertService {
  private static instance: AlertService;
  private alerts: Map<string, any> = new Map();
  private conditions: Map<string, (data: any) => boolean> = new Map();

  private constructor() {}

  static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  setupCondition(
    alertId: string,
    condition: (data: any) => boolean,
    message: string,
    severity: 'info' | 'warning' | 'critical'
  ) {
    this.conditions.set(alertId, condition);
    
    // Subscribe to real-time updates
    const realtimeService = RealTimeService.getInstance();
    realtimeService.subscribe('metrics', (data) => {
      if (condition(data)) {
        this.triggerAlert(alertId, message, severity, data);
      }
    });

    console.log(`Set up alert condition: ${alertId}`);
  }

  private triggerAlert(
    alertId: string,
    message: string,
    severity: 'info' | 'warning' | 'critical',
    data: any
  ) {
    const alert = {
      id: alertId,
      message,
      severity,
      data,
      timestamp: Date.now(),
      acknowledged: false
    };

    this.alerts.set(alertId, alert);

    // Send WebSocket notification
    const realtimeService = RealTimeService.getInstance();
    realtimeService.sendWebSocketMessage('alerts', alert);

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Governance Alert: ${severity.toUpperCase()}`, {
        body: message,
        icon: '/favicon.ico'
      });
    }

    console.log(`Alert triggered: ${alertId} - ${message}`);
  }

  acknowledgeAlert(alertId: string) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.alerts.set(alertId, alert);
    }
  }

  getActiveAlerts() {
    return Array.from(this.alerts.values()).filter(alert => !alert.acknowledged);
  }

  clearAlert(alertId: string) {
    this.alerts.delete(alertId);
  }

  clearAllAlerts() {
    this.alerts.clear();
  }
}

// Initialize services on app startup
export function initializeAutomationServices() {
  if (typeof window !== 'undefined') {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Set up default alerts
    const alertService = AlertService.getInstance();
    
    // Example: Alert when pending complaints exceed threshold
    alertService.setupCondition(
      'high-pending-complaints',
      (data) => data.pending > 30,
      'High number of pending complaints detected',
      'warning'
    );

    // Example: Alert when satisfaction drops below threshold
    alertService.setupCondition(
      'low-satisfaction',
      (data) => data.satisfaction < 70,
      'Citizen satisfaction below target threshold',
      'critical'
    );

    // Set up automated reports
    const reportService = AutomatedReportService.getInstance();
    
    // Schedule executive summary report every hour
    reportService.scheduleReport(
      'executive-summary-hourly',
      3600000, // 1 hour
      async () => {
        // Simulate report generation
        return {
          type: 'executive-summary',
          generatedAt: Date.now(),
          data: {
            kpi: Math.floor(Math.random() * 20) + 80,
            budget: Math.floor(Math.random() * 20) + 70,
            satisfaction: Math.floor(Math.random() * 20) + 75
          }
        };
      },
      (report) => {
        console.log('Hourly executive summary generated:', report);
      }
    );

    // Schedule daily department performance report
    reportService.scheduleReport(
      'department-performance-daily',
      86400000, // 24 hours
      async () => {
        return {
          type: 'department-performance',
          generatedAt: Date.now(),
          data: {
            departments: [
              { name: 'Water', performance: Math.floor(Math.random() * 20) + 75 },
              { name: 'Electricity', performance: Math.floor(Math.random() * 20) + 80 },
              { name: 'Roads', performance: Math.floor(Math.random() * 20) + 70 },
              { name: 'Sanitation', performance: Math.floor(Math.random() * 20) + 85 }
            ]
          }
        };
      }
    );

    console.log('Automation services initialized');
  }
}