const payment_par = document.getElementById("payment_par_id");
let payment_table = document.getElementById("payment_table");
document.getElementById("payment_table_div").hidden = true;


signOutBtn.onclick = () => { //in case of clicking the sign out button
    auth.signOut(); //sign out
    window.location.replace(index_html_add); //change the current page
};


auth.onAuthStateChanged((user) => {
    let sum = 0;
    if (user) {
        let prices = calc_prices();
        thingsRef = db.collection("trainings");
        thingsRef.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => { //loop over all the trainings db
                if (calc_date_diff(doc.data()) < 0 && doc.data().uid == user.uid) { //find trainings from the past
                    sum += prices[doc.data().trainingType.toString()]; //append to the sum
                    append_row( //append to the table
                        doc.data().Date,
                        doc.data().trainingType,
                        prices[doc.data().trainingType.toString()].toString() + "₪"
                    );
                }
            });
            payment_par.innerText = payment_msg(sum.toString()); //create the payment message
            if (sum != 0) {
                document.getElementById("payment_table_div").hidden = false;

                initPayPalButton(sum, user.uid); //create the payment with paypal
            }
        });
    }
});

function calc_date_diff(data) {
    let timestamp = Date.parse(data.Date);
    let dateObject = new Date(timestamp);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    dateObject.setHours(0, 0, 0, 0);
    return dateObject - currentDate; //return the diffrentiation between data date and current date
}



function initPayPalButton(price, uid) {
    //using paypal api for creating the paypal payment buttons and logic
    paypal
        .Buttons({
            style: {
                shape: "pill",
                color: "silver",
                layout: "vertical",
                label: "paypal",
            },

            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{ amount: { currency_code: "USD", value: price } }],
                });
            },

            onApprove: function(data, actions) {
                cancel_paid_trainings(uid);
                document.getElementById("payment_table").hidden = true;
                return actions.order.capture().then(function(orderData) {
                    // Full available details
                    console.log(
                        "Capture result",
                        orderData,
                        JSON.stringify(orderData, null, 2)
                    );

                    // Show a success message within this page, e.g.
                    const element = document.getElementById("paypal-button-container");
                    element.innerHTML = "";
                    element.innerHTML = payment_succsess_html_msg();

                    // Or go to another URL:  actions.redirect('thank_you.html');
                });
            },

            onError: function(err) {
                alert(error_payment_message);
                console.log(err);
            },
        })
        .render("#paypal-button-container");
}

function cancel_paid_trainings(uid) {
    thingsRef = db.collection("trainings");
    thingsRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => { // loop over all the trainings db
            if (calc_date_diff(doc.data()) < 0 && doc.data().uid == uid)
            //in case the training in the past and belongs to the user
                doc.ref.delete(); //delete the training from the db
        });
    });
}

function append_row(date, trainingType, training_price) {
    //appending new row with the training to the payment table
    let row = payment_table.insertRow(-1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    cell1.innerText = date;
    cell2.innerText = trainingType;
    cell3.innerText = training_price;
}

function calc_prices() {
    let prices = {
        TRX: 0,
        "עיצוב וחיטוב": 0,
        קיקבוקס: 0,
        פילאטיס: 0,
        זומבה: 0,
    };
    thingsRef = db.collection("pricelist");
    thingsRef.get().then((querySnapshot) => { //loop over all the pricelist db
        querySnapshot.forEach((doc) => {
            prices[doc.data().trainingType] = doc.data().price; //updating the prices dict
        });
    });
    return prices;
}