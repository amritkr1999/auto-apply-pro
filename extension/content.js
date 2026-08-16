// EasyNaukri Content Script - Extension Node Verification Bridge
(function() {
  try {
    localStorage.setItem('auto_extension_installed', 'true');
    localStorage.setItem('auto_extension_version', '1.0.0');
    window.__EASYNAUKRI_EXTENSION_ACTIVE__ = true;
    
    // Notify page on initial load
    window.postMessage({ type: 'EASYNAUKRI_EXTENSION_PONG', installed: true, version: '1.0.0' }, '*');
    console.log('EasyNaukri Extension Node successfully connected to Web Dashboard.');

    // Listen for real-time heartbeat PING from Web Dashboard
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'EASYNAUKRI_EXTENSION_PING') {
        window.postMessage({ type: 'EASYNAUKRI_EXTENSION_PONG', installed: true, version: '1.0.0' }, '*');
      }
    });
  } catch (e) {
    console.error('Error in EasyNaukri Content Script bridge:', e);
  }
})();
