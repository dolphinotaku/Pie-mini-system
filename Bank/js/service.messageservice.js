// JavaScript Document
"use strict";

app.service('MessageService', function($rootScope, $timeout, ThemeService){
	var self = this;
    self.messageList = [];
    self.postponeMsgList = [];
    // clear message when ng-route event
    $rootScope.$on('$routeChangeStart', function () {
		self.messageList = [];
    });
    // clear message when ui-route event
    $rootScope.$on("$viewContentLoaded", function(targetScope){
		self.messageList = [];
    });
    
	self.getMsg = function(){
		return self.messageList;
	}
	self.addMsg = function(msg){
        if(!msg)
            return;
            
        var themeName = ThemeService.GetThemeName();
        switch(theme){
            case "D":
            case "B":
                if($.notify){
                    $.notify({
                        // options
                        message: msg 
                    },{
                        // settings
                        type: 'success',
                        placement: {
                            from: "top",
                            align: "center"
                        },
                        timer: 7000
                    });
                }
            break;
            case "U":
                if(typeof(UIkit) != "undefined")
                    UIkit.notify("<i class='uk-info-circle'></i> "+msg, {timeout: 7000, status:'primary'});
            break;
        }

		self.messageList.push(msg);
    }
    self.shiftMsg = function(){
        self.messageList.shift();
    }
    // for import message, no need to prompt as alert
	self.setMsg = function(msgList){
		if(typeof(msgList) == "undefined" || msgList == null)
			return;
		if(msgList.length <= 0)
			return;
        
        // clear message list
        // self.messageList.length = 0;
        self.clear();
        
        // cannot copy or assign the object directly to the messageList, it will break the assign by reference between the message directive
		for(var index in msgList){
            //self.addMsg(msgList[index], hiddenOnScreen);
            self.messageList.push(msgList[index]);
		}
        
	}
	self.clear = function(){
        for(var index in self.messageList){
            self.messageList.shift();
        }
    }
    self.getPostponeMsg = function(){
        return self.postponeMsgList;
    }
    self.setPostponeMsg = function(msgList){
		if(typeof(msgList) == "undefined" || msgList == null)
			return;
		if(msgList.length <= 0)
            return;
        self.postponeMsgList = msgList;
    }
    self.addPostponeMsg = function(msg){
        postponeMsgList.push(msg);
    }
    self.printPostponeMsg = function(){
        self.setMsg(self.postponeMsgList);
        self.clearPostponeMsg();
    }
    self.clearPostponeMsg = function(){
        for(var index in self.postponeMsgList){
            self.postponeMsgList.shift();
        }
    }
});
