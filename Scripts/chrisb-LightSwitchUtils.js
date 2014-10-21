var LSUtils = (function() {
	
	function LSUtils() {
	
	}

	/*
	Commits any data changes made. Shows the user the failMessage if the commit was unsuccesful.
	
	failMessage: : a message which is displayed to the user should the commit fail.
	
	Example Use: 
		var lsUtils = new LSUtils();
		lsUtils.CommitChanges(
			"There are still Tasks associated with this Project."
		);
	*/
    LSUtils.prototype.CommitChanges = function (failMessage) {
        myapp.commitChanges().then(null, function fail(e) {
            myapp.cancelChanges().then(function () {
                msls.showMessageBox(failMessage, {
                    title: "Delete failed.",
                    buttons: msls.MessageBoxButtons.ok
                });
            });
        });
    };

	/*
	Creates a dialog with the given title and message asking the user to confirm they want to delete an entity. A fail 
	message is shown if the entity fails to delete (usually caused due to linked data).
	
	title: the title of the dialog box.
	message: the message which appears in the dialog box.
	entityToDelete: the LightSwitch entity which the user plans to delete (i.e screen.Project).
	failMessage: a message which is displayed to the user should the entity fail to delete.
	
	Example Use: 
		var lsUtils = new LSUtils();
		lsUtils.DeleteWithConfirmation(
			"Delete Project?", 
			"Are you sure you want to delete this Project?", 
			screen.Project,
			"There are still Tasks associated with this Project."
		);
	*/
    LSUtils.prototype.DeleteWithConfirmation = function (title, message, entityToDelete, failMessage) {
        msls.showMessageBox(message, {
            title: title,
            buttons: msls.MessageBoxButtons.yesNo
        }).then(function (val) {
            if (val == msls.MessageBoxResult.yes) {
                entityToDelete.deleteEntity();
                Utils.prototype.CommitChanges(failMessage);
            }
        });
    };

	/* 
	This method is useful for when you need to set a default field value to the current user although it can be used whenever 
	you need the current user.
		
	callback: the method to be called with the current user. Should be of the form function(user){} where user is the instance of the 
	user.
	
	Example Use: 
		var lsUtils = new LSUtils();
		lsUtils.CallWithCurrentUser(function(user) {
			screen.Project.User = user;
		});
	*/
    LSUtils.prototype.CallWithCurrentUser = function (callback) {
		/*This query needs to be replaced with a query which gets the user from the User table where Identity equals current User.*/
        myapp.activeDataWorkspace.ApplicationData.GetCurrentUser().execute().then(
            function (e) {
                /// <var type="myapp.User"></var>
                var user = e.results[0];
                callback(user);
            });
    };

    /*
	Adds client side validation to a dropdown. The dropdown will show field is required if no data is entered.
	Note: Requires the additional css to be included, chrisb-LightSwitchUtils.css, to properly display the validation.
	
    controlID: String - Name of Control as set in the Designer e.g ("CompanyContact").
    controlDataItem: Data Item - The Data Item element associated with the above control (e.g screen.Company.CompanyContact).
    wrapperControl: The control which contains the above data item. (e.g screen.Company).
    screen: The screen for the form.
	
	Example Use: 
		var lsUtils = new LSUtils();
		lsUtils.AddRequiredValidationToDropdown(
			"CompanyContact", 
			screen.Company.CompanyContact, 
			screen.Company, 
			screen
		);
    */
    LSUtils.prototype.AddRequiredValidationToDropdown = function (controlID, controlDataItem, wrapperControl, screen) {
        wrapperControl.addChangeListener(controlID, resetValidation);
        if (controlDataItem === undefined || controlDataItem == null) {
            addValidationError();
        }
        function resetValidation() {
            screen.findContentItem(controlID).validationResults = [];
        }
        function addValidationError() {
            screen.findContentItem(controlID).validationResults = [
                    new msls.ValidationResult(controlDataItem, "This field is required")
            ];
        }
    }
	
	/*
	Display an alert with the given title and text using the LightSwitch message box.
	
	title: the title of the alert dialog shown.
	text: the text shown within the alert.
	
	Example Use: 
		var lsUtils = new LSUtils();
		lsUtils.DisplayLightSwitchAlert(
			"Contact successfully added.", 
			"you successfully added " + screen.Contact.Name
		);
	*/
	LSUtils.prototype.DisplayLightSwitchAlert = function(title, text) {
        var resp = msls.showMessageBox(text, {
            title: title,
            buttons: msls.MessageBoxButtons.ok
        });
	}
	
    /*
	Adds a control before an input which can show or hide the control below it. Used for things such as denoting whether a project 
	is on hold and the user should enter a reason why it is on hold, otherwise they don't need to enter anything.
	
    controlID: String - Name of Control as set in the Designer e.g ("OnHoldReason").
    controlDataItem: Data Item - The Data Item element associated with the above controlID (e.g screen.Project.OnHoldReason).
    element: The element for the control.
    contentItem: The contentItem for the control.
	
	Example Use: 
		var lsUtils = new LSUtils();
		lsUtils.DisplayYesNoControlBeforeTextBox(
			'OnHold', 
			contentItem.screen.Project.OnHold, 
			element, 
			contentItem
		);
    */
	LSUtils.prototype.DisplayYesNoControlBeforeTextBox = function (controlID, controlDataItem, element, contentItem) {
		var newInnerText;
		var isControlVisible;
		var yesString = "Yes";
		var noString = "No";
        if (controlDataItem) {
            newInnerText = yesString;
			isControlVisible = true;
        } else {
            newInnerText = noString;
			isControlVisible = false;
        }
		element.innerText = newInnerText;
		screen.findContentItem(controlID).isVisible = isControlVisible;
    }

	
	/*
	Adds a red asterix after a label to show that a field is required.
	Note: Requires the additional css to be included, chrisb-LightSwitchUtils.css
	
	element: the HTML element you get in the postRender method when creating a LightSwitch element.
	
	Example Use: 
		var lsUtils = new LSUtils();
		lsUtils.AddRequiredFieldLabelStyling(element);
	*/
    LSUtils.prototype.AddRequiredFieldLabelStyling = function (element) {
        $(element).parent().find("label")[0].innerHTML += "<span class='requiredField'> *</span>";
    }

	
	/*
	Converts a date to a UK Date.
	
	data: the date to be converted.
	
	Example Use: 
		var lsUtils = new LSUtils();
		element.innerHTML = lsUtils.ToUKDate(date);
	*/
    LSUtils.prototype.ToUKDate = function (date) {
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    }
	
	
	/*
	Converts a value into UK currency with a £ before and every 3 digits seperated by commas.
	
	value: the value to convert to currency.
	
	Example Use: 
		var lsUtils = new LSUtils();
		element.innerHTML = lsUtils.ConvertToUKMoney(number);
	*/
	LSUtils.prototype.ConvertToUKMoney = function (value) {
		return "£" + commaSeparateNumber(value);
        function commaSeparateNumber(val) {
            while (/(\d+)(\d{3})/.test(val.toString())) {
                val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
            }
            return val;
        }
	}


    return LSUtils;
	
	
	
})();