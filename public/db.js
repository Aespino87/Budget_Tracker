/// Refered to 17-Mini-Project db.js for setup


let db;
const request = indexedDB.open("Budget", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true});
};

request.onsuccess = function(event) {
    db = event.target.result;

    // Checks to see if app is online before reading from db

    if (navigator.online) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("Error")
};

function saveRecord(record) {
     // Creates and acceses a transaction on the pending db with readwrite access
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");

    store.add(record);
}

function checkDatabase() {
    // Opens a transaction on your pending db
    const transaction = db.transaction(["pending"], "readwrite");
    // Accesses your pending object store
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json" 
                }
            })
            .then(response => response.json() 
            .then(() => {
                // Deletes Records if successful
                const transaction = dbtransaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            }))
        }
    };
}

function deletePending() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction("pending");
    store.clear();
}

// Listens for app coming back online
window.addEventListener("online", checkDatabase);