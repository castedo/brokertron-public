;(function ($) {

    // Constants

    var LOGOUT_BTN = "#logout-btn",
    
        LOGIN_FORM = ".login-form",

        STATUS_DIALOG = "#status-dialog",

        LOGIN_STATUS_CONNECTING = "connecting",
        
        LOGIN_STATUS_DISCONNECTING = "disconnecting",

        LOGIN_STATUS_CONNECTED = "connected",

        LOGIN_STATUS_DISCONNECTED = "disconnected";

        
    // Login module    
    IB.Login = {
        init : function () {
            this.initDialog();
            $(LOGOUT_BTN).hide();
            this.updateStatus();
            this.attachHandlers();
        },

        attachHandlers : function () {
            $(LOGIN_FORM).on("submit", $.proxy(this.submitHandler, this));
            $(LOGOUT_BTN).on("click", $.proxy(this.logoutHandler, this));
        },

        initDialog : function () {
            $("#status-dialog").dialog({
                title : "Login Status",
                dialogClass : "no-close",
                autoOpen : false,
                modal : true,
                resizable : false,
                draggable : false
                });
        },
        
        submitHandler : function(e) {
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
                    success : $.proxy(this.loginSuccessHandler, this)
                };
            $.ajax(request);
        },

        loginSuccessHandler : function (data) {
            this.processStatus(data);
        },
        
        logoutHandler : function (e) {
            e.preventDefault();
            $.ajax({
                type : 'POST',
                url : '/v1/logout.json',
                contentType: "application/x-www-form-urlencoded",
                dataType: "json",
                success : $.proxy(this.logoutSuccessHandler, this)
            });
        },

        logoutSuccessHandler : function (data) {
            this.processStatus(data);
        },

        fireStatusRequest : function (ibLoginSession) {
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
                    this.updateStatus("Connecting to the gateway, please wait!");
                    setTimeout($.proxy(this.fireStatusRequest, this), 1000);
                break;

                case LOGIN_STATUS_CONNECTED:
                    this.updateStatus("Connected!!");
                    this.showLogoutButton(true);
                    break;

                case LOGIN_STATUS_DISCONNECTING :
                    this.updateStatus("Disconnecting from the gateway, please wait!");
                    setTimeout($.proxy(this.fireStatusRequest, this), 1000);
                break;

                case LOGIN_STATUS_DISCONNECTED:
                    this.updateStatus("Disconnected!!");
                    this.showLogoutButton(false);
                    break;
            }
        },

        showLogoutButton : function (show) {
            this.updateStatus();
            if (show) {
                $(LOGIN_FORM).hide();
                $(LOGOUT_BTN).show();
            }
            else {
                $(LOGIN_FORM).show();
                $(LOGOUT_BTN).hide();
            }
        },

        updateStatus : function (msg) {
            var status = $(STATUS_DIALOG);
            if (!msg) {
                status.dialog("close");
            }
            else {
                //status.show();
                status.html(msg);
                status.dialog("open");
            }
        }
    };
}($));