// Simple configuration to help with WebSocket connections during development
window.WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
window.WS_HOST = window.location.host;
window.WS_PATH = '/ws'; 