//Declare variables
var aFields = document.getElementById("side-a");
var bFields = document.getElementById("side-b");
var submitBtn = document.getElementById("submit");


//When the page loads, display the input fields.
window.addEventListener('load', onLoad);
async function onLoad(e) {
   
   //Get the active deck and print to console
   var activeDeck = await getActiveDeck();
   activeDeck = activeDeck.activeDeckID;
   console.log("Active deck is " + activeDeck);
   
   //Get the num of fields on the cards in this deck.
   //numFields = [numFieldsSideA, numFieldsSideB]
   var numFields = await getTemplate(activeDeck);
   
   //Display the appropriate number of input fields
   //on the webpage.
   displayFields(numFields);
   
   return activeDeck;
}


//This function gets the number of fields on each card side
//for this deck.
async function getTemplate(activeDeck) {
   
   //Convert id into a number. (Otherwise it is type undefined.)
   var numID = Number(activeDeck);
   
   //Get info from deck.
   var deck = await db.decks.get(numID);
   var numA = deck.numFieldsSideA;
   var numB = deck.numFieldsSideB;
   console.log("Number of fields on side A: " + numA);
   console.log("Number of fields on side B: " + numB);
   
   return [numA, numB];
}


//Display input fields for the card based on the template.
function displayFields(numFields) {

   //Write html for required number of a side fields.
   var htmlA = '<h2>Side A:</h2>';
   for (var i = 0; i < numFields[0]; i++) {
      htmlA += '<input type="text" class="field" name="a' + i + '" id="a' + i + '"><br>';
   }
   
   //Write html for required number of b side fields.
   var htmlB = '<h2>Side B:</h2>';
   for (var i = 0; i < numFields[1]; i++) {
      htmlB += '<input type="text" class="field" name="b' + i + '" id="b' + i + '"><br>';
   }
   
   //Update webpage.
   aFields.innerHTML = htmlA;
   bFields.innerHTML = htmlB;
   
}


//When the form is submitted, add a new card to the deck and redirect
//user to edit-deck page.
submitBtn.addEventListener('click', makeCard);
async function makeCard(e) {
   
   //Get the active deck and print to console
   var activeDeckID = await getActiveDeck();
   activeDeckID = activeDeckID.activeDeckID;
   
   //Prevent default response of form.
   e.preventDefault();
   
   //Declare variables for page elements.
   //Not sure if this has to be here or can go to top. FIXME
   var sideADiv = document.getElementById("side-a");
   var inputFieldsSideA = sideADiv.getElementsByClassName("field");
   var sideBDiv = document.getElementById("side-b");
   var inputFieldsSideB = sideBDiv.getElementsByClassName("field");
   
   //Format the card info from the input fields into an object
   var cardA = [];
   var cardB = [];
   for (var i=0; i<inputFieldsSideA.length; i++) {
      cardA[i] = inputFieldsSideA[i].value;
   }
   for (var i=0; i<inputFieldsSideB.length; i++) {
      cardB[i] = inputFieldsSideB[i].value;
   }
   var card = [cardA, cardB];
   //console.log("card: " + JSON.stringify(card));
   
   //Add card to the deck.
   db.cards.add({ 
      deck: activeDeckID,
      tag: cardA[0],
      select: true,
      content: card
   })
   
      //Then print info to console to check.
      .then(function() {
         console.log("Finished putting stuff in db.");
         checkDexie();
      })
      .then(function() {
         window.location.href = "edit-deck.html";   
      })
      .catch('NoSuchDatabaseError', function(e) {
          // Database with that name did not exist
          console.error ("Database not found");
      })
      .catch(function (e) {
          console.error ("Oh uh: " + e);
      });
}