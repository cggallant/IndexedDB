﻿// Called when the user clicks on an item in the list
function onClickItemsItem($objListItem) {
    // Grab the selected list item. Exit if nothing is selected
    var $objSel = $objListItem.find("option:selected");
    if ($objSel.length === 0) { return; }

    // Populate the Items Name textbox with the selected list item's text
    var $txtItem = getjQueryReference("txtItem");
    var sID = $objSel.val();
    $txtItem.val($objSel.text());
    $txtItem.attr("data-itemid", sID);

    // Our list only holds the item's ID and Name so request the object itself
    getItem(DB_OBJSTORE_ITEMS, parseInt(sID, 10), onError, setItemsFieldValues);
}
function setItemsFieldValues(objItem) {
    getjQueryReference("ddlItemCategories").val(objItem.categoryID.toString());
    getjQueryReference("txtPrice").val(objItem.price.toString());
}


// Save (add/update)
function onClickSaveItem() {
    var $txtItem = getjQueryReference("txtItem");
    var sName = $txtItem.val();
    if (sName === "") { displayMessage("Please enter a value", true); return; }

    var sPrice = getjQueryReference("txtPrice").val();
    if (sPrice === "") { sPrice = "0"; }
    var fPrice = parseFloat(sPrice);
    if (fPrice < 0) { displayMessage("Please enter a price that is 0 or greater", true); return; }

    var $objSelCategory = getjQueryReference("ddlItemCategories").find("option:selected");
    saveRecord(DB_OBJSTORE_ITEMS, buildItemsDBObject(parseInt($txtItem.attr("data-itemid"), 10), sName, parseInt($objSelCategory.val(), 10), fPrice), onError, itemsItemSaved);
}
function itemsItemSaved(objRecord) {
    // Check to see if the item exists in our list and if not add it in
    var $lstItems = getjQueryReference("lstItems");
    var sID = objRecord.id.toString();
    var $objSel = $lstItems.find(("option[value=" + sID + "]"));

    // If the item exists then update the caption. Otherwise, if the item doesn't exist yet, create the new list item
    if ($objSel.length > 0) { $objSel.text(objRecord.name); }
    else { $lstItems.append($("<option />").val(sID).text(objRecord.name)); }
    

    // Clear the fields as well as the selected item in our Items list
    resetItemsFields();
    $lstItems.val("");
}

// Delete
function onClickDeleteItem() {
    // Ask for the selected category to be deleted and then clear the text field (the list item will be removed if the database record delete is successful)
    deleteRecord(DB_OBJSTORE_ITEMS, parseInt(getjQueryReference("txtItem").attr("data-itemid"), 10), onError, onItemsItemDeleted);
    resetItemsFields();
}
// Remove the list item 
function onItemsItemDeleted(iItemID) { 
    // Remove the Item from our list here and clear any shopping list that might be displayed
    getjQueryReference("lstItems").find(("option[value=" + iItemID.toString() + "]")).remove(); 
    resetShoppingListFields(true);

    // Ask the List's form to step through each list in the database and remove the current item from it if it exists there
    listsRemoveItemInDB(iItemID);
}



function resetItemsFields() {
    resetNameTextbox("txtItem");

    // Clear the selection and the price textbox
    getjQueryReference("ddlItemCategories").val("");
    getjQueryReference("txtPrice").val("");
}


// Called when a category is deleted so that we can step through the items db records and change the category to 0
function itemsChangeItemCategoryInDB(iOriginalCategoryID, iNewCategoryID) {
    // Ask for the list of items in the Items object store.
    getItems(DB_OBJSTORE_ITEMS, function (objItem) { itemsSaveItemWithNewCategoryID(objItem, iOriginalCategoryID, iNewCategoryID) }, onError, function () { /* reached the end of the Items object store */ });
}
function itemsSaveItemWithNewCategoryID(objItem, iOriginalCategoryID, iNewCategoryID) {
    // If the current item holds an expense category id that we need to change then...
    if (objItem.categoryID === iOriginalCategoryID) {
        saveRecord(DB_OBJSTORE_ITEMS, buildItemsDBObject(objItem.id, objItem.name, iNewCategoryID, objItem.price), onError, function (objRecord) { /* successful save */ });
    } // End  if (objItem.categoryID === iOriginalCategoryID)
}