// variable to hold the db connection
let db;

// create the connection to indexedDB database called "budget_tracker", set to version 17
const request = indexedDB.open("budget_tracker", 1);

// this event emits if the db version changes
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_entry", { autoIncrement: true });
};

// upon successful request
request.onsuccess = function (event) {
  // when db is created w/ its object store, save ref to db in global var
  db = event.target.result;
  // if app is online, send local db data to api
  if (navigator.online) {
      uploadEntry();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// execute if attempting new entry/record while offline
function saveRecord(record) {
  // open new transaction with db with readwrite permission
  const transaction = db.transaction(["new_entry"], "readwrite");

  // access object store for new_entry
  const budgetObjectStore = transaction.objectStore("new_entry");

  // add entry/record to store
  budgetObjectStore.add(record);
}

function uploadEntry() {
  // new transaction
  const transaction = db.transaction(["new_entry"], "readwrite");
  // access the objectstore
  const budgetObjectStore = transaction.objectStore("new_entry");
  // get records from store, send to a variable
  const getAll = budgetObjectStore.getAll();

  // when getAll is successful...
  getAll.onsuccess = function () {
    // if there's data in the idb, send it to the api
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then(response => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open another transaction
          const transaction = db.transaction(["new_entry"], "readwrite");
          // access new_entry object store
          const budgetObjectStore = transaction.objectStore("new_entry");
          // clear the store
          budgetObjectStore.clear();

          alert("Saved entries have been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}



// listen for app to come back online
window.addEventListener('online', uploadEntry);