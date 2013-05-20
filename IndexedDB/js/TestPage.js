var g_bIndexedDBSupported = false; // Flag so we know if IndexedDB is supported or not
var g_db = null; // If successful, will hold an IDBDatabase object

var $g_cmdOpenDB = null, $g_cmdCloseDB = null, $g_cmdCreateNewRecord = null, $g_cmdUpdateExistingRecord = null, $g_cmdShowExistingRecords = null, $g_cmdSearch = null;
var $g_lstEmployees = null;
var $g_txtEmpId = null, $g_txtEmpName = null, $g_txtEmpEmail = null, $g_txtFindByName = null;

$(document).ready(function () {
    // Test to see if the current browser supports IndexedDB or not
    g_bIndexedDBSupported = IsIndexedDBSupported();
    if (!g_bIndexedDBSupported) { alert("Sorry. Your current browser does not support IndexedDB"); return; }

    $g_cmdOpenDB = $("#cmdOpenDB");
    $g_cmdOpenDB.click(function () { OpenDB(); });
    $g_cmdOpenDB.prop("disabled", false);
    
    $g_cmdCloseDB = $("#cmdCloseDB");
    $g_cmdCloseDB.click(function () { CloseDB(); });

    $g_lstEmployees = $("#lstEmployees");
    $g_lstEmployees.change(function () { GetRecord($(":selected", $g_lstEmployees).val()); });

    $g_cmdCreateNewRecord = $("#cmdCreateNewRecord");
    $g_cmdCreateNewRecord.click(function () { CreateNewRecord(); });

    $g_cmdUpdateExistingRecord = $("#cmdUpdateExistingRecord");
    $g_cmdUpdateExistingRecord.click(function () { UpdateExistingRecord(); });

    $g_cmdShowExistingRecords = $("#cmdShowExistingRecords");
    $g_cmdShowExistingRecords.click(function () { ShowExistingRecordsUsingCursor(); });

    $g_cmdSearch = $("#cmdSearch");
    $g_cmdSearch.click(function () { DoSearch(); });
});

function OpenDB() {
    $g_cmdOpenDB.prop("disabled", true);//don't enable the close button until the onsuccess of the open call

    /* Request for the database to be opened and then attach to the request object's onerror and onsuccess methods */
    var dbRequest = window.indexedDB.open("Example", 1);
    dbRequest.onerror = function (evt) { alert("Database error: " + evt.target.error.name); }
    dbRequest.onsuccess = function (evt) { // If onupgradeneeded is triggered, this event will be called after that.
        g_db = evt.target.result;      

        $g_cmdCloseDB.prop("disabled", false);
        $g_cmdCreateNewRecord.prop("disabled", false);
        $g_cmdUpdateExistingRecord.prop("disabled", false);
        $g_cmdShowExistingRecords.prop("disabled", false);
        $g_cmdSearch.prop("disabled", false);
    }
    dbRequest.onupgradeneeded = function (evt) {
        var db = evt.target.result;

        // Create an objectStore to hold Employee information
        var objectStore = db.createObjectStore("Employees", { keyPath: "EmpId" });

        // Create an index to search by employee names. Multiple employees might have the same name so the index cannot be unique
        objectStore.createIndex("EmpName", "EmpName", { unique: false });

        // Create an index to search employees by company email address. Since, typically, no two employees would share the same
        // work email address, we can put a restriction on the records to enforce each record has a unique email address.
        objectStore.createIndex("EmpEmail", "EmpEmail", { unique: true });
    }
}

function EnsureWeHaveTextboxReferences() {
    if ($g_txtEmpId === null) {
        $g_txtEmpId = $("#txtEmpId");
        $g_txtEmpName = $("#txtEmpName");
        $g_txtEmpEmail = $("#txtEmpEmail");
        $g_txtFindByName = $("#txtFindByName");
    }
}


function GetObjectForSave() {
    EnsureWeHaveTextboxReferences();

    return { "EmpId": $g_txtEmpId.val(), "EmpName": $g_txtEmpName.val(), "EmpEmail": $g_txtEmpEmail.val() };
}

function CreateNewRecord() {
    var dbTrans = g_db.transaction(["Employees"], "readwrite");//1st param is an array that can contain multiple object store names
    var dbObjectStore = dbTrans.objectStore("Employees");
    var dbAddRequest = dbObjectStore.add(GetObjectForSave());
    dbAddRequest.onsuccess = function (evt) { alert("Successful add!"); }
    dbAddRequest.onerror = function (evt) { alert("Error: " + evt.target.error.name); }
}

function UpdateExistingRecord() {
    var dbTrans = g_db.transaction(["Employees"], "readwrite");//1st param is an array that can contain multiple object store names
    var dbObjectStore = dbTrans.objectStore("Employees");
    var dbPutRequest = dbObjectStore.put(GetObjectForSave());
    dbPutRequest.onsuccess = function (evt) { alert("Successful put!"); }
    dbPutRequest.onerror = function (evt) { alert("Error: " + evt.target.error); }
}

// For example code, use this when an item in a list is selected to cause it's data to be displayed on the form
function GetRecord(sEmpId) {
    var dbGetRequest = g_db.transaction(["Employees"]).objectStore("Employees").get(sEmpId);// a Get is based on the key which, in our case, is the EmpId value
    dbGetRequest.onsuccess = function (evt) {
        EnsureWeHaveTextboxReferences();

        var objEmployee = evt.target.result;
        $g_txtEmpId.val(objEmployee.EmpId);
        $g_txtEmpName.val(objEmployee.EmpName);
        $g_txtEmpEmail.val(objEmployee.EmpEmail);
    }
    dbGetRequest.onerror = function (evt) { alert("Error: " + evt.target.error); }
}

// For example code, use this to populate a list
function ShowExistingRecordsUsingCursor() {
    var dbCursorRequest = g_db.transaction(["Employees"]).objectStore("Employees").openCursor();
    dbCursorRequest.onsuccess = function (evt) {
        var curCursor = evt.target.result;
        if (curCursor) {
            // Grab the current employee object from the cursor and then add a new item to our Select object containing the data
            var objEmployee = curCursor.value;
            $g_lstEmployees.append($("<option />").val(objEmployee.EmpId).text(objEmployee.EmpName));

            curCursor.continue(); // Cause onsuccess to fire again with the next cursor item
        } // End if
    }
    dbCursorRequest.onerror = function (evt) { alert("Error: " + evt.target.error); }
}

function DoSearch() {
    EnsureWeHaveTextboxReferences();
    
    /*
    // Index:
    var dbGetRequest = g_db.transaction(["Employees"]).objectStore("Employees").index("EmpName").get($g_txtFindByName.val());
    dbGetRequest.onsuccess = function (evt) {
        var objEmployee = evt.target.result;
        alert("Match found...EmpId: " + objEmployee.EmpId + ", EmpName: " + objEmployee.EmpName + ", EmpEmail: " + objEmployee.EmpEmail);
    };
    */

    /*

    // Standard Index Cursor
    var dbCursorRequest = g_db.transaction(["Employees"]).objectStore("Employees").index("EmpName").openCursor();//.get($g_txtFindByName.val());
    dbCursorRequest.onsuccess = function (event) {
        var curCursor = event.target.result;
        if (curCursor) {
            var objEmployee = curCursor.value;
            alert("Match found...EmpId: " + objEmployee.EmpId + ", EmpName: " + objEmployee.EmpName + ", EmpEmail: " + objEmployee.EmpEmail);
            curCursor.continue();
        }
    };
    */

    // Standard cursor but with range specified
    //var dbKeyRange = IDBKeyRange.only($g_txtFindByName.val());
    var dbCursorRequest = g_db.transaction(["Employees"]).objectStore("Employees").openCursor(null, "prev"); //dbKeyRange);
    dbCursorRequest.onsuccess = function (evt) {
        var curCursor = evt.target.result;
        if (curCursor) {
            var objEmployee = curCursor.value;
            alert("Match found...EmpId: " + objEmployee.EmpId + ", EmpName: " + objEmployee.EmpName + ", EmpEmail: " + objEmployee.EmpEmail);
            curCursor.continue();
        } // End if
    }
    dbCursorRequest.onerror = function (evt) { alert("Error: " + evt.target.error); }



}


function CloseDB() {
    if (g_db !== null) {
        g_db.close();
        g_db = null;
        $g_cmdOpenDB.prop("disabled", false);
        $g_cmdCloseDB.prop("disabled", true);
        $g_cmdCreateNewRecord.prop("disabled", true);
        $g_cmdUpdateExistingRecord.prop("disabled", true);
        $g_cmdShowExistingRecords.prop("disabled", true);
        $g_cmdSearch.prop("disabled", true);
    }
}


// Helper to test if the browser supports IndexedDB or not
function IsIndexedDBSupported() {
    // Set the W3C location of IndexedDB to equal the W3C version of IndexedDB by default. If that doesn't exist, fallback to the browser's vendor prefix (webkit is Google 
    // Chrome and BlackBerry 10, moz is Firefox)
    //
    // NOTE: It is not recommended to use a vendor prefix in production code (there may be bugs, it might be incomplete, or it might be based on an older version of the 
    // specification which means it may not behave how you expect it to)
    window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || { READ_WRITE: 'readwrite' };

    // If IndexedDB exists then...
    if (window.indexedDB) {
        return true;
    }
    else { // IndexedDB does not exist for this browser...
        return false;
    }
}


