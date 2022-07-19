let priceTable = document.getElementById("priceTable");
auth.onAuthStateChanged((user) => {
    thingsRef = db.collection("pricelist");
    thingsRef.get().then((querySnapshot) => { //loop over all the pricelist db
        querySnapshot.forEach((doc) => {
            //append the training type and the price to the price list table
            appendTablePrice(doc.data().trainingType, doc.data().price);
        })
    });

});

function appendTablePrice(trainingType, price) {
    //append new row with the training type and the price to the pricelist table
    let row = priceTable.insertRow(-1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    cell1.innerHTML = trainingType;
    cell2.innerHTML = price.toString() + "₪";

}