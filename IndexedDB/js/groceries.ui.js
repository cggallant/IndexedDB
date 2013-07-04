
var g_arrJQueryReferences = [];// Array that holds cached jQuery references


$(document).ready(function () {

    // Open the database
    openDB(onError, onDatabaseOpened);

});

// Helper to return and cache jQuery references (sCtrlID is expected without the '#')
function getjQueryReference(sCtrlID) {
    // Grab the requested control from our global array. If we don't have a control reference yet then...
    var $jQueryObj = g_arrJQueryReferences[sCtrlID];
    if (($jQueryObj === null) || (typeof $jQueryObj === "undefined")) {
        // Grab the reference from the DOM and add it to our array
        $jQueryObj = $(("#" + sCtrlID));
        g_arrJQueryReferences[sCtrlID] = $jQueryObj;
    }

    // Return the jQuery object to the caller
    return $jQueryObj;
}

// Helper to enable/disable multiple controls
function enableControls(arrCtrlIDs, bEnable) {
    var iLen = arrCtrlIDs.length;
    for (var iIndex = 0; iIndex < iLen; iIndex++) { getjQueryReference(arrCtrlIDs[iIndex]).prop("disabled", !bEnable); }
}

// An error was returned by our database code
function onError(objError) { displayMessage(objError.name, true); }

//fix_me...adjust the class of the div to reflect if this is an error or information message
function displayMessage(sMessage, bError) { getjQueryReference("divAppMessages").text(sMessage); }

// Used by Items and Categories
function resetNameTextbox(sCtrlID) {
    var $txtCategory = getjQueryReference(sCtrlID);
    $txtCategory.val("");
    $txtCategory.attr("data-itemid", "-1"); // -1 for a new record
}


function onDatabaseOpened() {
    //-----------------------
    // Wire up the lists
    getjQueryReference("lstLists").click(function () { onClickListItem($(this)); });
    getjQueryReference("lstItems").click(function () { onClickItemsItem($(this)); });
    getjQueryReference("lstCategories").click(function () { onClickCategoryItem($(this)); });

    //  The Shopping List's items
    getjQueryReference("lstShoppingListItems").click(function () { onClickShoppingListItem($(this)); });
    getjQueryReference("ddlShoppingListItem").click(function () { onClickShoppingListItemDropDown($(this)); });
    

    //-----------------------
    // Fill the lists
    //  Make sure the Items drop-down on the Shopping list form has a [None] item
    var $ddlShoppingListItem = getjQueryReference("ddlShoppingListItem");
    $ddlShoppingListItem.append($("<option />").val("0").text("[None]").attr("data-price", "0"));

    //  Make sure the Categories drop-down on the Items list form has a [None] item
    var $ddlItemCategories = getjQueryReference("ddlItemCategories");
    $ddlItemCategories.append($("<option />").val("0").text("[None]"));


    //  Lists
    getItems(DB_OBJSTORE_LISTS, onItemReceived_Lists, onError, function () { enableControls(["cmdDeleteList", "cmdCreateList", "txtList", "cmdSaveList"], true) });
        
    // Populates the main Items list as well as the shopping list's Items list on the form (used when adding a new item to a shopping list)
    getItems(DB_OBJSTORE_ITEMS, onItemReceived_Items, onError, onGetItemsComplete_Items);

    // Populates the main Categories list as well as the categories drop-down on the Items list form
    getItems(DB_OBJSTORE_CATEGORIES, onItemReceived_Categories, onError, onGetItemsComplete_Categories);


    //-----------------------
    // Wire up the buttons
    //  The Lists (of Shopping lists)
    getjQueryReference("cmdDeleteList").click(function () { onClickDeleteList(); });
    getjQueryReference("cmdCreateList").click(function () { onClickCreateList(); });
    getjQueryReference("cmdSaveList").click(function () { onClickSaveList(); });

    //  The Shopping List controls
    getjQueryReference("cmdDeleteShoppingListItem").click(function () { onClickDeleteShoppingListItem(); });
    getjQueryReference("cmdAddShoppingListItem").click(function () { onClickAddShoppingListItem(); });
    getjQueryReference("cmdSaveShoppingListItem").click(function () { onClickSaveShoppingListItem(); });

    //  The Items
    getjQueryReference("cmdDeleteItem").click(function () { onClickDeleteItem(); });
    getjQueryReference("cmdCreateItem").click(function () { resetItemsFields(); });
    getjQueryReference("cmdSaveItem").click(function () { onClickSaveItem(); });

    //  The Categories
    getjQueryReference("cmdDeleteCategory").click(function () { onClickDeleteCategory(); });
    getjQueryReference("cmdCreateCategory").click(function () { resetNameTextbox("txtCategory"); });
    getjQueryReference("cmdSaveCategory").click(function () { onClickSaveCategory(); });
}


function onItemReceived_Lists(objItem) { getjQueryReference("lstLists").append($("<option />").val(objItem.id.toString()).text(objItem.name)); }

function onItemReceived_Items(objItem) {
    var sID = objItem.id.toString();
    var sName = objItem.name;

    // Add the current item to the main Items list
    getjQueryReference("lstItems").append($("<option />").val(sID).text(sName));
    
    // Add the current item to the Items drop-down on the shopping list's form
    getjQueryReference("ddlShoppingListItem").append($("<option />").val(sID).text(sName).attr("data-price", floatToString(objItem.price)));
}
function onGetItemsComplete_Items() {
    // Now that the main Items list has finished loading, enable the controls associated with it
    enableControls(["cmdDeleteItem", "cmdCreateItem", "txtItem", "txtPrice", "cmdSaveItem"], true);
}

function onItemReceived_Categories(objItem) {
    var sID = objItem.id.toString();
    var sName = objItem.name;

    // Add the current item to the main Categories list as well as the categories drop-down on the Items list form
    getjQueryReference("lstCategories").append($("<option />").val(sID).text(sName));
    getjQueryReference("ddlItemCategories").append($("<option />").val(sID).text(sName));
}
function onGetItemsComplete_Categories() {
    // Now that the main Categories list has finished loading, enable the controls associated with it
    enableControls(["cmdDeleteCategory", "cmdCreateCategory", "txtCategory", "cmdSaveCategory"], true);
}