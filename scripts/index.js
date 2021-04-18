//Declare variables
var eraseBtn = document.getElementById("erase");
var ul = document.getElementById("decks-list");
var editBtns = document.getElementsByClassName("edit-button");


// //Initialize active deck and card. (This may be unnecessary?)
// db.active.put({ 
//    id: 99999,
//    activeDeckID: '',
//    activeCardID: ''
// })


//When the page loads, display the decks in ul on the webpage.
window.addEventListener('load', onLoad);
//function onLoad(decks) {
async function onLoad() {
   var html = '';
   console.log("Rendering decks now.");
   
   //Check how much data is available.
   showEstimatedQuota();
 
   //Make sure the storage is persistent. (From https://dexie.org/docs/StorageManager)
   isStoragePersisted().then(async isPersisted => {
     if (isPersisted) {
       console.log(":) Storage is successfully persisted.");
     } else {
       console.log(":( Storage is not persisted.");
       console.log("Trying to persist..:");
       if (await persist()) {
         console.log(":) We successfully turned the storage to be persisted.");
       } else {
         console.log(":( Failed to make storage persisted");
       }
     }
   });
 
   //Reset the active deck and card.
   //resetActiveCard(void 0);
 
 //For each item in todo db, add a string of html containing its info
 //and a delete button to the html variable.
 ul.innerHTML = html;
 db.decks.each(function(deck) {
   //Use this code to add text and button
   //html += '<li><button class="edit-button" id="'+deck.id+'">edit</button>'+deck.title+'</li>';
   
   //Use this code to add just a link:
   //html += '<li><a href="edit-deck.html">' + deck.title + '</a></li>';
   
   //Use this code to add just a button
   html += '<li><button class="edit-button" id="' + deck.id + '">' + deck.title + '</button></li>';

   //console.log("Rendering a deck.");
 })
   //Then put html into ul on webpage.
   .then(()=> {
      ul.innerHTML = html;
      //console.log("Done rendering decks.");
      checkDexie();
      });
}


//When the edit button is clicked, set this deck as the active deck
//and then redirect to the edit-deck page.
ul.addEventListener('click', editBtnHandler);
async function editBtnHandler(e) {
   
   // Find the clicked element (e.target)
	console.log("List item ", e.target.id.replace("post-", ""), " was clicked!");
	var buttonID = e.target.id.replace("post-", "");
	
   //Set the active deck and print to console
   var message = await setActiveDeck(buttonID);
   console.log("Active deck is " + message);
   
   //redirect to the edit-deck page
   window.location.href = "edit-deck.html";
}


//Set the active deck in the "active" table of db.
async function setActiveDeck(buttonID) {
   var activeDeck = '';
   
   //Set this deck as the active deck.
   //(variable key is a promise)
   var key = await db.active.put({ 
      id: 99999,
      activeDeckID: buttonID
   });
   
   //Then print info to console to check.
   try {
      activeDeck = await db.active.get(key);
      activeDeck = activeDeck.activeDeckID;
      console.log("Active deck is " + activeDeck);
      return activeDeck;
   }
   catch (err) {
      console.error ("Oh uh: " + err);
   }
}


//Delete the db and refresh the page when the "Erase all Decks" button is pressed
eraseBtn.addEventListener('click', eraseDecks);
function eraseDecks(e) {
   //"Static method"
   //Dexie.delete('decks-dexie');
   
   db.delete()
      .then(() => {
         console.log("Database successfully deleted");
         
         //Refresh page.
         displayDecks();
      })
      .catch((err) => {
         console.error("Could not delete database");
      });
}
