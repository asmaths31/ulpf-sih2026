export const MOCK_JOBS = [
  { id: '1', source: 'nginx', name: 'Nginx Access Logs', time: 'Today, 5:32 PM', count: '+1.2M', status: 'success' },
  { id: '2', source: 'syslog', name: 'Core Router Syslog', time: 'Today, 5:15 PM', count: '+450K', status: 'success' },
  { id: '3', source: 'windows', name: 'DC Auth Events', time: 'Today, 4:45 PM', count: '-3.4K', status: 'danger' },
  { id: '4', source: 'aws', name: 'AWS CloudTrail', time: 'Today, 4:00 PM', count: '+890K', status: 'success' },
];

export const MOCK_SCHEDULED = [
  { id: '1', icon: 'file-text', title: 'Nginx access-log normalization', due: 'Due in 3 min', type: 'warning' },
  { id: '2', icon: 'copy', title: 'Syslog dedup batch', due: 'Due in 15 min', type: 'default' },
  { id: '3', icon: 'shield', title: 'PII masking pass', due: 'Due in 1 hr', type: 'default' },
  { id: '4', icon: 'map', title: 'Windows Event to ECS mapping', due: 'Due in 2 hr', type: 'default' },
];

export const MOCK_CHART_DATA = [
  { day: 'S', events: 4200 },
  { day: 'M', events: 5100 },
  { day: 'T', events: 4800 },
  { day: 'W', events: 7300 },
  { day: 'T', events: 6100 },
  { day: 'F', events: 5800 },
  { day: 'S', events: 4500 },
];
