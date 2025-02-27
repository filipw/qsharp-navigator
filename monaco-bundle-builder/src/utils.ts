export function logMessage(level: string, message: string): void {
    console.log(`[${level.toUpperCase()}] ${message}`);
    try {
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.logMessage) {
        window.webkit.messageHandlers.logMessage.postMessage({
          level: level,
          message: message
        });
      }
    } catch (e) {
      // Ignore messaging errors
    }
  }