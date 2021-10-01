// variable to hold the db connection
let db;

// create the connection to indexedDB database called "budget_tracker", set to version 17
const request = indexedDB.open('budget_tracker', 1);

// this event ewmits if the db version changes
request.unupgradedneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_entry', { autoIncrement: true });
};

// upon successful request
request.onsuccess = function(event) {
    // when db is created w/ its object store, save ref to db in global var
    db = event.target.result;
    // if app is online, send local db data to api
    if (navigator.online) {
        uploadEntry();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// execute if attempting new entry/record while offline
function saveRecord(record) {
    // open new transaction with db with readwrite permission
    const transaction = db.transaction(['new_entry'], 'readwrite');

    // access object store for new_entry
    const budgetObjectStore = transaction.objectStore('new_entry');

    // add entry/record to store
    budgetObjectStore.add(record);
}

