//define general variables
let table = document.getElementById("myTable");
document.getElementById("training_list_section").hidden = true;
document.getElementById("cvForm").hidden = true;
document.getElementById("ulBtn").hidden = true;
let training_type_doc = document.getElementById("trainingType");
const whenSignedOut = document.getElementById("whenSignedOut");
const signInBtn = document.getElementById("signInBtn");
const picked_date = document.getElementById("pick_date");
let hour_doc = document.getElementById("select_hour");
let mySelect = document.getElementById("trainingType");
const training_list_btn = document.getElementById("personal_trainings");
const training_reg_btn = document.getElementById("training_reg");
const send_btn = document.getElementById("send_btn");
let thingsRef, unsubscribe, schedule;


signInBtn.onclick = () => { //in case of clicking the sign in button
    auth.signInWithPopup(provider);
};

auth.onAuthStateChanged((user) => {

    if (user) {
        schedule = import_schedule(); //import the schedule from the database
        thingsRef = db.collection("trainings");
        send_btn.onclick = () => { //in case of clicking the send_btn (new training)
            let training_type =
                training_type_doc.options[training_type_doc.selectedIndex].text;
            let hour = hour_doc.options[hour_doc.selectedIndex].text;
            let append = true,
                quantity = 0,
                date = picked_date.value;
            thingsRef.get().then((querySnapshot) => { // loop over all the 'trainings' db
                querySnapshot.forEach((doc) => {
                    if ( //if the current training is exist already in the db
                        doc.data().Date == date.toString() &&
                        doc.data().hour == hour.toString() &&
                        doc.data().trainingType == training_type
                    ) {
                        quantity += 1;
                        if (doc.data().uid == user.uid) {
                            append = false; // in case the user is already registered to the training
                            alert(registered_msg);
                        }
                    }
                });
                if (!append && quantity >= max_quantity) // in case of Exceeding the quantity
                    alert(full_training_msg);
                if (append && quantity < max_quantity) { //clear the table and append the training
                    clearTable();
                    apppend_ref(thingsRef, user.uid, training_type, hour, date);
                    alert(new_training_msg);
                    if (document.getElementById("send_mail").checked) // in case send mail button is checked
                        sendMail(
                        firebase.auth().currentUser.email,
                        training_type,
                        date.toString(),
                        hour,
                        user
                    );
                }
            });
        };
        unsubscribe = thingsRef
            .where("uid", "==", user.uid)
            .onSnapshot((querySnapshot) => {
                clearTable(); //clearing all the table
                const items = querySnapshot.docs.map((doc) => {
                    if (calc_date_diff(doc.data()) >= 0) { // in case the training is in the future
                        appendTable(
                            doc.data().Date.toString(),
                            doc.data().hour.toString(),
                            doc.data().trainingType,
                            user
                        );
                    }
                });
            });
    }
    sign_InOut_hidden(user);
    handle_login_func(whenSignedOut.hidden);
    show_hide_obj(whenSignedOut.hidden);
});

function handle_login_func(sign_out_in) {
    if (sign_out_in) {
        let today = new Date();
        let yyyy = today.getFullYear();
        let month = today.getMonth();
        // calc number of days in the current month
        let daysInMonth = new Date(yyyy, month, 0).getDate();
        let dd = String((today.getDate() + 1) % daysInMonth).padStart(2, "0");
        let mm = String((month + 1) % 12).padStart(2, "0"); //January is 0!
        let mm_end = String((month + 2) % 12).padStart(2, "0"); //January is 0!
        today = yyyy + "-" + mm + "-" + dd;
        day_end = yyyy + "-" + mm_end + "-" + dd;
        picked_date.setAttribute("min", today.toString()); //set the minimum value of the picking date
        picked_date.setAttribute("max", day_end.toString()); //set the maximum value of the picking date
        picked_date.setAttribute("value", today.toString()); //set the current value of the picking date
    }
}


function sign_InOut_hidden(user) {
    //handle the Sign in and out section hidden feature in case of sign in and out
    if (user) {
        whenSignedOut.hidden = true;
    } else {
        whenSignedOut.hidden = false;
    }
}

function show_hide_obj(sign_out_in) {
    //handle the hidden logic while sign in and out
    if (sign_out_in) {
        document.getElementById("ulBtn").hidden = false;

    } else {
        document.getElementById("training_list_section").hidden = true;
        document.getElementById("cvForm").hidden = true;
        document.getElementById("ulBtn").hidden = true;

    }
}

function sendMail(email_add, training_type, full_date, hour, user) {
    mail_to = "mailto:" + email_add; // the email address the mail send
    msg_con = combine_msg_content( //combine the msg content
        user.displayName,
        training_type,
        full_date,
        hour
    );
    let link =
        mail_to +
        "?cc=" +
        "&subject=" +
        encodeURIComponent(subject_mail_msg) +
        "&body=" +
        encodeURIComponent(msg_con); //combine the mail with the mail_to js function
    window.location.href = link;
}

mySelect.onchange = (event) => {
    change_hours(); //in case of clicking the Select object, change the hours correspondly to the training type
};

function import_schedule() {
    let schedule = {};
    thingsRef = db.collection("Schedule");
    thingsRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => { // loop over all the Schedule db
            schedule[doc.data().trainingType] = [doc.data().hour1, doc.data().hour2] //create the schedule dictionary object
        });
    });
    return schedule;
}


function change_hours() {
    let training_type = document.getElementById("trainingType").value;
    let selected = document.getElementById("select_hour");
    for (let i = 0; i < schedule[training_type].length; i++) //change the hours in the select options correnspondly to the schedule
        selected.options[i].text = schedule[training_type][i];
}

training_list_btn.onclick = () => { // in case of clicking the training list button
    document.getElementById("training_list_section").hidden = false;
    document.getElementById("cvForm").hidden = true;
}
training_reg_btn.onclick = () => { //in case of clicking the register to new training
    document.getElementById("trainingType").innerHTML = "";
    append_trainingTypes_form(); //append all the options to the select element
    let training_type = document.getElementById("trainingType").value;
    document.getElementById('op_hour1').innerText = schedule[training_type][0]; //initallize the first hour option
    document.getElementById('op_hour2').innerText = schedule[training_type][1]; //initallize the second hour option
    document.getElementById("cvForm").hidden = false;
    document.getElementById("training_list_section").hidden = true;
};

function apppend_ref(thingsRef, uid, trainingType, hour, date) {
    //append to the db
    thingsRef.add({
        uid: uid,
        trainingType: trainingType,
        hour: hour,
        Date: date.toString(),
    });
}

function cancel_training(date, hour, training_type, uid) {
    thingsRef = db.collection("trainings");
    thingsRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => { //loop over all the trainings db
            if ( //in case of all the details are matching
                doc.data().Date == date.toString() &&
                doc.data().hour == hour.toString() &&
                doc.data().trainingType == training_type &&
                doc.data().uid == uid
            )
                doc.ref.delete(); //delete the currently training
        });
    });
    alert(cancel_training_msg);
}

function calc_date_diff(data) {
    let timestamp = Date.parse(data.Date);
    let dateObject = new Date(timestamp);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    dateObject.setHours(0, 0, 0, 0);
    return dateObject - currentDate; //calculate the diffrentiation between the data date and the current date
}

function appendTable(date, hour, trainingType, user) {
    //insert new row and 4 new cells and update them with the appropriate data
    let row = table.insertRow(-1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    cell1.innerHTML = date;
    cell2.innerHTML = hour;
    cell4.innerText = cancel_click_msg;
    cell3.innerHTML = trainingType;
    cell4.style.background = "black";
    cell4.style.cursor = "pointer";
    cell4.onclick = () => { //make the cell4 clickable (for cancel training)
        clearTable(); // clearing all the current table
        cancel_training(date, hour, trainingType, user.uid);
    };
}

function clearTable() {
    //clearing all the current table
    let rows = table.rows;
    let i = rows.length;
    while (--i) table.deleteRow(i);
}

document.getElementById("signupBtn").onclick = () => { //in case of clicking the signup button
    // get the currently form data
    let full_name = document.getElementById("full_name").value;
    let email_signup = document.getElementById("email_signup").value;
    let password_signup = document.getElementById("password_signup").value;
    let emailPattern = mail_valid_regex;
    const match = email_signup.match(emailPattern); //check the mail using regex
    if ( //in case all the the details are proper
        match &&
        email_signup === match[0] &&
        password_signup.length >= min_password_len && full_name.length >= 2
    ) {
        firebase
            .auth()
            .createUserWithEmailAndPassword(email_signup, password_signup) //create the user with firebase method
            .then((userCredential) => {
                let user = userCredential.user;
                user
                    .updateProfile({
                        displayName: full_name, //update the user full name
                    })
                    .catch((error) => {
                        let errorCode = error.code;
                        let errorMessage = error.message;
                    });
                location.reload();
            })
            .catch((error) => {
                alert(taken_mail_msg); //in case of taken mail
            });
    } else alert(incomplete_details);
};

document.getElementById("login_btn").onclick = () => { //in case of clicking the login button
    let email_signin = document.getElementById("email_login").value;
    let password_signin = document.getElementById("password_login").value;
    firebase
        .auth()
        .signInWithEmailAndPassword(email_signin, password_signin) //sign in with firebase method
        .then((userCredential) => {
            let user = userCredential.user;
            location.reload();
        })
        .catch((error) => { // in case of error while signin (wrong details)
            let errorCode = error.code;
            let errorMessage = error.message;
            alert(wrong_details_msg);
        });
};

document.getElementById("signup-toggle").onclick = () => { //handle the signup button style while clicking
    document.getElementById("login-toggle").style.backgroundColor = "#fff";
    document.getElementById("login-toggle").style.color = "#222";
    document.getElementById("signup-toggle").style.backgroundColor = "#4d4e4d";
    document.getElementById("signup-toggle").style.color = "#fff";
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";
}

document.getElementById("login-toggle").onclick = () => { //handle the login button style while clicking
    document.getElementById("login-toggle").style.backgroundColor = "#4d4e4d";
    document.getElementById("login-toggle").style.color = "#fff";
    document.getElementById("signup-toggle").style.backgroundColor = "#fff";
    document.getElementById("signup-toggle").style.color = "#222";
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
}

function append_trainingTypes_form() {
    let select_training_type = document.getElementById("trainingType");
    for (let key of Object.keys(schedule)) { //loop all over the schedule key's
        let opt = document.createElement('option');
        opt.value = key;
        opt.innerText = key;
        select_training_type.appendChild(opt); //append new option with the key as value and text
    }
}