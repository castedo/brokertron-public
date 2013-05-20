;(function ($) {

    // Constants

    var LOGOUT_FORM = ".logout-form",

        LOGIN_FORM = ".login-form",

        STATUS_DIALOG = "#status-dialog",

        CONFIRM_DIALOG = "#confirm-dialog",

        LOGIN_STATUS_CONNECTING = "connecting",

        LOGIN_STATUS_DISCONNECTING = "disconnecting",

        LOGIN_STATUS_CONNECTED = "connected",

        LOGIN_STATUS_DISCONNECTED = "disconnected",

        MSG_TIMESTAMP_CONNECTED = "Connected",

        MSG_TIMESTAMP_DISCONNECTED = "Disconnected",

        MSG_LOGIN = "Logging into Interactive Brokers",

        MSG_LOGOUT = "Logging out of Interactive Brokers",

        MSG_CONFIRM_LOGOUT = "Logout of Interactive Brokers now?",

        MAX_ATTEMPTS = 20,

        SHOW_HIDE_INTERVAL = 300,

        STATUS_REQUEST_INTERVAL = 2000,

        POPUPS = '#popups',

        M_LOG = '#mlog';


    //  Login module
    IB.Login = {
        init : function () {
            this.attempts = 0;
            this.statusTimer = null;
            this.getStatus();
            this.handlers();
            this.popups();
            IB.Util.Xhr.cache(false);
        },

        handlers : function () {
            var status = $(STATUS_DIALOG),
                confirm = $(CONFIRM_DIALOG),
                cancelButton = status.find(".cancel-btn"),
                yesButton = confirm.find(".yes-btn"),
                noButton = confirm.find(".no-btn");

            $(LOGIN_FORM).on("submit", $.proxy(this.login, this));
            $(LOGOUT_FORM).on("submit", $.proxy(this.logout, this));

            cancelButton.on("click", $.proxy(this.logoutConfirm, this));
            yesButton.on("click", $.proxy(this.logoutConfirm, this));
            noButton.on("click", $.proxy(this.showConfirmDialog, this, false));
        },

        popups : function () {
            this.popup = IB.UI.Widgets.Popup();
            this.popup.init(POPUPS);
            this.mLog = IB.UI.Widgets.Popup();
            this.mLog.init(M_LOG);
        },

        showConfirmDialog : function (show) {
            var confirm = $(CONFIRM_DIALOG);
            if (show) {
                confirm.find(".text").html(MSG_CONFIRM_LOGOUT);
                $(LOGOUT_FORM).hide(SHOW_HIDE_INTERVAL);
                confirm.show(SHOW_HIDE_INTERVAL);
            }
            else {
                $(LOGOUT_FORM).show(SHOW_HIDE_INTERVAL);
                confirm.hide(SHOW_HIDE_INTERVAL);
            }
        },

        login : function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.popup.destroy();
            this.mLog.destroy();
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
            this.attempts = 0;
            IB.Util.Xhr.send(request);
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
            IB.Util.Xhr.abort();
            this.popup.destroy();
            this.mLog.destroy();
            $(CONFIRM_DIALOG).hide(SHOW_HIDE_INTERVAL);
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            IB.Util.Xhr.send({
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
                this.attempts++;
                if (this.attempts > MAX_ATTEMPTS) {
                    this.logoutConfirm();
                    this.attempts = 0;
                    return false;
                }
            }
            IB.Util.Xhr.send({
                url : '/v1/status.json',
                success : $.proxy(this.processStatus, this)
            });
        },

        processStatus : function (data) {
            var ibLoginSession = data.ib_login_session,
                popups = data.popups,
                mLog = data.mlog ? data.mlog.flagged : [];

            switch (ibLoginSession) {
                case LOGIN_STATUS_CONNECTING :
                    this.updateStatus(MSG_LOGIN, true);
                    this.statusTimer = setTimeout($.proxy(this.getStatus, this, ibLoginSession), STATUS_REQUEST_INTERVAL);
                    break;

                case LOGIN_STATUS_CONNECTED:
                    this.popup.destroy();
                    this.mLog.destroy();
                    this.showTimestamp(MSG_TIMESTAMP_CONNECTED);
                    this.updateUserName(true);
                    this.showLogoutForm(true);
                    break;

                case LOGIN_STATUS_DISCONNECTING :
                    this.updateStatus(MSG_LOGOUT);
                    this.statusTimer = setTimeout($.proxy(this.getStatus, this, ibLoginSession), STATUS_REQUEST_INTERVAL);
                    break;

                case LOGIN_STATUS_DISCONNECTED:
                    this.popup.destroy();
                    this.mLog.destroy();
                    this.showTimestamp(MSG_TIMESTAMP_DISCONNECTED);
                    this.showLogoutForm(false);
                    break;
            }
            if (popups) {
                this.popup.render(popups);
            }
            if (mLog && mLog.length > 0) {
                this.mLog.render(mLog);
            }
        },

        showLogoutForm : function (show) {
            this.popup.hide();
            this.mLog.hide();
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
                isOpen = (status.css("display") !== 'none');
            if (!msg) {
                status.hide(SHOW_HIDE_INTERVAL);
            }
            else {
                status.find(".text").html(msg);
                if (showCancel) {
                    status.find(".cancel-btn").show();
                }
                else {
                    status.find(".cancel-btn").hide();
                }
                if (!isOpen) {
                    $(LOGIN_FORM).hide(SHOW_HIDE_INTERVAL);
                    $(LOGOUT_FORM).hide(SHOW_HIDE_INTERVAL);
                    status.show(SHOW_HIDE_INTERVAL);
                }
            }
        },

        updateUserName : function () {
            $(".logged-in-user-name").html($("#user-name").val());
        },

        showTimestamp : function (msg) {
            var timestamp = $(".timestamp"),
                timeString = IB.Util.String.formatDate(new Date());
            timestamp.removeClass('hide');
            timestamp.find(".text").html("As of " + timeString + " - " + msg);
        }
    };
}($));
