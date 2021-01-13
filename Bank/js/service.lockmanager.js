// JavaScript Document
"use strict";

app.service('LockManager', ['$rootScope', '$timeout', 'config', function($rootScope, $cookies, config) {
	var locker = this;
	locker.lockArea = {};
	locker.tagName = "";
	locker.programId = "";

    // call at data submit
	locker.LockAllControls = function(lockArea, tagName){
		// var lockArea = locker.lockArea;
		// var tagName = locker.tagName;
		// tagName = tagName.toLowerCase();

		var isLockArea = CheckLockArea(lockArea);
		if(!isLockArea)
			return;
		if(config.debugLog.LockControl)
			console.log("LockAllControls(): "+tagName);

        if(tagName == "entry" || 
        tagName == "process" || 
        tagName == "inquiry"){
			LockEntryControls(lockArea, true);
        }else {
			LockPageViewControls(lockArea, true);
		}
	}

    // call at entry onload
	locker.LockAllInputBox = function(lockArea, tagName){
		tagName = tagName.toLowerCase();
		LockAllInputBox(lockArea, true);
	}

	locker.UnLockSubmitButton = function(lockArea, tagName){
		tagName = tagName.toLowerCase();
		LockSubmitButton(lockArea, false);
	}

	locker.UnLockAllControls = function(lockArea, tagName){
		// var lockArea = locker.lockArea;
        // var tagName = locker.tagName;
        
		var isLockArea = CheckLockArea(lockArea);
		if(!isLockArea)
			return;

		if(config.debugLog.UnlockControl)
			console.log("UnLockAllControls(): "+tagName);

        if(tagName == "entry" || 
        tagName == "process" || 
        tagName == "inquiry"){
			LockEntryControls(lockArea, false);
        }else {
			LockPageViewControls(lockArea, false);
		}
	}

	function CheckLockArea(lockArea){
		var isValid = true;
		if(!lockArea){
			console.log("LockManager: lock area have not defined. Avoid to UnLockAllControls().")
			isValid = false;
		}
		return isValid;
	}

	function LockPageViewControls(lockArea, isLock){
		var fieldset = lockArea.find("fieldset");
		$(fieldset).prop("disabled", isLock);
		
		var input = lockArea.find("input");
		$(input).prop("disabled", isLock);
	    
	    var textarea = lockArea.find("textarea");
	    $(textarea).prop("disabled", isLock);

		var button = lockArea.find("button");
		$(button).prop("disabled", isLock);

		var button = lockArea.find("button");
		$(button).prop("disabled", isLock);
	}

	function LockEntryControls(lockArea, isLock){
		var fieldset = lockArea.find("fieldset");
		$(fieldset).prop("disabled", isLock);
		
		var input = lockArea.find("input");
		$(input).prop("disabled", isLock);

		var textarea = lockArea.find("textarea");
		$(textarea).prop("disabled", isLock);

		// var nonSubmitButton = lockArea.find("button:not([type='submit'])")
		var nonSubmitButton = lockArea.find("button[type='submit']");
		nonSubmitButton.prop("disabled", isLock);

		// var button = lockArea.find(".submitBtn button")
		// $(button).prop("disabled", isLock)

		var editBtn = lockArea.find("editbox button");
        $(editBtn).prop("disabled", isLock);
        
        var toggleSwitch = lockArea.find(".switch .slider");
        if(isLock){
            $(toggleSwitch).addClass("disable_toggle");
        }else{
            $(toggleSwitch).removeClass("disable_toggle");
        }
	}

	function LockAllInputBox(lockArea, isLock){
		var fieldset = lockArea.find("fieldset");
		$(fieldset).prop("disabled", isLock);
		
		var input = lockArea.find("input");
		$(input).prop("disabled", isLock);
	    
	    var textarea = lockArea.find("textarea");
        $(textarea).prop("disabled", isLock);
        
        var toggleSwitch = lockArea.find(".switch .slider");
        if(isLock){
            $(toggleSwitch).addClass("disable_toggle");
        }else{
            $(toggleSwitch).removeClass("disable_toggle");
        }
	}

	function LockSubmitButton(lockArea, isLock){
		var button = lockArea.find(".submitBtn button")
		$(button).prop("disabled", isLock)
		var subminButton = lockArea.find("button[type='submit']")
		$(subminButton).prop("disabled", isLock)
	}

	return locker;
}]);
