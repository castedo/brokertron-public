;(function ($) {
    IB.UI.Widgets.Popup = function (container) {
        var SHOW_HIDE_INTERVAL = 300;
        return {
            init : function (container) {
                this.contanier = $(container);
                this.dialogs = {};
                this.removed = {};
            },

            markAllRemoved : function () {
                var i;
                for (i in this.dialogs) {
                    this.removed[i] = true;
                }
            },

            removeMarked : function () {
                var i,
                    dlg;
                for (i in this.removed) {
                    if (this.removed[i] === true) {
                        dlg = this.dialogs[i];
                        if (dlg.hide) {
                            dlg.hide();
                        }
                        this.closeSuccess(i);
                    }
                }
                this.removed = {};
            },

            joinContent : function (content) {
                var i,
                    parsed = [],
                    line;
                for (i in content) {
                    line = content[i];
                    if (line && typeof line === 'string') {
                        if ($.trim(line)) {
                            parsed.push(line);
                        }
                    }
                }
                return parsed.join('<br>');
            },

            render : function (popups) {
                var content = "",
                    dialogId,
                    popup,
                    dlg,
                    id,
                    i;
                this.markAllRemoved();
                for (i in popups) {
                    popup = popups[i];
                    id = popup.mid || i;
                    if (this.dialogs[id]) {
                        this.removed[id] = false;
                        continue;
                    }
                    dialogId = popup.mid ? { mid : id } : { wid : id };
                    dlg = IB.UI.Widgets.Dialog();
                    dlg.render({
                        type : popup.mid ? "error" : "warning",
                        parent : this.contanier,
                        title : popup.title,
                        closeCallback : $.proxy(this.close, this, dialogId),
                        content : (popup.content ? this.joinContent(popup.content) : popup.summary)
                    });
                    this.dialogs[id] = dlg;
                    this.removed[id] = false;
                }
                this.removeMarked();
                this.show();
            },

            show : function () {
                this.contanier.show(SHOW_HIDE_INTERVAL);
            },

            hide : function () {
                this.contanier.hide(SHOW_HIDE_INTERVAL);
            },

            close : function (dialogId, e) {
                var id,
                    closeUrl,
                    reqData = {};
                if (dialogId.wid) {
                    id = dialogId.wid;
                    reqData = {
                        wid : id
                    };
                    closeUrl = '/v2/dismiss_popup.json';
                }
                else {
                    id = dialogId.mid;
                    reqData = {
                        mid : id
                    };
                    closeUrl = '/v2/mlog_deflag.json';
                }
                IB.Util.Xhr.send({
                    type : 'POST',
                    data : reqData,
                    url : closeUrl,
                    contentType: "application/x-www-form-urlencoded",
                    dataType: "json",
                    success : $.proxy(this.closeSuccess, this, id)
                });
            },

            closeSuccess : function (dialogId) {
                this.dialogs[dialogId] = -1;
                //delete this.dialogs[dialogId];
            },

            destroy : function () {
                var i,
                    dlg,
                    dlgs = this.dialogs;
                for (i in dlgs) {
                    dlg = dlgs[i];
                    if (dlg && dlg.destroy) {
                        dlg.destroy();
                    }
                }
                this.contanier.empty();
                this.dialogs = {};
                this.removed = {};
            }
        };
    };
}($));
