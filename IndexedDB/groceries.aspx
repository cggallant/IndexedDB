<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="groceries.aspx.cs" Inherits="IndexedDB.groceries" %>
<!DOCTYPE html>
<html>
    <head>
        <title>IndexedDB Example - Groceries</title>
        <link href="css/groceries.css" rel="stylesheet" />
    </head>
    <body>        
        <form id="form1" runat="server">
            <span class="spanAppInfo">This example code illustrates how to use an IndexedDB database by creating a very simple grocery app. Tested in IE10, Chrome, and Firefox</span>


            <!-- section where messages are displayed -->
            <div id="divAppMessages"></div>


            <!-- Buttons to switch the section that's displayed -->
            <input type="button" id="cmdShowLists" value="Lists" />
            <input type="button" id="cmdShowItems" value="Items" />
            <input type="button" id="cmdShowCategories" value="Categories" />
 

            <!-- Title of the section -->
            <div id="divSectionTitle" class="divTitle">Lists...</div>

            <!-- Our Lists section -->
            <div id="divSection_List" class="SectionVisible">
                <div class="divList">
                    <select id="lstLists" multiple="multiple"></select>

                    <br><input id="cmdDeleteList" type="button" value="Delete" disabled="disabled" />
                    <input id="cmdCreateList" type="button" value="New" disabled="disabled" />
                </div>

                <!-- The form to create/edit the shopping list name -->
                <div class="divForm">
                    Name: <input id="txtList" type="text" data-itemid="-1" disabled="disabled" />

                    <br><input id="cmdSaveList" type="button" value="Save" disabled="disabled" />
                </div>

                <div class="divSelectedShoppingListContents">
                    <!-- The list of items in the selected shopping list -->
                    <div><span class="spanSubTitle">Shopping List:</span> <span id="spanShoppingListName"></span></div>
                    <div class="divListItems">
                        <select id="lstShoppingListItems" multiple="multiple"></select>

                        <div><span class="spanSubTitle">Total:</span> $<span id="spanShoppingListTotal"></span></div>

                        <br><input id="cmdDeleteShoppingListItem" type="button" value="Remove" disabled="disabled" />
                        <input id="cmdAddShoppingListItem" type="button" value="Add" disabled="disabled" />
                    </div>

                    <!-- The form for the individual list item when adding it to the shopping list -->
                    <div class="divListItemForm">
                        Item: <select id="ddlShoppingListItem" disabled="disabled"></select>

                        <br><br>Price: <input id="txtShoppingListItemPrice" type="text" readonly="readonly" />
            
                        <br><br>Quantity: <input id="txtShoppingListItemQuantity" type="text" disabled="disabled" />

                        <br><br>In the cart? <input id="chkShoppingListItemInCart" type="checkbox" disabled="disabled" />

                        <br><br><input id="cmdSaveShoppingListItem" type="button" value="Save" disabled="disabled" />
                    </div>
                </div>
            </div>


            <!-- Our Items section -->
            <div id="divSection_Items" class="SectionHidden">
                <div class="divList">
                    <select id="lstItems" multiple="multiple"></select>

                    <br><input id="cmdDeleteItem" type="button" value="Delete" disabled="disabled" />
                    <input id="cmdCreateItem" type="button" value="New" disabled="disabled" />
                </div>

                <div class="divForm">
                    Name: <input id="txtItem" type="text" data-itemid="-1" disabled="disabled" />
                    <br>Category: <select id="ddlItemCategories"></select>
                    <br>Price: <input id="txtPrice" type="text" disabled="disabled" />

                    <br><input id="cmdSaveItem" type="button" value="Save" disabled="disabled" />
                </div>
            </div>


            <!-- Our Categories section -->
            <div id="divSection_Categories" class="SectionHidden">
                <div class="divList">
                    <select id="lstCategories" multiple="multiple"></select>

                    <br><input id="cmdDeleteCategory" type="button" value="Delete" disabled="disabled" />
                    <input id="cmdCreateCategory" type="button" value="New" disabled="disabled" />
                </div>

                <div class="divForm">
                    Name: <input id="txtCategory" type="text" data-itemid="-1" disabled="disabled" />

                    <br><input id="cmdSaveCategory" type="button" value="Save" disabled="disabled" />
                </div>
            </div>
        </form>

        <script src="js/jquery-1.9.0.js"></script>
        <script src="js/groceries.db.js"></script>
        <script src="js/groceries.ui.js"></script>
        <script src="js/groceries.ui.lists.js"></script>
        <script src="js/groceries.ui.items.js"></script>
        <script src="js/groceries.ui.categories.js"></script>
    </body>
</html>
