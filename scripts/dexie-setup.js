//Declare variables
var db = new Dexie("decks-dexie");


//Define database db scheme:
db.version(1).stores({

   //Each deck will also contain unindexed properties:
   //ifTemplate [true/false]
   //numFieldsSideA
   //numFieldsSideB
   //shuffle [true/false]
   decks: "++id, title",

   //The deck is the id of the deck this card is in.
   //The tag is what will be displayed on the webpage as the link
   //to that card. Default will be first input field on side a.
   //Select (true or false) indicates whether the card is selected to be
   //played. (Default is true.)
   //Each card will also contain the unindexed property:
   //content [[(side A fields)],[(side B fields)]]
   cards: "++id, deck, tag, select",

   //In 'active' table, id will be set to 99999. Then I can update this item
   //and make sure that I only have 1 item in the table.
   //(There's probably a better way to do this.)
   active: "id, activeDeckID, activeCardID"
});


//Open db. This should be unnecessary, but it doesn't seem to work without it...
db.open()
   .then(function() {
      //console.log("The db " + db.name + " is open.");
      //checkDexie();
   });


//This function makes the storage persistent.
async function persist() {
  return await navigator.storage && navigator.storage.persist &&
    navigator.storage.persist();
}


//This function checks if the storage is persistent.
 async function isStoragePersisted() {
  return await navigator.storage && navigator.storage.persisted &&
    navigator.storage.persisted();
}


//This function logs to console how much data is available.
async function showEstimatedQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimation = await navigator.storage.estimate();
    console.log(`Quota: ${estimation.quota}`);
    console.log(`Usage: ${estimation.usage}`);
  } else {
    console.error("StorageManager not found");
  }
}


//Use this function to check on the contents of the db.
function checkDexie() {
   db.decks.each(function(deck) {
      console.log("You have a deck titled: " + deck.title);
   // console.log("id: " + deck.id);
   // console.log("ifTemplate: " + deck.ifTemplate);
   // console.log("numFieldsSideA: " + deck.numFieldsSideA);
   // console.log("numFieldsSideB: " + deck.numFieldsSideB);
      console.log("Shuffle: " + deck.shuffle);
    })

    db.cards.each(function(card) {
        console.log("You have a card tagged: " + card.tag);
        console.log("Its id is: " + card.id);
        console.log("Its deck is: " + card.deck);
        //console.log("Selected? " + JSON.stringify(card.select));
        console.log("Its content is: " + JSON.stringify(card.content));
    });

    console.log("Done checking dexie.");
}


//Returns the active deck id.
async function getActiveDeck() {

   try {
      var activeDeck = await db.active.get(99999);
      activeDeck = activeDeck.activeDeckID;
      return activeDeck;
   }
   catch (err) {
      console.error ("Oh uh: " + err);
   }
}


//Returns active deck object
async function getActiveDeckObj(activeDeck) {

   //Print info to console to check.
   try {
      var deckObj = await db.decks.get(Number(activeDeck));
      console.log("deck: " + JSON.stringify(deckObj));
      return deckObj;
   }
   catch (err) {
      console.error ("Oh uh: " + err);
   }
}


//Returns the active card id.
async function getActiveCard() {

   //Print info to console to check.
   try {
      var active = await db.active.get(99999);
      active = active.activeCardID;
      return active;
   }
   catch (err) {
      console.error ("Oh uh: " + err);
   }
}


//Returns the card content as an array.
async function getCard(activeCard) {
   var cardContent = await db.cards.get(Number(activeCard));
   cardContent = cardContent.content;
   return cardContent;
}


//Reset the active card in the "active" table of db to 'undefined'
async function resetActiveCard(activeDeck) {
   var activeCard = '';

   //Set this deck as the active deck.
   var key = await db.active.put({
      id: 99999,
      activeDeckID: activeDeck,
      activeCardID: void 0 //sets activeCardID as undefined
   });

   //Then print info to console to check.
   //Return active card id.
   //Don't catch because I expect value of undefined.
   // try {
      activeCard = await db.active.get(key);
      activeCard = activeCard.activeCardID;
      console.log("Active card is " + activeCard);
      return activeCard;
   // }
   // catch (err) {
   //    console.error ("Oh uh: " + err);
   // }
}
