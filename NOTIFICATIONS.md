# Champak Search notification setup

The website is configured for OneSignal app ID `c2869c95-73e5-4416-93ad-b26aadf35512`.

## One-time OneSignal settings

In **Settings → Push & In-App → Web**:

1. **Typical Site** or **Custom Code** integration can be used.
2. Set Site URL to `https://search.learnwithchampak.live`.
3. Set the default icon URL to `https://search.learnwithchampak.live/icons/icon-512.png`.
4. Keep the service-worker path as `/`.
5. Keep the worker filename as `OneSignalSDKWorker.js`.
6. Keep the registration scope as `/`.
7. Enable Auto Resubscribe and save.

`OneSignalSDKWorker.js` is the root worker expected by OneSignal. It loads `sw.js`, which contains both OneSignal push support and PWA caching. This avoids two root-scope workers competing with each other.

## Send a new-lesson broadcast

1. Open **Messages → Push → New Push**.
2. Select **Subscribed Users**.
3. Enter the lesson title, short message and full lesson URL.
4. Test on your own subscribed device.
5. Send immediately or schedule the broadcast.

Never put a OneSignal REST API key in this website. API keys must remain in a protected server or secret store.

## Test checklist

1. Deploy all files over HTTPS.
2. Open the normal browser window, not Incognito or Private mode.
3. Press **Enable Notifications** and allow the browser prompt.
4. Press **Test Notification**.
5. Confirm the device appears in **Audience → Subscriptions** in OneSignal.
6. Add the device to Test Users and send a dashboard test push.

For iPhone or iPad, use iOS/iPadOS 16.4 or newer, install the PWA on the Home Screen, open it from the new icon, and then enable notifications.
