import {Change, EventContext} from 'firebase-functions';
import {Sensor} from './sensor';
import * as admin from 'firebase-admin';

export async function handleSensorUpdate(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext): Promise<any> {
    const store = admin.firestore();
    const fcm = admin.messaging();
    // get latest measurement
    const sensor = Sensor.fromDocument(change.after.id, change.after.data());
    if (sensor.measurements.length === 0) return;
    const latest = sensor.measurements?.[0];
    if (latest.co2 > 2500) {
        console.log('[DEBUG] Threshold exceeded!');
        // find users subscribed to given sensor id
        await store
            .collection('sensors_subs_user')
            .where('sensorId', '==', sensor.id)
            .get()
            .then(subs => {
                // get user data for subscribed users
                subs.docs.forEach(async sub => {
                    const uid = sub.data().userId;
                    console.log(`[DEBUG] Subscriber for sensor ${sensor.id} found: $uid`);
                    // get FCM tokens for all registered devices of user
                    await store.collection('users').doc(uid).collection('devices').get().then(devices => {
                        devices.docs.forEach(async dev => {
                            console.log(`[DEBUG] Device for user ${uid} found: ${dev.data().deviceId}`);
                            const token = dev.data().fcmToken;
                            console.log(`[DEBUG] Token found: ${token}`);
                            const payload: admin.messaging.MessagingPayload = {
                                notification: {
                                    title: `Raum ${sensor.name}`,
                                    body: `Im Raum ${sensor.name} ist der Grenzwert überschritten. Bitte lüften!`,
                                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                                },
                            };
                            console.log(`[DEBUG] Push notification sent`);
                            await fcm.sendToDevice(token, payload);
                        });
                    });
                });
            });
    }
}
