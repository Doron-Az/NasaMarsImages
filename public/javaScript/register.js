

const validatorModule = (function () {
    const isNotEmpty = function (str) {
        return {
            isValid: (str.length !== 0),
            message: 'Please fill out this field'
        };
    }

    const hasLetter = function (str) {
        return {
            isValid: (/^[a-zA-Z]+$/.test(str)),
            message: 'Please enter only alphabetic letters'
        }
    }
    const isEmail = function (str) {
        return {
            isValid: (/\S+@\S+\.\S+/.test(str)),
            message: 'Please enter the correct Email format'
        }
    }
    const isBiggerThan = function (str) {
        return {
            isValid: (str.length > 7),
            message: "Please enter at least 8 characters"
        }
    }
    const isEqual = function (strA, strB) {
        return {
            isValid: (strA === strB),
            message: "The password confirmation does not match"
        }
    }
    const isExist = function (email) {
        return {
            isValid: false,
            message: "a user with this email adress already exists"
        }
    }
    return {
        isNotEmpty: isNotEmpty,
        hasLetter: hasLetter,
        isEmail: isEmail,
        isBiggerThan: isBiggerThan,
        isEqual: isEqual,
        isExist: isExist
    }
})();

(function () {


    function setCookie(cname, cvalue) {
        const d = new Date();
        d.setTime(d.getTime() + (60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function delete_cookie(name) {
        if (getCookie(name)) {
            document.cookie = name + "=" + ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
        }
    }
    //  If the cookie is set it will display a greeting.

    //  If the cookie is not set, it will display a prompt box,
    //  asking for the name of the user, and stores the username cookie 
    //  for 365 days, by calling the setCookie function:
    function checkCookie() {
        let username = getCookie("username");
        if (username != "") {
            alert("Welcome again " + username);
        } else {
            username = prompt("Please enter your name:", "");
            if (username != "" && username != null) {
                setCookie("username", username, 365);
            }
        }
    }

    /**
     * Present using the message model you receive.
     * @param text - the string we want to view on the modal.
     */
    const viewErrorModal = (text) => {
        let modal = new bootstrap.Modal(document.getElementById("errorModal"));
        document.getElementById("errorModalText").innerHTML = text;
        modal.show();
    }

    const validateInput = (inputElement, validateFunc) => {
        let v;
        let errorElement;

        if (inputElement.length === 1) {
            v = validateFunc(inputElement[0].value);// call the validation function
            errorElement = inputElement[0].nextElementSibling; // the error message div
        } else {
            v = validateFunc(inputElement[0].value, inputElement[1].value); // call the validation function
            errorElement = inputElement[0].nextElementSibling; // the error message div
        }

        errorElement.innerHTML = v.isValid ? '' : v.message; // display the error message
        v.isValid ? inputElement[0].classList.remove("is-invalid") : inputElement[0].classList.add("is-invalid");
        return v.isValid;
    }

    const validateFirstRegisterInput = (firstNameInputElem, lastNameInputElem, emailInputElem, data) => {

        firstNameInputElem.value = firstNameInputElem.value.trim().toLowerCase();
        lastNameInputElem.value = lastNameInputElem.value.trim().toLowerCase();
        emailInputElem.value = emailInputElem.value.trim().toLowerCase();

        let v1 = validateInput([firstNameInputElem], validatorModule.isNotEmpty);
        v1 = v1 ? validateInput([firstNameInputElem], validatorModule.hasLetter) : false;


        let v2 = validateInput([lastNameInputElem], validatorModule.isNotEmpty);
        v2 = v2 ? validateInput([lastNameInputElem], validatorModule.hasLetter) : false;

        let v3 = validateInput([emailInputElem], validatorModule.isNotEmpty);
        v3 = v3 ? validateInput([emailInputElem], validatorModule.isEmail) : false;

        if (data)
            validateInput([emailInputElem], validatorModule.isExist);

        return v1 && v2 && v3 && (!data);

    }

    const validationPasswordsInput = (passwordInputElem, confirmPasswordInputElem) => {

        passwordInputElem.value = passwordInputElem.value.trim();
        confirmPasswordInputElem.value = confirmPasswordInputElem.value.trim();

        let v1 = validateInput([passwordInputElem], validatorModule.isNotEmpty);
        v1 = v1 ? validateInput([passwordInputElem], validatorModule.isBiggerThan) : false;

        let v2 = validateInput([confirmPasswordInputElem], validatorModule.isNotEmpty);
        v2 = v1 && v2 ? validateInput([confirmPasswordInputElem, passwordInputElem], validatorModule.isEqual) : false;

        return v1 && v2;
    }

    document.addEventListener('DOMContentLoaded', function () {

        let emailInputElem = document.getElementById("emailInput");
        let firstNameInputElem = document.getElementById("firstNameInput");
        let lastNameInputElem = document.getElementById("lastNameInput");
        let passwordInputElem = document.getElementById("passwordInput");
        let confirmPasswordInputElem = document.getElementById("confirmPasswordInput");

        document.getElementById("registerFirstPart").addEventListener("click", (event) => {

            fetch("/api/resources/isValidEmail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "email": emailInputElem.value.trim() })
            }).then(function (response) {
                return response.json();
            }).then(function (data) {

                if (validateFirstRegisterInput(firstNameInputElem, lastNameInputElem, emailInputElem, data)) {

                    setCookie(emailInputElem.value, "registerTimer");
                    document.getElementById("registerForm").classList.add('d-none');
                    document.getElementById("passwordDiv").classList.remove('d-none');
                }

            }).catch(function (error) {
                viewErrorModal(error);
                console.log(error);
            });

        });
        document.getElementById("passwordForm").addEventListener("submit", (event) => {

            event.preventDefault();

            const v1 = validationPasswordsInput(passwordInputElem, confirmPasswordInputElem);
            const v2 = getCookie(emailInputElem.value);

            if (!v2) {
                document.getElementById("toSlow").classList.remove("d-none");
                document.getElementById("passwordDiv").classList.add('d-none');
            }
            else if (v1) {
                fetch('/register/add-user', {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "first_name": lastNameInputElem.value,
                        "last_name": firstNameInputElem.value,
                        "email": emailInputElem.value,
                        "password": passwordInputElem.value
                    })
                }).then(function (response) {
                    return response.json();
                }).then(function (data) {
                    console.log("Data: ", data);
                    if (data) {
                        //we sing up successfully and continue to success:
                        delete_cookie(emailInputElem.value);
                        document.getElementById("passwordForm").submit();
                    } else {
                        //something go Wrong on submit so we print error:
                        viewErrorModal(error);
                        console.log(error);
                    }

                }).catch(function (error) {
                    viewErrorModal(error);
                    console.log(error);
                });
            }
        });
    });
})();