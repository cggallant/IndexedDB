
var g_DB = null; // Will hold our database connection

var DB_NAME = "groceries";
var DB_VERSION = 1;

var DB_OBJSTORE_LISTS = "Lists";
var DB_OBJSTORE_ITEMS = "Items";
var DB_OBJSTORE_CATEGORIES = "Categories";

// fncError - passed the error object if there is an error
// fncSuccess - optional - no parameters are passed to this function. Simply provided so that the caller can be informed that the database is ready
function openDB(fncError, fncSuccess) {
    // If IndexedDB is not supported then...
    if (!window.indexedDB) {
        // Tell the caller of the issue and then exit
        fncError({ "name": "IndexedDB is not supported by this browser" });
        return;
    } // End if (!window.indexedDB)


    // Request that our database be opened (indexedDB is an IDBFactory object. Our database will be created if it doesn't exist yet)
    var dbRequest = window.indexedDB.open(DB_NAME, DB_VERSION);
    dbRequest.onerror = function (evt) { fncError(evt.target.error); }

    // If onupgradeneeded is triggered, this event is called after that completes
    dbRequest.onsuccess = function (evt) {
        // Store a reference to the database connection (IDBDatabase object) and then tell the caller 
        g_DB = evt.target.result;
        if (fncSuccess !== null) { fncSuccess(); }
    }

    // This event handler will only be called if we're creating the database for the first time or if we're upgrading the database to a new version (this will be triggered
    // before the onsuccess event handler above if it does get called)
    dbRequest.onupgradeneeded = function (evt) {
        var db = evt.target.result;

        // Create our object stores
        var osLists = db.createObjectStore(DB_OBJSTORE_LISTS, { keyPath: "id" });
        var osItems = db.createObjectStore(DB_OBJSTORE_ITEMS, { keyPath: "id" });
        var osCategories = db.createObjectStore(DB_OBJSTORE_CATEGORIES, { keyPath: "id" });
        

        // Create our indexes
        osLists.createIndex("id", "id", { unique: true });
        osLists.createIndex("name", "name", { unique: true });

        osItems.createIndex("id", "id", { unique: true });
        osItems.createIndex("name", "name", { unique: true });

        osCategories.createIndex("id", "id", { unique: true });
        osCategories.createIndex("name", "name", { unique: true });


        // If this is version 1 of the database then...(create some demo data)
        if (evt.oldVersion < 1) {
            // Add a sample shopping list item
            osLists.add(buildListsDBObject(1, "Shopping List",
                [
                   buildListsShoppingItemsDBObject(1, 3, true),
                   buildListsShoppingItemsDBObject(2, 1, false),
                   buildListsShoppingItemsDBObject(3, 1, true)
                ]
            ));

            // Add some default items for the sample shopping list
            osItems.add(buildItemsDBObject(1, "Bread", 2, 3.75));
            osItems.add(buildItemsDBObject(2, "Milk", 4, 6.95));
            osItems.add(buildItemsDBObject(3, "Shampoo", 9, 4.99));

            // Add some default categories (NOTE: If you need records sorted by ID, you will want to use a number rather than a string for the id value)
            osCategories.add(buildCategoryDBObject(1, "Beverages"));
            osCategories.add(buildCategoryDBObject(2, "Bread/Bakery"));
            osCategories.add(buildCategoryDBObject(3, "Canned/Jarred Goods"));
            osCategories.add(buildCategoryDBObject(4, "Dairy"));
            osCategories.add(buildCategoryDBObject(5, "Dry/Baking Goods"));
            osCategories.add(buildCategoryDBObject(6, "Frozen Foods"));
            osCategories.add(buildCategoryDBObject(7, "Meat"));
            osCategories.add(buildCategoryDBObject(8, "Produce"));
            osCategories.add(buildCategoryDBObject(9, "Personal Care"));
            osCategories.add(buildCategoryDBObject(10, "Other"));
        }
    }
}

function buildListsDBObject(iID, sName, arrShoppingListItems) { return { "id": iID, "name": sName, "items": arrShoppingListItems }; }
function buildListsShoppingItemsDBObject(iItemID, iQuantity, bInCart) { return { "itemID": iItemID, "quantity": iQuantity, "incart": bInCart }; }

function buildItemsDBObject(iID, sName, iCategoryID, fPrice) { return { "id": iID, "name": sName, "categoryID": iCategoryID, "price": fPrice }; }
function buildCategoryDBObject(iID, sName) { return { "id": iID, "name": sName }; }


function getItem(sObjectStoreName, iItemID, fncError, fncSuccess) {
    // Request that a read-only cursor be opened for the requested object store.
    var dbObjectStore = g_DB.transaction([sObjectStoreName]).objectStore(sObjectStoreName);
    var dbGetRequest = dbObjectStore.get(iItemID);
    dbGetRequest.onerror = function (evt) { fncError(evt.target.error); }
    dbGetRequest.onsuccess = function (evt) { fncSuccess(evt.target.result); }
}


// sObjectStoreName - the name of the object store that we need to retrive the contents of
// fncItem - passed the current item being retrieved from the object store (so that the caller can add it to a list as needed for example)
// fncError - passed the error object if there is an error
// fncSuccess - no parameters are passed to this function. Simply provided so that the caller can be informed that we have finished going through the object store
function getItems(sObjectStoreName, fncItem, fncError, fncSuccess) {
    // Request that a read-only cursor be opened for the requested object store.
    var dbObjectStore = g_DB.transaction([sObjectStoreName]).objectStore(sObjectStoreName);
    var dbCursorRequest = dbObjectStore.index("name").openCursor();
    dbCursorRequest.onerror = function (evt) { fncError(evt.target.error); }

    dbCursorRequest.onsuccess = function (evt) {
        // Grab the current cursor object. Will be undefined if we moved past the last record in the object store.
        var curCursor = evt.target.result;
        if (curCursor) {
            // Pass the current object store record to the caller and then ask for the next record (causes onsuccess to fire again with the next item)
            fncItem(curCursor.value);
            curCursor.continue();
        }
        else { // The cursor is undefined...
            // We've reached the end of the list so tell the caller that we were successful in loading the list
            fncSuccess();
        } // End if (curCursor)
    }
}


function saveRecord(sObjectStoreName, objRecord, fncError, fncSuccess) {
    // Open a read-write transaction now so that we can lock the object store (so that if we need to find a unique id, we know it will be unique - if we did a read-only 
    // transaction, it's possible that another call could get the same id before we get a chance to save the record)
    var dbObjectStore = g_DB.transaction([sObjectStoreName], "readwrite").objectStore(sObjectStoreName);

    // If we're looking at a new record then...
    var iItemID = objRecord.id;
    if (iItemID === -1) {
        // Open up a cursor to find the first unique id (we're sorting by descending order and only grabbing the one value)
        var dbCursorRequest = dbObjectStore.index("id").openCursor(null, "prev");
        dbCursorRequest.onerror = function (evt) { fncError(evt.target.error); }
        dbCursorRequest.onsuccess = function (evt) {
            // If a record was returned then...
            var curCursor = evt.target.result;
            if (curCursor) {
                // Update our save record's id to the next available id
                objRecord.id = (curCursor.value.id + 1); 
            } else {// No records exist yet...
                objRecord.id = 1;
            } // End if (curCursor)

            // Finish the save
            finishSaveRecord(dbObjectStore, objRecord, fncError, fncSuccess);
        }
    }
    else { // We're dealing with an existing record...
        finishSaveRecord(dbObjectStore, objRecord, fncError, fncSuccess);
    } // End if (iItemID === -1)
}
function finishSaveRecord(dbObjectStore, objRecord, fncError, fncSuccess) {
    var dbPutRequest = dbObjectStore.put(objRecord);
    dbPutRequest.onerror = function (evt) { fncError(evt.target.error); }
    dbPutRequest.onsuccess = function (evt) { fncSuccess(objRecord); }
}


// sObjectStoreName - the name of the object store to delete the item from
// sItemID - the record's id that we want to delete
// fncError - passed the error object if there is an error
// fncSuccess - no parameters are passed to this function. Simply provided so that the caller can be informed that the database is ready
function deleteRecord(sObjectStoreName, iItemID, fncError, fncSuccess) {
    // Open a readwrite transaction
    var dbObjectStore = g_DB.transaction([sObjectStoreName], "readwrite").objectStore(sObjectStoreName);
    var dbDeleteRequest = dbObjectStore.delete(iItemID);
    dbDeleteRequest.onerror = function (evt) { fncError(evt.target.error); }
    dbDeleteRequest.onsuccess = function (evt) { fncSuccess(iItemID); }
}