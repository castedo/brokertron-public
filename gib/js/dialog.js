;(function ($) {
    IB.UI.Widgets.Dialog = function () {
        var SHOW_HIDE_INTERVAL = 300;
        return {
            render : function (params) {
                var parent = $(params.parent) || $('body'),
                    title = params.title || "",
                    type = params.type || "info",
                    content = params.content || "",
                    closeCallback = params.closeCallback || null,
                    el;
                this.container = el = $('<div class="alert"></div>');
                switch (type) {
                    case "error":
                        el.addClass('alert-error');
                        break;
                    case "warning" :
                        el.addClass('alert-block');
                        break;
                    case "success" :
                        el.addClass("alert-success");
                        break;
                    default :
                        el.addClass("alert-info");
                        break;
                }
                el.appendTo(parent);
                if (parent.hasClass('ui-2')) {
                    el.html('<button type="button" class="close text-warning no-btn" data-dismiss="alert">&times;</button><h4>'+title+'</h4><p class="text">'+content+'</p>');
                }
                else {
                    el.html('<div class="head"><h3 class="title">'+title+'</h3><button class="input-btn close">x</button></div><p class="content">'+content+'</p>');
                }
                el.on('click', $.proxy(this.click, this, closeCallback));
                this.show();
            },

            show : function () {
                this.container.show(SHOW_HIDE_INTERVAL);
            },

            hide : function () {
                this.container.hide(SHOW_HIDE_INTERVAL);
            },

            destroy : function () {
            },

            click : function (callback, e) {
                var target = $(e.target);
                if (target.hasClass('close')) {
                    this.hide();
                    if (callback) {
                        callback();
                    }
                }
            }
        };
    };
}($));