# Champak Search notification setup

The website is configured for OneSignal app ID `c2869c95-73e5-4416-93ad-b26aadf35512`.

## One-time OneSignal settings

In **Settings → Push & In-App → Web**:

1. Use **Custom Code** integration.
2. Set Site URL to `https://search.learnwithchampak.live`.
3. Set the default icon URL to `https://search.learnwithchampak.live/icons/icon-512.png`.
4. Set the service-worker path to `/`.
5. Set the worker filename to `sw.js`.
6. Set the registration scope to `/`.
7. Enable Auto Resubscribe and save.

OneSignal and PWA caching share the root `sw.js`. The worker imports OneSignal first and then installs the PWA caching and offline handlers. This avoids two root-scope workers competing with each other.

## Send a new-lesson broadcast

1. Open **Messages → Push → New Push**.
2. Select **Subscribed Users**.
3. Enter the lesson title, short message and full lesson URL.
4. Test on your own subscribed device.
5. Send immediately or schedule the broadcast.

Never put a OneSignal REST API key in this website. API keys must remain in a protected server or secret store.

## Study-reminder preferences

The PWA records these OneSignal tags when a learner saves a reminder:

| Tag | Example values |
| --- | --- |
| `reminder_frequency` | `off`, `daily`, `weekdays`, `weekly` |
| `reminder_day` | `monday` through `sunday` |
| `reminder_time` | `07:00`, `09:00`, `18:00`, `20:00` |
| `reminder_timezone` | Browser timezone, such as `Asia/Calcutta` |
| `lesson_updates` | `enabled` |

Create OneSignal segments for the reminder combinations you want to serve. For example, a segment with `reminder_frequency = daily` and `reminder_time = 18:00` can receive a recurring 6 PM study message. Use OneSignal’s timezone-aware delivery option when scheduling.

## Test checklist

1. Deploy all files over HTTPS.
2. Open the normal browser window, not Incognito or Private mode.
3. Press **Enable Notifications** and allow the browser prompt.
4. Press **Test Notification**.
5. Confirm the device appears in **Audience → Subscriptions** in OneSignal.
6. Add the device to Test Users and send a dashboard test push.

For iPhone or iPad, use iOS/iPadOS 16.4 or newer, install the PWA on the Home Screen, open it from the new icon, and then enable notifications.
