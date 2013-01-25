;(function ($) {
    IB.UI.Widgets.MLog = function (container) {
        var SHOW_HIDE_INTERVAL = 300;
        return {
            init : function (container) {
                this.contanier = $(container);
                this.dialogs = {};
            },

            joinContent : function (content) {
                var i,
                    parsed = [],
                    line;
                for (i in content) {
                    line = $.trim(content[i]);
                    if (line && typeof line === 'string') {
                        parsed.push(line);
                    }
                }
                return parsed.join('<br>');
            },

            render : function (popups) {
                var content = "",
                    popup,
                    dlg,
                    id;
                for (id in popups) {
                    if (this.dialogs[id]) {
                        continue;
                    }
                    popup = popups[id];
                    dlg = IB.UI.Widgets.Dialog();
                    dlg.render({
                        parent : this.contanier,
                        title : popup.category,
                        closeCallback : $.proxy(this.close, this, popup.mid),
                        content : this.joinContent(popup.summary)
                    });
                    this.dialogs[id] = dlg;
                }
                this.show();
            },

            show : function () {
                this.contanier.show(SHOW_HIDE_INTERVAL);
            },

            hide : function () {
                this.contanier.hide(SHOW_HIDE_INTERVAL);
            },

            close : function (dialogId, e) {
                IB.Util.Xhr.send({
                    type : 'POST',
                    data : {
                            mid : dialogId
                        },
                    url : '/v2/dismiss_popup.json',
                    contentType: "application/x-www-form-urlencoded",
                    dataType: "json",
                    success : $.proxy(this.closeSuccess, this, dialogId)
                });
            },

            closeSuccess : function (dialogId) {
                this.dialogs[dialogId] = -1;
                //delete this.dialogs[dialogId];
            }
        };
    };
}($));