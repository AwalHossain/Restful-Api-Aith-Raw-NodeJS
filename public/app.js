/*
 * Frontend Logic for application
 *
 */

// Container for frontend application
var app = {};

// Config
app.config = {
  'sessionToken': false
};

// AJAX Client (for RESTful API)
app.client = {}

// Interface for making API calls
app.client.request = function (headers, path, method, queryStringObject, payload, callback) {

  // Set defaults
  headers = typeof (headers) == 'object' && headers !== null ? headers : {};
  path = typeof (path) == 'string' ? path : '/';
  method = typeof (method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof (queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof (payload) == 'object' && payload !== null ? payload : {};
  callback = typeof (callback) == 'function' ? callback : false;

  // For each query string parameter sent, add it to the path
  var requestUrl = path + '?';
  var counter = 0;
  for (var queryKey in queryStringObject) {
    if (queryStringObject.hasOwnProperty(queryKey)) {
      counter++;
      // If at least one query string parameter has already been added, preprend new ones with an ampersand
      if (counter > 1) {
        requestUrl += '&';
      }
      // Add the key and value
      requestUrl += queryKey + '=' + queryStringObject[queryKey];
    }
  }

  // Form the http request as a JSON type
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  // For each header sent, add it to the request
  for (var headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }

  // If there is a current session token set, add that as a header
  if (app.config.sessionToken) {
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      var statusCode = xhr.status;
      var responseReturned = xhr.responseText;

      // Callback if requested
      if (callback) {
        try {
          var parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        } catch (e) {
          callback(statusCode, false);
        }

      }
    }
  }

  // Send the payload as JSON
  var payloadString = JSON.stringify(payload);
  xhr.send(payloadString);

};

// Bind the logout button

app.bindLogoutButton = () => {

  let logout = document.getElementById("logoutButton");

  console.log(logout);
  logout.addEventListener("click", (e) => {
    // Stop it from redirecting anywhere
    e.preventDefault();
    console.log("clicked");

    // logs the user out
    app.logUserOut();
  })
}


// Log the user out then redirect them
app.logUserOut = (redirectUser) => {
  // set the ridirectUser to default to true
  redirect = typeof (redirectUser) == 'boolean' ? redirectUser : true;


  // get the current token id ;
  let tokenId = typeof (app.config.sessionToken.id) === 'string' ? app.config.sessionToken.id : false;

  // fetch the delete api

  fetch(`http://localhost:3000/api/token?id=${tokenId}`)
    .then(res => res.json())
    .then(data => {
      console.log(data, "delete token");
      app.setSessionToken(false);
      window.location = '/session/delete'
      if (typeof (app.config.sessionToken) !== 'object') {
        console.log("not object");
      }
    })
}




// Bind the forms
app.bindForms = function () {
  document.querySelector("form").addEventListener("submit", function (e) {

    // Stop it from submitting
    e.preventDefault();
    var formId = this.id;
    var path = this.action;
    var method = this.method.toUpperCase();

    // Hide the error message (if it's currently shown due to a previous error)
    document.querySelector("#" + formId + " .formError").style.display = 'hidden';

    // Turn the inputs into a payload
    var payload = {};
    var elements = this.elements;
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].type !== 'submit') {
        var valueOfElement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value;
        payload[elements[i].name] = valueOfElement;
      }
    }
  });
};


// Bind the forms
app.bindForms = function () {
  if (document.querySelector("form")) {
    document.querySelector("form").addEventListener("submit", function (e) {

      // Stop it from submitting
     
      e.preventDefault();

      var formId = this.id;
      var path = this.action;
      var method = this.method.toUpperCase();

      // Hide the error message (if it's currently shown due to a previous error)
      document.querySelector("#" + formId + " .formError").style.display = 'hidden';

         // Turn the inputs into a payload
         var payload = {};
         var elements = this.elements;
         for(var i = 0; i < elements.length; i++){
           if(elements[i].type !== 'submit'){
             // Determine class of element and set value accordingly
             var classOfElement = typeof(elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
             var valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
             var elementIsChecked = elements[i].checked;
             // Override the method of the form if the input's name is _method
             var nameOfElement = elements[i].name;
             if(nameOfElement == '_method'){
               method = valueOfElement;
             } else {
               // Create an payload field named "method" if the elements name is actually httpmethod
               if(nameOfElement == 'httpmethod'){
                 nameOfElement = 'method';
               }
               // If the element has the class "multiselect" add its value(s) as array elements
               if(classOfElement.indexOf('multiselect') > -1){
                 if(elementIsChecked){
                   payload[nameOfElement] = typeof(payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                   payload[nameOfElement].push(valueOfElement);
                 }
               } else {
                 payload[nameOfElement] = valueOfElement;
               }
 
             }
           }
         }




      // Call the API
      if (formId == 'accountCreate') {
        fetch("http://localhost:3000/api/users", {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(res => res.json())
          .then(responsePayload => {
            console.log(responsePayload.status === 200)
            // If successful, send to form response processor
            app.formResponseProcessor(formId, payload, responsePayload)
          }
          )
      }

      /** Login in purpose */

      if (formId == 'sessionCreate') {
        app.formResponseProcessor(formId, payload)
      }


      /** Delete User */

      if(formId == 'accountEdit3'){
        console.log(this.id,"oajo", payload);
        app.formResponseProcessor(formId, payload);
      }


      /** Create Checks */

      if(formId == 'checksCreate'){
        console.log(elements, payload);
        app.formResponseProcessor(formId, payload)
      }


    });
  }
};

// Form response processor
app.formResponseProcessor = function (formId, requestPayload) {
  var functionToCall = false;
  // If account creation was successful, try to immediately log the user in
  if (formId == 'accountCreate' || formId == 'sessionCreate') {
    // Take the phone and password, and use it to log the user in
    var newPayload = {
      'phone': requestPayload.phone,
      'password': requestPayload.password
    };



    fetch("http://localhost:3000/api/token", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPayload)
    })
      .then(res => res.json())
      .then(responsePayload => {
        // if(typeof(requestPayload) === 'object'){
        // If successful, set the token and redirect the user
        window.location = '/';
        app.setSessionToken(responsePayload);
        // }
      })



  }

  /** Account delet method */

  if(formId == 'accountEdit3'){
    let phone = typeof (app.config.sessionToken.phone) === 'string' ? app.config.sessionToken.phone : false;
    console.log(phone,'o');
    // get the current token id ;
    fetch(`http://localhost:3000/api/users?phone=${phone}`,{
        method:"DELETE",
        headers:{
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "token": app.config.sessionToken.id
        }
      
    })
    .then(res => res.json())
    .then(data => {
      console.log(data.success)
      if(data.success){
        window.location = ("/account/deleted")
        app.logUserOut();
      }
    })
  }

/**  Create Checks */

if(formId == 'checksCreate'){
  fetch("http://localhost:3000/api/checks",{
    method:"POST",
    headers:{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      "token": app.config.sessionToken.id
    },
    body: JSON.stringify(requestPayload)
  })
  .then(res => res.json())
  .then(data=> console.log(data))
}


};






// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function () {
  var tokenString = localStorage.getItem('token');
  if (typeof (tokenString) == 'string') {
    try {
      var token = JSON.parse(tokenString);
      console.log();
      app.config.sessionToken = token;
      if (typeof (token) == 'object') {
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    } catch (e) {
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function (add) {
  var target = document.querySelector("body");
  if (add) {
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function (token) {
  console.log(token, "from token");
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token', tokenString);
  if (typeof (token) == 'object') {
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

// Renew the token
app.renewToken = function (callback) {
  console.log("rew");
  var currentToken = typeof (app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
  if (currentToken) {
    //   // Update the token with a new expiration
    var payload = {
      'id': currentToken.id,
      'extend': true,
    };
    fetch("http://localhost:3000/api/token", {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(responsePayload => {
        console.log(responsePayload, "from update");
        var queryStringObject = { 'id': currentToken.id };
        // Get the renew token with the help of queryString
        fetch(`http://localhost:3000/api/token?id=${queryStringObject.id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then(data => {
            if (typeof (data) === 'object') {
              console.log(data, "from get method")
              app.setSessionToken(data);
            } else {
              app.setSessionToken(false);
            }
          })
      })




  } else {
    // app.setSessionToken(false);
    // callback(true);

  }
};

// Loop to renew token often
app.tokenRenewalLoop = function () {
  setInterval(function () {
    app.renewToken(function (err) {
      if (!err) {
        console.log("Token renewed successfully @ " + Date.now());
      }
    });
  }, 1000 * 60);
};


// Load data on the page
app.loadDataOnPage = function () {
  // Get the current page from the body class
  var bodyClasses = document.querySelector("body").classList;
  var primaryClass = typeof (bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

  // Logic for account settings page
  console.log("osit ", bodyClasses);
  if (primaryClass == 'accountEdit') {

    app.loadAccountEditPage();
  }
};

// Load the account edit page specifically
app.loadAccountEditPage = function () {
  // Get the phone number from the current token, or log the user out if none is there
  var phone = typeof (app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
  if (phone) {
    // Fetch the user data
    var queryStringObject = {
      'phone': phone
    };



    fetch(`http://localhost:3000/api/users?phone=${phone}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "token": app.config.sessionToken.id
      }
    })
      .then(res => res.json())
      .then(data => data)



    // app.client.request(undefined,'/api/users','GET',queryStringObject,undefined,function(statusCode,responsePayload){
    //   console.log(statusCode, responsePayload);
    //   if(statusCode == 200){
    //     // Put the data into the forms as values where needed
    //     document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.firstName;
    //     document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.lastName;
    //     document.querySelector("#accountEdit1 .displayPhoneInput").value = phone;

    //     // Put the hidden phone field into both forms
    //     var hiddenPhoneInputs = document.querySelectorAll("input.hiddenPhoneNumberInput");
    //     for(var i = 0; i < hiddenPhoneInputs.length; i++){
    //         hiddenPhoneInputs[i].value = phone;
    //     }

    //   } else {
    //     // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
    //     // app.logUserOut();
    //   }
    // });
  } else {
    app.logUserOut();
  }

}



// Init (bootstrapping)
app.init = function () {

  // Bind all form submissions
  app.bindForms();

  // Bind logout logout button
  app.bindLogoutButton();

  // // Get the token from localstorage
  app.getSessionToken();

  // // Renew token
  app.tokenRenewalLoop();

  // edit accoutn
  app.loadDataOnPage();

};

// Call the init processes after the window loads
window.onload = function () {
  app.init();
};
