//Declare variables
var aFields = document.getElementById("side-a");
var bFields = document.getElementById("side-b");
var submitBtn = document.getElementById("submit");
var eraseBtn = document.getElementById("erase");
var activeCard = 0; //initialize


//When the page loads, display the card.
window.addEventListener('load', onLoad);
async function onLoad(e) {

   //Get the active card id and print to console
   activeCard = await getActiveCard();
   console.log("Active card is " + activeCard);

   //Get the active card
   var cardContent = await getCard(activeCard);
   console.log("card: " + JSON.stringify(cardContent));

   //Populate the form with the current data on the card.
   displayContent(cardContent);

}


//Display input fields for the card based on the card content.
function displayContent(cardContent) {

   //Write html for required number of a side fields.
   var htmlA = '<h2>Side A:</h2>';
   for (var i = 0; i < cardContent[0].length; i++) {
      htmlA += '<input type="text" class="field" name="a' + i + '" id="a' + i + '" value="' + cardContent[0][i] + '"><br>';
   }

   //Write html for required number of b side fields.
   var htmlB = '<h2>Side B:</h2>';
   for (var i = 0; i < cardContent[1].length; i++) {
      htmlB += '<input type="text" class="field" name="b' + i + '" id="b' + i + '" value="' + cardContent[1][i] + '"><br>';
   }

   //Update webpage.
   aFields.innerHTML = htmlA;
   bFields.innerHTML = htmlB;

}


//When the form is submitted, update the card and redirect user to edit-deck page.
submitBtn.addEventListener('click', updateCard);
async function updateCard(e) {

   //Get the active deck FIXME?
   var activeDeckID = await getActiveDeck();

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

   //Update card
   db.cards.put({
      id: Number(activeCard),
      deck: Number(activeDeckID),
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


//When the erase button is clicked, erase the card
//and redirect user to edit-deck page.
eraseBtn.addEventListener('click', eraseCard);
function eraseCard(e) {
   db.cards.delete(Number(activeCard))
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
