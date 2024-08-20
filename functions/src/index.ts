import  *  as functions from  'firebase-functions';
import  *  as admin from  'firebase-admin';

admin.initializeApp();

exports.sendUserNotification = functions.firestore
.document('users/{userId}/notifications/{notificationId}').onCreate(
async  (snapshot:  functions.firestore.QueryDocumentSnapshot,  context:  functions.EventContext) => {

// Extracting information from the newly created notification

const  notificationData  =  snapshot.data();
const  recipientUid  =  context.params.userId;

// Fetch recipient's device token from Firestore
const  recipientDoc = await  admin.firestore().doc(`users/${recipientUid}`).get();

const  recipientData = recipientDoc.data();

// Check if the recipient has a device token
if (recipientData  &&  recipientData.token) {

const  token  =  recipientData.token;

// Define your notification payload
const payload = {

notification: {
 title:notificationData.username,
 body:notificationData.description,
 clickAction:"FLUTTER_NOTIFICATION_CLICK"
},
data: {
  uid: notificationData.uid,
  notificationId: context.params.notificationId
 }
}

const message = {
 token: token,
 notification: {
  title: payload.notification.title,
  body: payload.notification.body
 },
 data: payload.data,
};

// Send a message to the device corresponding to the provided registration token

try  {
await  admin.messaging().send(message);
console.log('Notification sent successfully');
  }  catch (error) {
console.error('Error sending notification',  error);
   }
  }  else  {
     console.log('No device token for recipient');
  }
});