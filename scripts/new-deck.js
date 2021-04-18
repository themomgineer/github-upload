//Declare variables
var submitBtn = document.getElementById("submit");
var inputName = document.getElementById("name");
var inputIfTemplate = document.getElementById("template");
var inputNumFieldsSideA = document.getElementById("side-a");
var inputNumFieldsSideB = document.getElementById("side-b");


//When the page loads, reset the active card and deck.
window.addEventListener('load', onLoad);
function onLoad(e) {
   //Reset the active card.
   resetActiveCard(void 0);
   
}


//When the form is submitted, add a new deck to the db and redirect
//user to index.
submitBtn.addEventListener('click', makeDeck);
function makeDeck(e) {
   //Prevent default response of form.
   e.preventDefault();
   
   // //debugger
   // console.log("You clicked the button");
   // console.log("inputName.value: " + inputName.value);
   // console.log("inputIfTemplate.value: " + inputIfTemplate.value);
   // console.log("inputNumFieldsSideA.value: " + inputNumFieldsSideA.value);
   // console.log("inputNumFieldsSideB.value: " + inputNumFieldsSideB.value);
   
   //Add a new deck to the db.
   //New item is an object with text (from form) and id (generated from time).
   db.decks.put({ 
      title: inputName.value,
      ifTemplate: inputIfTemplate.value,
      numFieldsSideA: inputNumFieldsSideA.value,
      numFieldsSideB: inputNumFieldsSideB.value,
      shuffle: false  //initialize to false
   })
   
      //Then print info to console to check.
      .then(function() {
         console.log("Finished putting stuff in db.");
         checkDexie();
      })
      .then(function() {
         window.location.href = "index.html";   
      })
      .catch('NoSuchDatabaseError', function(e) {
          // Database with that name did not exist
          console.error ("Database not found");
      })
      .catch(function (e) {
          console.error ("Oh uh: " + e);
      });
}