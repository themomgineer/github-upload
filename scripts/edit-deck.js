//Declare variables
var newBtn = document.getElementById("new-card");
var playBtn = document.getElementById("play");
var eraseBtn = document.getElementById("erase");
var selectBtn = document.getElementById("select-all");
var deselectBtn = document.getElementById("deselect-all");
var deckTitleEl = document.getElementById("deck-title");
var selectEl = document.getElementById("select");
var shuffleEl = document.getElementById("shuffle");
var ulCards = document.getElementById("cards-list");
var cardBtns = document.getElementsByClassName("edit-button"); //Live array
var activeDeckID = 0; //initialize
var activeDeckTitle = ''; //initialize

//When the page loads, display the cards.
window.addEventListener('load', onLoad);
async function onLoad(e) {

   //Get the active deck and print to console
   activeDeckID = await getActiveDeck();
   console.log("Active deck is " + activeDeckID);

   //Update page heading as deck title.
   var activeDeckObj = await getActiveDeckObj(activeDeckID);
   deckTitleEl.innerHTML = activeDeckObj.title;

  //Display the cards on the page.
   renderCards();

   //Display the correct value for the shuffle checkbox.
   if(activeDeckObj.shuffle === true) {
      shuffleEl.checked = true;
   }

   //Also, reset the active card.
   resetActiveCard(activeDeckID);

}


//Get the cards from the db and display them on the page.
function renderCards() {

   //For each card in deck, add a button to the card
   //and a select checkbox to the html variable.
   var html = '';
   ulCards.innerHTML = html;
   db.cards.each(function(card) {

      if(card.deck == activeDeckID) {

         //If there is at least one card in the deck, display a label
         //above the list of cards.
         selectEl.innerHTML = 'Select: ';

         //Use this code to add a checkbox where the label is a button
         //linking to that card (edit-card.html).
         //If the card is selected, then check the checkbox.
         if(card.select) {
            html += '<li><input type="checkbox" name="cards" value="' + card.id + '" id="checkbox-' + card.id + '" checked><button class="edit-button" id="' + card.id + '">' + card.tag + '</button><br></li>';
         }
         else {
            html += '<li><input type="checkbox" name="cards" value="' + card.id + '" id="checkbox-' + card.id + '"><button class="edit-button" id="' + card.id + '">' + card.tag + '</button><br></li>';
         }
      }
   })

   //Then put html into ul on webpage.
   .then(()=> {
      ulCards.innerHTML = html;
      });

}


//When shuffle checkbox is clicked, update the shuffle value for the deck.
shuffleEl.addEventListener('click', onShuffleClick)
async function onShuffleClick(e) {

   //Checkbox was checked, so set shuffle to true in db
   var ifSuccess;
   if(shuffleEl.checked) {
      ifSuccess = await db.decks.update(parseInt(activeDeckID, 10), {shuffle: true});
   }
   //Checkbox was unchecked, so set shuffle to false in db
   else {
      console.log("Checkbox was unchecked.");
      ifSuccess = await db.decks.update(parseInt(activeDeckID, 10), {shuffle: false});
   }
}


//When "new card" button is clicked, redirect to the new-card page.
//Right now, just send to the with-template page. FIXME
newBtn.addEventListener('click', onNewClick);
function onNewClick() {
   window.location.href = "new-card-with-template.html";
}


//When "erase deck" button is clicked, erase the deck and
//redirect user to the index.
eraseBtn.addEventListener('click', onEraseClick);
function onEraseClick() {

      //Erase deck
      db.decks.delete(Number(activeDeckID))

      //Erase all cards in the activeDeck
      .then(function() {
         db.cards.where('deck').equals(activeDeckTitle).delete();
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


//When a card button is clicked, redirect user to the edit-card page.
//When its checkbox is clicked, toggle the checkbox and the
//select value of that card.
ulCards.addEventListener('click', onCardClick);
async function onCardClick(e) {

   // Find the clicked element (e.target)
	console.log("List item ", e.target.id.replace("post-", ""), " was clicked!");
	var clickedID = e.target.id.replace("post-", "");
	//console.log("clickedID: " + clickedID);

	//If the card button was clicked, update the active card and redirect
	//user to the edit card page.
	var message;
	if (!isNaN(clickedID)) {   //"is Not a Number" (button id is just the card id number)
      message = await setActiveCard(clickedID);
      console.log("Active card is " + message);
      window.location.href = "edit-card.html";
	}

	//If the checkbox was clicked, update the active card and
	//toggle the card's select property
	else {   //checkbox id is the word "checkbox" and the card id number
	   var buttonID = clickedID.slice(-1);
	   console.log("ID of checkbox: " + buttonID);
	   message = await setActiveCard(buttonID);
      //console.log("Active card is " + message);
      var ifChecked = document.getElementById(clickedID).checked;
      console.log("Checkbox value: " + ifChecked);

	   db.cards.update(Number(buttonID), {select: ifChecked})
	  // .then(function() {
	  //    checkDexie();
	  // })
	   ;
	}

}


//Set the active card in the "active" table of db.
async function setActiveCard(buttonId) {
   var activeCard = '';

   //Set this deck as the active deck.
   var key = await db.active.put({
      id: 99999,
      activeDeckID: activeDeckID,
      activeCardID: buttonId
   });

   //Then print info to console to check.
   //Return active card id.
   try {
      activeCard = await db.active.get(key);
      activeCard = activeCard.activeCardID;
      //console.log("Active card is " + activeCard);
      return activeCard;
   }
   catch (err) {
      console.error ("Oh uh: " + err);
   }
}


//When play button is clicked, redirect to the play page.
playBtn.addEventListener('click', onPlayClick);
function onPlayClick(e) {
   window.location.href = "play-deck.html";
}


//When select button is clicked, select all the cards in the deck.
selectBtn.addEventListener('click', onSelectClick);
function onSelectClick(e) {

   //Go through cards db and update each card that is in this deck.
   db.cards.each(function(card) {

      var currentID = card.id;
      if(card.deck == activeDeckID) {

         //If the card is not selected, update it to be selected.
         if(!card.select) {
            db.cards.update(currentID, {select: true});
         }
      }
   })

   //Then refresh the cards.
   .then(function() {
      console.log("Done selecting cards.");
      renderCards();
   });

}


//When deselect button is clicked, deselect all the cards in the deck.
deselectBtn.addEventListener('click', onDeselectClick);
function onDeselectClick(e) {

   //Go through cards db and update each card that is in this deck.
   db.cards.each(function(card) {

      var currentID = card.id;
      if(card.deck == activeDeckID) {

         //If the card is selected, update it to be deselected.
         if(card.select) {
            db.cards.update(currentID, {select: false});
         }
      }
   })

   //Then refresh the cards.
   .then(function() {
      console.log("Done deselecting cards.");
      renderCards();
   });

};
