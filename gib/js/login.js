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

        POPUPS = '#popups';

        
    //  Login module    
    IB.Login = {
        init : function () {
            this.numOfAttempts = 0;
            this.statusTimer = null;
            this.getStatus();
            this.attachHandlers();
            this.initDialog();
        },

        attachHandlers : function () {
            $(LOGIN_FORM).on("submit", $.proxy(this.login, this));
            $(LOGOUT_FORM).on("submit", $.proxy(this.logout, this));
        },

        initDialog : function () {
            var status = $(STATUS_DIALOG),
                confirm = $(CONFIRM_DIALOG),
                cancelButton = status.find(".cancel-btn"),
                yesButton = confirm.find(".yes-btn"),
                noButton = confirm.find(".no-btn");

            cancelButton.on("click", $.proxy(this.logoutConfirm, this));
            yesButton.on("click", $.proxy(this.logoutConfirm, this));
            noButton.on("click", $.proxy(this.showConfirmDialog, this, false));
            $(POPUPS).accordion({
                heightStyle: "content",
                collapsible: true,
                header: "h3"
            });
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
            this.send(request);
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
            this.abort();
            this.hidePopups();
            $(CONFIRM_DIALOG).hide(SHOW_HIDE_INTERVAL);
            if (e) {
                e.preventDefault();
            }
            this.send({
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
            this.send({
                url : '/v1/status.json',
                success : $.proxy(this.processStatus, this)
            });
        },

        processStatus : function (data) {
            var ibLoginSession = data.ib_login_session,
                popups = data.popups;
            
            switch (ibLoginSession) {
                case LOGIN_STATUS_CONNECTING :
                    this.updateStatus(MSG_LOGIN, true);
                    this.statusTimer = setTimeout($.proxy(this.getStatus, this, ibLoginSession), STATUS_REQUEST_INTERVAL);
                break;

                case LOGIN_STATUS_CONNECTED:
                    this.showTimestamp(MSG_TIMESTAMP_CONNECTED);
                    this.updateUserName(true);
                    this.showLogoutForm(true);
                    break;

                case LOGIN_STATUS_DISCONNECTING :
                    this.updateStatus(MSG_LOGOUT);
                    this.statusTimer = setTimeout($.proxy(this.getStatus, this, ibLoginSession), STATUS_REQUEST_INTERVAL);
                break;

                case LOGIN_STATUS_DISCONNECTED:
                    this.showTimestamp(MSG_TIMESTAMP_DISCONNECTED);
                    this.showLogoutForm(false);
                    break;
            }
            if (popups) {
                this.showPopups(popups);
            }
        },

        getPopupContent : function (title, content) {
            return '<h3>'+title+'</h3><div><p>'+content+'</p></div>';
        },
        
        showPopups : function (popups) {
            var popupContainer = $(POPUPS),
                content = "",
                popup,
                i;
            for (i in popups) {
                popup = popups[i];
                content += this.getPopupContent(popup.title, popup.content.join('<br>'));
            }
            popupContainer.html("");
            popupContainer.append(content);
            popupContainer.accordion('destroy').accordion({ heightStyle: "content" });
            popupContainer.accordion('option', 'active', false);
            popupContainer.accordion('option', 'active', -1);
        },
        
        hidePopups : function () {
            var popupContainer = $(POPUPS);
            popupContainer.html("");
            popupContainer.accordion('refresh');            
        },

        showLogoutForm : function (show) {
            this.hidePopups();
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

        lpad : function (str, length, padString) {
            padString = padString || '0';
            while (str.length < length)
                str = padString + str;
            return str;
        },
        
        showTimestamp : function (msg) {
            var timestamp = $(".timestamp"),
                months = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"),
                d = new Date(),
                month = months[d.getMonth()],
                day = d.getDate(),
                hrs = d.getHours(),
                mins = d.getMinutes(),
                amPm = hrs > 12 ? 'PM' : 'AM',
                timeString = '';

            hrs = hrs % 12;
            if (hrs === 0) {
                hrs = 12;
            }
            hrs = hrs.toString();
            mins = this.lpad(mins.toString(), 2);
            timeString = month + " " + day + " " + hrs + ":" + mins + ' ' + amPm;

            timestamp.removeClass('hide');
            timestamp.find(".text").html("As of " + timeString + " - " + msg);
        },

        send : function (request) {
            this.request = $.ajax(request);
        },

        abort : function () {
            if (this.request) {
                this.request.abort();
            }
        }
    };
}($));
