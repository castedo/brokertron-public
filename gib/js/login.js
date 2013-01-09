;(function ($) {

    // Constants

    var LOGOUT_FORM = ".logout-form",
    
        LOGIN_FORM = ".login-form",

        STATUS_DIALOG = "#status-dialog",

        LOGIN_STATUS_CONNECTING = "connecting",
        
        LOGIN_STATUS_DISCONNECTING = "disconnecting",

        LOGIN_STATUS_CONNECTED = "connected",

        LOGIN_STATUS_DISCONNECTED = "disconnected",

        MSG_LOGIN = "Logging into Interactive Brokers, please wait..",

        MSG_LOGOUT = "Logging out of Interactive Brokers, please wait..",

        MSG_CONFIRM_LOGOUT = "Logout of Interactive Brokers now?",

        MAX_ATTEMPTS = 10;

        
    // Login module    
    IB.Login = {
        init : function () {
            this.numOfAttempts = 0;
            this.statusTimer = null;
            this.initDialog();
            this.attachHandlers();
            this.getStatus();
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
            if (e) {
                e.preventDefault();
            }
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
            if (LOGIN_STATUS_DISCONNECTING !== ibLoginSession) {
                this.numOfAttempts++;
                if (this.numOfAttempts > MAX_ATTEMPTS) {
                    this.logoutConfirm();
                    this.numOfAttempts = 0;
                    return false;
                }
            }
            $.ajax({
                url : '/v1/status.json',
                success : $.proxy(this.processStatus, this)
            });
        },

        processStatus : function (data) {
            var ibLoginSession = data['ib_login_session'];
            
            switch (ibLoginSession) {
                case LOGIN_STATUS_CONNECTING :
                    this.updateStatus(MSG_LOGIN, true);
                    this.statusTimer = setTimeout($.proxy(this.getStatus, this, ibLoginSession), 2000);
                break;

                case LOGIN_STATUS_CONNECTED:
                    //this.updateStatus("Connected!!");
                    this.updateUserName(true);
                    this.showLogoutForm(true);
                    break;

                case LOGIN_STATUS_DISCONNECTING :
                    this.updateStatus(MSG_LOGOUT);
                    this.statusTimer = setTimeout($.proxy(this.getStatus, this, ibLoginSession), 2000);
                break;

                case LOGIN_STATUS_DISCONNECTED:
                    //this.updateStatus("Disconnected!!");
                    this.showLogoutForm(false);
                    break;
            }
        },

        showLogoutForm : function (show) {
            if (show) {
                $(LOGIN_FORM).hide();
                $(LOGOUT_FORM).show();
            }
            else {
                $(LOGIN_FORM).show();
                $(LOGOUT_FORM).hide();
            }
            this.updateStatus();
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
