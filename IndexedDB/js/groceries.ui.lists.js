// Our shopping list's total
var g_fListTotal = 0.0;

// An array to hold the selected shopping list's items
var g_arrShoppingListItems = null;


// Called when the user clicks on an item in the list
function onClickListItem($objListItem) {
    // Grab the selected list item. Exit if nothing is selected
    var $objSel = $objListItem.find("option:selected");
    if ($objSel.length === 0) { return; }
    
    // Clear the Shopping Items list and fields
    resetShoppingListFields(true);

    // Enable our controls now that there is a shopping list selected
    enableControls(["cmdDeleteShoppingListItem", "cmdAddShoppingListItem", "txtShoppingListItemQuantity", "chkShoppingListItemInCart", "cmdSaveShoppingListItem"], true);

    var sListName = $objSel.text();
    var sID = $objSel.val();

    // Populate the List Name textbox with the selected list item's text
    var $txtList = getjQueryReference("txtList");
    $txtList.val(sListName);
    $txtList.attr("data-itemid", sID);
    
    // Set the List Name caption and cause the related list to be populated
    getjQueryReference("spanShoppingListName").text(sListName);
    getItem(DB_OBJSTORE_LISTS, parseInt(sID, 10), onError, fillSelectedShoppingListItems);
}
function fillSelectedShoppingListItems(objItem) {
    var $lstShoppingList = getjQueryReference("lstShoppingListItems");
    var aItem = null;
    var iID = 0;

    // Put the array into our global variable. Get a local variable reference to the array and loop through it...
    g_arrShoppingListItems = objItem.items;
    var arrItems = g_arrShoppingListItems;
    var iLen = arrItems.length;
    for (var iIndex = 0; iIndex < iLen; iIndex++) {
        // Grab the current array item and create the list item
        aItem = arrItems[iIndex];
        iID = aItem.itemID;
        addOptionObjectToShoppingList($lstShoppingList, iID, "{loading...}", aItem.quantity, -1, aItem.incart);
       
        // Request that the rest of this list item be loaded (the item's name and price)
        getItem(DB_OBJSTORE_ITEMS, iID, onError, loadShoppingListItem);
    }
}

function addOptionObjectToShoppingList($lstShoppingList, iItemID, sCaption, iQuantity, fPrice, bInCart) {
    var $objOption = $("<option />");
    $objOption.val(iItemID.toString());
    $objOption.text(sCaption);
    $objOption.attr("data-quantity", iQuantity.toString());
    $objOption.attr("data-price", floatToString(fPrice));
    $objOption.attr("data-incart", (bInCart ? "T" : "F"));
    $lstShoppingList.append($objOption);
}

function loadShoppingListItem(objItem) {
    // Find the item in the list
    var $objOption = getjQueryReference("lstShoppingListItems").find(("option[value=" + objItem.id.toString() + "]"));

    // Update the item's caption and the price attribute
    var fPrice = objItem.price;
    var sQuantity = $objOption.attr("data-quantity");
    var iQuantity = parseInt(sQuantity, 10);
    var fItemTotal = (fPrice * iQuantity);
    var bInCart = ($objOption.attr("data-incart") === "T");
    
    $objOption.text(buildShoppingListItemCaption(objItem.name, sQuantity, fItemTotal, bInCart));
    $objOption.attr("data-price", floatToString(fPrice));

    // If this item is in the cart then...
    if (bInCart) {
        // Update the running total for the list. Since we don't know if this is the last item being loaded into the list or not, we update the UI total every time
        g_fListTotal += fItemTotal;
        updateListTotal(false);
    } // End if (bInCart)
}

function buildShoppingListItemCaption(sName, sQuantity, fItemTotal, bInCart) {
    return ((bInCart ? "✓ " : "") + sName + ("..." + sQuantity + " ($" + floatToString(fItemTotal) + ")"));
}

function floatToString(fVal) { return fVal.toFixed(2); }


// Clear the displayed total
function updateListTotal(bRecalculate) {
    // If we need to recalculate the list total then...(an item was removed, added, or updated)
    if (bRecalculate) {
        var fTotal = 0.0;

        // Get only the list of items from the shopping list that are in the cart. Loop through the list...
        var $ItemsInCart = getjQueryReference("lstShoppingListItems").find("[data-incart='T']").each(function () {
            // Grab the current item and update our running total based on this item's quantity and price
            var $Item = $(this);
            fTotal += (parseFloat($Item.attr("data-price")) * parseInt($Item.attr("data-quantity"), 10));
        });
        
        // Add our total to the global variable
        g_fListTotal = fTotal;
    } // End if (bRecalculate)

    getjQueryReference("spanShoppingListTotal").text(floatToString(g_fListTotal));
}



//-------------------------
// For the List itself. The List Items are further down
//-------------------------
function onClickCreateList() {
    resetNameTextbox("txtList");
    resetShoppingListFields(true);
}

// Save (add/update)
function onClickSaveList() {
    var $txtList = getjQueryReference("txtList");
    var sVal = $txtList.val();
    if (sVal === "") { displayMessage("Please enter a value", true); return; }

    handleSaveList($txtList.attr("data-itemid"), sVal, listItemSaved);
}
function listItemSaved(objRecord) {
    // Check to see if the item exists in our list and if not add it in
    var $lstLists = getjQueryReference("lstLists");
    var sID = objRecord.id.toString();
    var $objSel = $lstLists.find(("option[value=" + sID + "]"));

    // If the item exists then update the caption. Otherwise, if the item doesn't exist yet, create the new list item
    if ($objSel.length > 0) { $objSel.text(objRecord.name); }
    else { $lstLists.append($("<option />").val(sID).text(objRecord.name)); }


    // Clear the fields as well as the selected item in our Lists list
    resetNameTextbox("txtList");
    resetShoppingListFields(true);
    $lstLists.val("");
}

function handleSaveList(sListID, sListName, fncSuccess) {
    saveRecord(DB_OBJSTORE_LISTS, buildListsDBObject(parseInt(sListID, 10), sListName, g_arrShoppingListItems), onError, fncSuccess);
}
function handleSaveShoppingList() {
    var $txtList = getjQueryReference("txtList");
    var sListID = $txtList.attr("data-itemid");
    var sListName = $txtList.val();

    handleSaveList(sListID, sListName, function (objRecord) { });
}


// Delete
function onClickDeleteList() {
    // Ask for the selected list to be deleted and then clear the text field (the list item will be removed if the database record delete is successful)
    deleteRecord(DB_OBJSTORE_LISTS, parseInt(getjQueryReference("txtList").attr("data-itemid"), 10), onError, onListItemDeleted);
    resetNameTextbox("txtList");
    resetShoppingListFields(true);
}
// Remove the list item 
function onListItemDeleted(iItemID) {
    // Remove the list from our list
    getjQueryReference("lstLists").find(("option[value=" + iItemID.toString() + "]")).remove();
}



//-------------------------
// For the Shopping List Items
//-------------------------
// Called when the user clicks on an item in the Shopping List
function onClickShoppingListItem($objListItem) {
    // Grab the selected list item. Exit if nothing is selected
    var $objSel = $objListItem.find("option:selected");
    if ($objSel.length === 0) { return; }

    // Set the field values for the selected shopping list item
    getjQueryReference("ddlShoppingListItem").val($objSel.val());
    getjQueryReference("txtShoppingListItemPrice").val($objSel.attr("data-price"));
    getjQueryReference("txtShoppingListItemQuantity").val($objSel.attr("data-quantity"));
    getjQueryReference("chkShoppingListItemInCart").prop("checked", ($objSel.attr("data-incart") === "T"));
}


function onClickDeleteShoppingListItem() {
    // Grab the selected list item. Exit if nothing is selected
    var $objSel = getjQueryReference("lstShoppingListItems").find("option:selected");
    if ($objSel.length === 0) { return; }

    // Grab the selected item's ID and remove the item from the global array
    var iItemID = parseInt($objSel.val(), 10);
    g_arrShoppingListItems.splice(findShoppingListArrayIndex(iItemID), 1); //1st param is the index of the item to remove

    // Save the shopping list now that it no longer has the shopping list item
    handleSaveShoppingList();

    // Remove the current item from the shopping list select object, clear the fields, and update the total
    $objSel.remove();
    resetShoppingListFields(false);// false because we don't want to clear the rest of shopping list items, just the contents of the fields

    // Cause the total to be recalculated and updated
    updateListTotal(true);
}

function findShoppingListArrayIndex(iItemID) {
    // Grab a local reference to our array and then loop through the array looking for the item requested....
    var arrItems = g_arrShoppingListItems;
    var iLen = arrItems.length;
    for (var iIndex = 0; iIndex < iLen; iIndex++) {
        // If we found the item requested then...
        if (arrItems[iIndex].itemID === iItemID) { return iIndex; }
    } // End of the for (var iIndex = 0; iIndex < iLen; iIndex++) loop.

    // We made it to this point. The requested item is not in the array
    return -1;
}


function resetShoppingListFields(bClearShoppingListItems) {
    // If we've been asked to clear the shopping list items then...(a new list was selected, we're creating a new list, or the list was deleted...the old items don't apply any 
    // more)
    if (bClearShoppingListItems) {
        g_arrShoppingListItems = [];
        getjQueryReference("lstShoppingListItems").empty();

        // Clear the displayed total
        g_fListTotal = 0.0;
        updateListTotal(false);
    } // End if (bClearShoppingListItems)


    // Clear the field selections
    var $ddlShoppingListItem = getjQueryReference("ddlShoppingListItem");
    $ddlShoppingListItem.val("");
    $ddlShoppingListItem.prop("disabled", true);
    getjQueryReference("txtShoppingListItemPrice").val("");
    getjQueryReference("txtShoppingListItemQuantity").val("");
    getjQueryReference("chkShoppingListItemInCart").prop("checked", false);
}


function onClickAddShoppingListItem() {
    // Clear the fields but also enable the Items drop-down
    resetShoppingListFields();
    getjQueryReference("ddlShoppingListItem").prop("disabled", false);
}


// User changed the selection in the Items drop-down on the shopping list form
function onClickShoppingListItemDropDown($objListItem) {
    // Update the price field with the newly selected item's price
    getjQueryReference("txtShoppingListItemPrice").val(getjQueryReference("ddlShoppingListItem").find("option:selected").attr("data-price"));
}


function onClickSaveShoppingListItem() {
    var $lstShoppingList = getjQueryReference("lstShoppingListItems");
    var $objSelItem = getjQueryReference("ddlShoppingListItem").find("option:selected");

    var iItemID = parseInt($objSelItem.val(), 10);
    var fPrice = parseFloat(getjQueryReference("txtShoppingListItemPrice").val());
    var iQuantity = parseInt(getjQueryReference("txtShoppingListItemQuantity").val(), 10);
    var bInCart = getjQueryReference("chkShoppingListItemInCart").prop("checked");

    var fItemTotal = (fPrice * iQuantity);
    var sCaption = buildShoppingListItemCaption($objSelItem.text(), iQuantity.toString(), fItemTotal, bInCart);

    // Check to see if the item is already in our array. If this is a new item then...
    var iIndex = findShoppingListArrayIndex(iItemID);
    if (iIndex === -1) {
        // Add the item to the array and to our shopping list
        g_arrShoppingListItems[g_arrShoppingListItems.length] = buildListsShoppingItemsDBObject(iItemID, iQuantity, bInCart);
        addOptionObjectToShoppingList($lstShoppingList, iItemID, sCaption, iQuantity, fPrice, bInCart);
    }
    else { // This item is already in the shipping list...
        // Update the item in the array
        var objItem = g_arrShoppingListItems[iIndex];
        objItem.quantity = iQuantity;
        objItem.incart = bInCart;

        // Find the item in the shopping list and update it with the new values
        var $objSel = $lstShoppingList.find(("option[value=" + iItemID.toString() + "]"));
        $objSel.text(sCaption);
        $objSel.attr("data-quantity", iQuantity.toString());
        $objSel.attr("data-incart", (bInCart ? "T" : "F"));
    } // End if (iIndex === -1)


    // Save the shopping list now that it has the new/updaed shopping list item
    handleSaveShoppingList();
    
    // Clear the fields (false because we don't want to clear the rest of shopping list items, just the contents of the fields) and remove the selection from the shopping list
    resetShoppingListFields(false);
    $lstShoppingList.val("");
    
    // Cause the total to be recalculated and updated
    updateListTotal(true);
}