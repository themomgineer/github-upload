//Declare variables
var deckTitleEl = document.getElementById("deck-title");
var cardEl = document.getElementById("card-content");
var stateChangeBtn = document.getElementById("state-change");
var deselectBtn = document.getElementById("deselect");
var shuffleBtn = document.getElementById("shuffle");
var repeatBtn = document.getElementById("repeat");
var activeDeckID = 0; //initialize, id of active deck
var activeDeckObj; //initialize
var activeDeckTitle = ''; //initialize
var activeCard = 0; //initialize
var cardContent = []; //initialize
var allCardsInDeck = []; //initialize
var lastCardInDeck = 0; //initialize

//Initialize state machine to side a.
//Only other possible state is 'b'.
var state = 'a';


//When the page loads, display the card.
window.addEventListener('load', onLoad);
async function onLoad(e) {
   //Get the active deck and print to console
   activeDeckID = await getActiveDeck();
   console.log("Active deck is " + activeDeckID);

   //Store all the cards in the deck that are selected in an array.
   allCardsInDeck = await db.cards.where('deck').equals(activeDeckID).and(card => card.select==true).toArray();
   lastCardInDeck = allCardsInDeck[allCardsInDeck.length-1].id;
   //console.log("Last card in deck: " + lastCardInDeck);

   //Update page heading as deck title.
   activeDeckObj = await getActiveDeckObj(activeDeckID);
   activeDeckTitle = activeDeckObj.title;
   deckTitleEl.innerHTML = activeDeckTitle;

   //Display the correct value for the shuffle checkbox.
   if(activeDeckObj.shuffle === true) {
      shuffleBtn.checked = true;
   }

   //Display the correct value for the repeat checkbox.
   if(activeDeckObj.repeat === true) {
      repeatBtn.checked = true;
   }

   //Get the active card id and print to console.
   activeCard = await getActiveCard();

   //If the active card is undefined, set it to the first card in the deck.
   if(activeCard === undefined) {
      //console.log("Card is undefined.");
      activeCard = allCardsInDeck[0].id;
   }
   console.log("Active card is " + activeCard);

   //Get the active card content.
   cardContent = await getCard(activeCard);
   //console.log("card: " + JSON.stringify(cardContent));

   //Update the card-content html and state-change button.
   displaySideA();
}


//When state change button is clicked:
//update the state,
//update the card-content html,
//update the state change button text.
stateChangeBtn.addEventListener('click', onStateChangeClick);
function onStateChangeClick() {

    //Update the state.
    if(state == 'a'){
        displaySideB();
        state = 'b';
        //console.log("State change: b")
    }
    else if(state == 'b'){
        displayNewCard();
        state = 'a';
        //console.log("State change: a")
   }
   else {console.error ('Invalid state.');}

}


//This function updates the html to show the side a content of the
//active card.
function displaySideA() {

   //Display the side b card content in the html.
   cardEl.innerHTML = '';
   for(var i=0; i < cardContent[0].length; i++) {
      cardEl.innerHTML += '<h2>' + cardContent[0][i] + '</h2><br>';
   }

   //Update the state change button.
   stateChangeBtn.innerHTML = 'Flip Card';

}


//This function updates the html to show the side b content of the
//active card.
function displaySideB() {

   //Display the side b card content in the html.
   cardEl.innerHTML = '';
   for(var i=0; i < cardContent[1].length; i++) {
      cardEl.innerHTML += '<h2>' + cardContent[1][i] + '</h2><br>';
   }

   //Update the state change button.
   if((activeCard == lastCardInDeck) & (!repeatBtn.checked)) {
       stateChangeBtn.innerHTML = 'I\'m done!';
   }
   else {
       stateChangeBtn.innerHTML = 'Next Card';
   }


}


//This function changes the active card to the next card in the deck
//and updates the html to show the side a content of the new active card. FIXME
//Only make selected cards active!
async function displayNewCard() {

   //Get the next card.
   //If this is the last card in the deck,
   if(activeCard == lastCardInDeck) {

        if(repeatBtn.checked) {
            //If repeating, cycle back to the first card.
            activeCard = allCardsInDeck[0].id;
        }
        else {
            //If not repeating, escape to Deck page.
            window.location.href = 'edit-deck.html';
        }

   }
   //Otherwise, just cycle to the netxt card.
   else {
      var i=0;
      while(allCardsInDeck[i].id <= activeCard){
         i++;
      }
      activeCard = allCardsInDeck[i].id;
   }
   console.log("New card is : " + activeCard);

   //Get the new active card content.
   cardContent = await getCard(activeCard);

   //Update the card-content html and state-change button.
   displaySideA();

}


//When the deselect button is pushed, deselect this card and
//go to the next card.
deselectBtn.addEventListener('click', onDeselectClick);
async function onDeselectClick() {

   console.log("You clicked deselect.");

   //Deselect this card.
   db.cards.update(activeCard, {select: false})

   //Update var containing all cards in the deck that are selected
   .then(async function(){
      allCardsInDeck = await db.cards.where('deck').equals(activeDeckID).and(card => card.select==true).toArray();
      lastCardInDeck = allCardsInDeck[allCardsInDeck.length-1].id;
   })

   .then(function() {

      //Update state to 'a'.
      state = 'a';

      //Go to the next card.
      displayNewCard();
   });

}


//When shuffle checkbox is clicked, update the shuffle value for the deck.
shuffleBtn.addEventListener('click', onShuffleClick)
async function onShuffleClick(e) {

   //Checkbox was checked, so set shuffle to true in db
   var ifSuccess;
   if(shuffleBtn.checked) {
      ifSuccess = await db.decks.update(parseInt(activeDeckID, 10), {shuffle: true});
   }
   //Checkbox was unchecked, so set shuffle to false in db
   else {
      console.log("Checkbox was unchecked.");
      ifSuccess = await db.decks.update(parseInt(activeDeckID, 10), {shuffle: false});
   }
}


//When repeat checkbox is clicked, update the repeat value for the deck.
repeatBtn.addEventListener('click', onRepeatClick)
async function onRepeatClick(e) {

   //Checkbox was checked, so set shuffle to true in db
   var ifSuccess;
   if(repeatBtn.checked) {
      ifSuccess = await db.decks.update(parseInt(activeDeckID, 10), {repeat: true});
   }
   //Checkbox was unchecked, so set repeat to false in db
   else {
      console.log("Checkbox was unchecked.");
      ifSuccess = await db.decks.update(parseInt(activeDeckID, 10), {repeat: false});
   }
}
