function readDescriptionFile() {
	var req = new XMLHttpRequest();
	req.open("GET", "descriptionFile.txt", false);
	req.send();
	document.getElementById("firstColumn").innerHTML = req.responseText;
}

function registerButton() {
	//send form data to back-end?
}

function loginButton() {
	//send form data to back-end?
}