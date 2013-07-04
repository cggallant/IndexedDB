// Called when the user clicks on an item in the list
function onClickCategoryItem($objListItem) {
    // Grab the selected list item. Exit if nothing is selected
    var $objSel = $objListItem.find("option:selected");
    if ($objSel.length === 0) { return; }

    // Populate the Category Name textbox with the selected list item's text
	var $txtCategory = getjQueryReference("txtCategory");
	$txtCategory.val($objSel.text());
	$txtCategory.attr("data-itemid", $objSel.val());
}

// Save (add/update)
function onClickSaveCategory() {
	var $txtCategory = getjQueryReference("txtCategory");
	var sVal = $txtCategory.val();
	if (sVal === "") { displayMessage("Please enter a value", true); return; }

	saveRecord(DB_OBJSTORE_CATEGORIES, buildCategoryDBObject(parseInt($txtCategory.attr("data-itemid"), 10), sVal), onError, categoryItemSaved);
}
function categoryItemSaved(objRecord) {
	// Check to see if the item exists in our list and if not add it in
	var $lstCategories = getjQueryReference("lstCategories");
	var sID = objRecord.id.toString();
	var $objSel = $lstCategories.find(("option[value=" + sID + "]"));

	// If the item exists then update the caption. Otherwise, if the item doesn't exist yet, create the new list item
	if ($objSel.length > 0) { $objSel.text(objRecord.name); }
	else { $lstCategories.append($("<option />").val(sID).text(objRecord.name)); }


    // Clear the fields as well as the selected item in our Categories list
	resetNameTextbox("txtCategory");
	$lstCategories.val("");
}

// Delete
function onClickDeleteCategory() {
	// Ask for the selected category to be deleted and then clear the text field (the list item will be removed if the database record delete is successful)
    deleteRecord(DB_OBJSTORE_CATEGORIES, parseInt(getjQueryReference("txtCategory").attr("data-itemid"), 10), onError, onCategoryItemDeleted);
	resetNameTextbox("txtCategory");
}
// Remove the list item 
function onCategoryItemDeleted(iItemID) {
	// Remove the category from our list here and from the drop-down on the Items form
	var sID = iItemID.toString();
	getjQueryReference("lstCategories").find(("option[value=" + sID + "]")).remove();
	getjQueryReference("ddlItemCategories").find(("option[value=" + sID + "]")).remove();
}