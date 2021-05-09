let notificationId = 0;
let clientId = 0;
const apiBaseUrl = 'https://pnapi.pulseemdev.co.il/api/'; // PROD 'http://api.notification.com/api/';

self.addEventListener('install', (event) => {
    console.log('ServiceWorker installed')
});

self.addEventListener('notificationclick', function(event) {
    const target = event.notification.actions[0].action;
    event.notification.close();
    event.waitUntil(clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (client.url == target && 'focus' in client) {
                return client.focus();
            }
        }
        return clients.openWindow(target);
    }));
});
self.addEventListener('activate', function(event) {
    event.waitUntil(clients.claim());
});
self.addEventListener('pushsubscriptionchange', function(event) {
    console.log('pushsubscriptionchange');
    event.waitUntil(
        Promise.all([
            Promise.resolve(event.newSubscription ? event.newSubscription : subscribePush(registration))
            .then(function(sub) { return updateSubscription(sub); })
        ])
    );
});

const isValidJson = function(str) {
    if (/^[\],:{}\s]*$/.test(str.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return true;
    } else {
        return false;
    }
}

async function openWindow(event) {
    const promiseChain = await clients.openWindow(event.notification.data.url);
    event.waitUntil(promiseChain);
}

function focusWindow(event) {
    const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
    const promiseChain = clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        })
        .then((windowClients) => {
            let matchingClient = null;

            for (let i = 0; i < windowClients.length; i++) {
                const windowClient = windowClients[i];
                if (windowClient.url === urlToOpen) {
                    matchingClient = windowClient;
                    break;
                }
            }

            if (matchingClient) {
                return matchingClient.focus();
            } else {
                return openWindow(event);
            }
        });

    event.waitUntil(promiseChain);
}