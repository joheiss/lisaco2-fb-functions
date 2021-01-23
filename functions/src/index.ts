import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {handleSensorUpdate} from './handler';

admin.initializeApp();

export const sendNotification = functions.firestore
    .document('sensors/{id}')
    .onUpdate(async (change, context) => handleSensorUpdate(change, context));

