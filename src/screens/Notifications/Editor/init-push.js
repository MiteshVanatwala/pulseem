import { sitePrefix } from "../../../config";
export const PushService = async (apiToken) => {
    let swRegistration = null;
    Date.prototype.addDays = function (days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    const urlB64ToUint8Array = function (base64String) {
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

    const initializeUI = function () {
        return new Promise((resolve, reject) => {
            try {
                // Set the initial subscription value
                checkPermissions().then((permission) => {
                    if (permission !== 'denied' && (permission !== 'granted' || permission === 'prompt')) {
                        subscribeUser().then(() => {
                            resolve();
                        });
                    }
                    else {
                        resolve();
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }

    const checkPermissions = async function () {
        const status = await navigator.permissions.query({
            name: 'notifications',
        });

        return status.state;
    }


    const subscribeUser = function () {
        return new Promise((resolve) => {
            const applicationServerKey = urlB64ToUint8Array(apiToken);
            const options = {
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            };
            swRegistration.pushManager.permissionState(options).then(function (res) {
                if (res !== 'denied' || res === 'granted') {
                    swRegistration.pushManager.subscribe(options)
                        .then(function (subscription) {
                            subscription.isSubscribe = true;
                            resolve();
                        })
                        .catch(function (err) {
                            if (err.toString().indexOf('already exists') === -1 && (err.toString().indexOf('permission denied') === -1 || err.name === 'NotAllowedError')) {
                                initializeUI().then(() => {
                                    resolve();
                                });
                            }
                        });
                }
            });
        });

    }

    const registerServiceWorker = async () => {
        return new Promise(async (resolve) => {
            if ("serviceWorker" in navigator) {

                navigator.serviceWorker
                    .register(process.env.PUBLIC_URL + "/sw.js", { scope: `${sitePrefix}notification` })
                    .then(function (registration) {
                        resolve(registration);
                    })
                    .catch(function (err) {
                        console.log("Service worker registration failed, error:", err);
                    });


            }
        });
    }
    const main = async () => {
        check();
        return new Promise((resolve) => {
            registerServiceWorker().then((registration) => {
                if (registration.installing) {
                    registration.installing.addEventListener('statechange', function (e) {
                        if (e.target.state === 'installed') { } else if (e.target.state === 'redundant') {
                            console.log('installed')
                        } else if (e.target.state === 'active' || e.target.state === 'activated') {
                            initPushService(registration).then((subscription) => {
                                resolve(subscription);
                            });
                        }
                    });
                } else {
                    initPushService(registration).then((subscription) => {
                        resolve(subscription);
                    });
                }
            });
        });

    }
    const check = () => {
        if (!('serviceWorker' in navigator)) {
            throw new Error('No Service Worker support!')
        }
        if (!('PushManager' in window)) {
            throw new Error('No Push API Support!')
        }
    }

    function initPushService(reg) {
        return new Promise((resolve) => {
            if (reg && apiToken !== '') {
                var serviceWorker;
                if (reg.installing) {
                    serviceWorker = reg.installing;
                } else if (reg.waiting) {
                    serviceWorker = reg.waiting;
                } else if (reg.active) {
                    serviceWorker = reg.active;
                }
            }
            if (serviceWorker) {
                if (serviceWorker.state === "activated") {
                    swRegistration = reg;
                    subscribeUser().then(() => {
                        resolve(swRegistration);
                    });
                }
                serviceWorker.addEventListener("statechange", function (e) {
                    if (e.target.state === "redundant") {
                        console.log(e.target.state);
                    }
                });
            }
        });

    }

    const subscription = await main();
    const state = await checkPermissions();
    return { subscription: subscription, state: state };
}

