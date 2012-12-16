;(function ($) {

    // Constants

    var LOGOUT_FORM = ".logout-form",
    
        LOGIN_FORM = ".login-form",

        STATUS_DIALOG = "#status-dialog",

        LOGIN_STATUS_CONNECTING = "connecting",
        
        LOGIN_STATUS_DISCONNECTING = "disconnecting",

        LOGIN_STATUS_CONNECTED = "connected",

        LOGIN_STATUS_DISCONNECTED = "disconnected",

        MSG_LOGIN = "Connecting to the gateway, please wait..",

        MSG_LOGOUT = "Disconnecting from the gateway, please wait..",

        MSG_CONFIRM_LOGOUT = "Logout of IB Brokertron Gateway now?";

        
    // Login module    
    IB.Login = {
        init : function () {
            this.statusTimer = null;
            this.initDialog();
            this.attachHandlers();
        },

        attachHandlers : function () {
            $(LOGIN_FORM).on("submit", $.proxy(this.login, this));
            $(LOGOUT_FORM).on("submit", $.proxy(this.logout, this));
        },

        initDialog : function () {
            $("#status-dialog").dialog({
                title : "Login Status",
                dialogClass : "no-close",
                autoOpen : false,
                modal : true,
                resizable : false,
                draggable : false,
                buttons : [
                    {
                        id : "status-dlg-cancel-btn",
                        text : "Cancel",
                        click : $.proxy(this.logout, this)
                    }
                ]
            });

            $("#confirm-dialog").dialog({
                title : "Confirm Action",
                dialogClass : "no-close",
                autoOpen : false,
                modal : true,
                resizable : false,
                draggable : false,
                buttons : [
                    {
                        text : "Yes",
                        click : $.proxy(this.logoutConfirm, this)
                    },
                    {
                        text : "No",
                        click : $.proxy(this.showConfirmDialog, this, false)
                    }
                ]
            });
        },

        showConfirmDialog : function (show) {
            var confirm = $("#confirm-dialog");
            if (show) {
                confirm.html(MSG_CONFIRM_LOGOUT);
                confirm.dialog("open");
            }
            else {
                confirm.dialog("close");
            }
        },
        
        login : function(e) {
            e.preventDefault();
            e.stopPropagation();
            var userName = $("#user-name").val(),
                passwd = $("#password").val(),
                request = {
                    type : 'POST',
                    url : '/v1/login.json',
                    data : {
                        username : userName,
                        password : passwd
                    },
                    contentType: "application/x-www-form-urlencoded",
                    dataType: "json",
                    success : $.proxy(this.loginSuccess, this)
                };
            $.ajax(request);
            this.updateStatus(MSG_LOGIN, true);
        },

        loginSuccess : function (data) {
            this.processStatus(data);
        },

        logout : function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.showConfirmDialog(true);
        },
        
        logoutConfirm : function (e) {
            this.showConfirmDialog(false);
            e.preventDefault();
            $.ajax({
                type : 'POST',
                url : '/v1/logout.json',
                contentType: "application/x-www-form-urlencoded",
                dataType: "json",
                success : $.proxy(this.logoutSuccess, this)
            });
            clearTimeout(this.statusTimer);
            this.updateStatus(MSG_LOGOUT);
        },

        logoutSuccess : function (data) {
            this.processStatus(data);
        },

        getStatus : function (ibLoginSession) {
            $.ajax({
                url : '/v1/status.json',
                ib_login_session : ibLoginSession,
                success : $.proxy(this.processStatus, this)
            });
        },

        processStatus : function (data) {
            var ibLoginSession = data['ib_login_session'];
            
            switch (ibLoginSession) {
                case LOGIN_STATUS_CONNECTING :
                    //this.updateStatus(MSG_LOGIN);
                    this.statusTimer = setTimeout($.proxy(this.getStatus, this), 1000);
                break;

                case LOGIN_STATUS_CONNECTED:
                    //this.updateStatus("Connected!!");
                    this.updateUserName(true);
                    this.showLogoutForm(true);
                    break;

                case LOGIN_STATUS_DISCONNECTING :
                    //this.updateStatus(MSG_LOGOUT);
                    this.statusTimer = setTimeout($.proxy(this.getStatus, this), 1000);
                break;

                case LOGIN_STATUS_DISCONNECTED:
                    //this.updateStatus("Disconnected!!");
                    this.showLogoutForm(false);
                    break;
            }
        },

        showLogoutForm : function (show) {
            this.updateStatus();
            if (show) {
                $(LOGIN_FORM).hide();
                $(LOGOUT_FORM).show();
            }
            else {
                $(LOGIN_FORM).show();
                $(LOGOUT_FORM).hide();
            }
        },

        updateStatus : function (msg, showCancel) {
            var status = $(STATUS_DIALOG),
                isOpen = status.dialog("isOpen");
            if (!msg) {
                status.dialog("close");
            }
            else {
                status.html(msg);
                if (showCancel) {
                    $("#status-dlg-cancel-btn").button("enable");
                }
                else {
                    $("#status-dlg-cancel-btn").button("disable");
                }
                if (!isOpen) {
                    status.dialog("open");
                }
            }
        },

        updateUserName : function () {
            $(".logged-in-user-name").html($("#user-name").val());
        }
    };
}($));