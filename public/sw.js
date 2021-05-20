let notificationId = 0;
let clientId = 0;
const apiBaseUrl = 'https://pnapi.pulseemdev.co.il/api/'; // PROD 'http://api.notification.com/api/';

self.addEventListener('install', (event) => {
    console.log('ServiceWorker installed')
});

self.addEventListener('push', function(event) {
    const payload = event.data.text();
    let title = '';
    let options = {};
    if (isValidJson(payload) == true) {
        const jsonPayload = JSON.parse(payload);
        const notificationItem = JSON.parse(jsonPayload.notification);
        title = notificationItem.Title;
        notificationId = notificationItem.ID;
        clientId = jsonPayload.ClientId;
        options = {
            title: notificationItem.Title,
            body: notificationItem.Body,
            icon: notificationItem.Icon,
            image: notificationItem.Image,
            tag: notificationItem.Tag.Accept,
            dir: notificationItem.Direction == 2 ? 'rtl' : 'ltr',
            vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500]
        };
        if (notificationItem.RedirectURL != '') {
            options.data = {
                url: notificationItem.RedirectURL,
                subscriberId: clientId,
                notificationId: notificationId
            }
            if (notificationItem.RedirectButtonText != '') {
                options.actions = [{
                    action: 'openurl',
                    title: notificationItem.RedirectButtonText
                }];
            }
        }
        event.waitUntil(self.registration.showNotification(title, options));
    }
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