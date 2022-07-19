//initallize constant messages and variables
let registered_msg = "הנך רשום כבר לאימון";
let error_payment_message = "שגיאה בתהליך התשלום, צור קשר עם הסטודיו";
let incomplete_details =
    "אנא הזן מייל, שם מלא תקין וסיסמה שאורכה 6 תווים לפחות";
let full_training_msg = "האימון מלא, אנא בחר אימון אחר";
let new_training_msg = "בוצע רישום בהצלחה";
let subject_mail_msg = "אימון חדש עבורך";
let cancel_training_msg = "אימון בוטל בהצלחה";
let cancel_click_msg = "לחץ לביטול";
let mail_valid_regex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let min_password_len = 6;
let taken_mail_msg = "מייל תפוס, אנא הזן פרטים אחרים";
let wrong_details_msg = "פרטים שגוים, נסה שוב";
let max_quantity = 30;
var firebaseConfig = {
    apiKey: "AIzaSyA01OSRHevnV7n7rA2FDsRAkBemZsRsvrQ",
    authDomain: "studioup-d4e79.firebaseapp.com",
    databaseURL: "https://studioup-d4e79-default-rtdb.firebaseio.com",
    projectId: "studioup-d4e79",
    storageBucket: "studioup-d4e79.appspot.com",
    messagingSenderId: "916759180544",
    appId: "1:916759180544:web:312e321e0ca21bdd4e2fe5",
    measurementId: "G-Y3SKQDG2TM",
};
let index_html_add = "/index.html";
//initallizing firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const db = firebase.firestore();

//combining strings functions for appropriate messages
function combine_msg_content(name, training_type, date, hour) {
    return `היי ${name} , אימון חדש נקבע עבורך ב ${training_type} \n במועד ${date} בשעה: ${hour}`;
}

function create_html_display_name(displayName) {
    return `<h3>שלום ${displayName}!</h3> `;
}

function payment_msg(sum) {
    return `התשלום שלך הוא: ${sum}₪`;
}

function payment_succsess_html_msg() {
    return "<h3>Thank you for your payment!</h3>";
}