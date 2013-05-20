<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="TestPage.aspx.cs" Inherits="IndexedDB.TestPage" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <script src="js/jquery-1.9.0.js"></script>
    <script src="js/TestPage.js"></script>
</head>
<body>
    <form id="form1" runat="server">
    
        <input type="button" id="cmdOpenDB" value="Open Database" disabled="disabled" />
        <input type="button" id="cmdCloseDB" value="Close Database" disabled="disabled" />

        <br /><br />
        <div style="width:200px;height:300px;float:left;margin-right:10px;">
            Current Employees:

            <br /><br /><input type="button" id="cmdShowExistingRecords" value="Show Existing Records" disabled="disabled" />

            <br /><br /><select id="lstEmployees" style="width:100%;height:200px;" multiple="multiple"></select>
        </div>

        <div style="height:300px;">
            Details:

            <br /><br />Employee ID: <input type="number" id="txtEmpId" value="" maxlength="4" />
            <br />Employee Name: <input type="text" id="txtEmpName" value="" maxlength="50" />
            <br />Employee Work Email: <input type="text" id="txtEmpEmail" value="" maxlength="50" />

            <br /><br /><input type="button" id="cmdCreateNewRecord" value="Create New Record" disabled="disabled" />
            <input type="button" id="cmdUpdateExistingRecord" value="Update ExistingRecord" disabled="disabled" />
        </div>

        <br /><br />Find by name: <input type="text" id="txtFindByName" value="" maxlength="50" />
        
        <input type="button" id="cmdSearch" value="Search" disabled="disabled" />
        

        

        <input type="button" value="test" onclick="javascript: window.open('IDBExplorer/IDBExplorer.html?name=Example');" />

    </form>
</body>
</html>
