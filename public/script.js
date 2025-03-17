// Push notification setup function
function setupPushSubscription() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      document.getElementById('status').className = 'status error';
      document.getElementById('status').textContent = 'Push notifications not supported';
      return;
    }
  
    let reg;
    navigator.serviceWorker.ready
      .then(swreg => {
        reg = swreg;
        return swreg.pushManager.getSubscription();
      })
      .then(subscription => {
        if (subscription === null) {
          // Create a new subscription
          const vapidPublicKey = 'BM29P5O99J9F-DUOyqNwGyurNl5a3ZSkBa0ZlOLR9AylchmgPwHbCeZaFGlEcKoAUOaZvNk5aXa0dHSDS_RT2v0';
          const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
          
          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
        } else {
          // We already have a subscription
          return subscription;
        }
      })
      .then(newSubscription => {
        // Send the subscription to your server
        // Use relative URL instead of absolute for local development
        return fetch('/api/save-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(newSubscription)
        });
      })
      .then(response => {
        if (response.ok) {
          document.getElementById('status').className = 'status success';
          document.getElementById('status').textContent = 'Push notification setup complete!';
          enableSchedulingUI();
        } else {
          throw new Error('Server response not OK');
        }
      })
      .catch(err => {
        console.error('Failed to subscribe for push', err);
        document.getElementById('status').className = 'status error';
        document.getElementById('status').textContent = 'Push notification setup failed: ' + err.message;
      });
  }
  
  // Helper function to convert base64 to Uint8Array
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  // Enable scheduling UI after successful push subscription
  function enableSchedulingUI() {
    const controls = document.querySelector('.notification-controls');
    if (controls) {
      controls.style.opacity = '1';
      controls.style.pointerEvents = 'auto';
    }
  }
  
  // Initialize service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          // Only proceed with notification permission after SW registration
          if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                setupPushSubscription();
              }
            });
          }
        })
        .catch(function(error) {
          console.error('ServiceWorker registration failed: ', error);
          document.getElementById('status').className = 'status error';
          document.getElementById('status').textContent = 'ServiceWorker registration failed: ' + error.message;
        });
    });
  }