const userDetails = document.getElementById("userDetails");
const signOutBtn = document.getElementById("signOutBtn");
const whenSignedIn = document.getElementById("whenSignedIn");

signOutBtn.onclick = () => { //in case of clicking the sign out button
    auth.signOut(); //sign out
    window.location.replace(index_html_add); //change the current page
};


auth.onAuthStateChanged((user) => {
    if (user) {
        whenSignedIn.style.visibility = "visible"; //handle visibilty if the user signed in
        if (user.displayName) //displaying the user full name
            userDetails.innerHTML = create_html_display_name(user.displayName);
    } else { //handle the hidden logic when signed out
        whenSignedIn.style.visibility = "hidden";
        userDetails.innerHTML = "";
    }
});