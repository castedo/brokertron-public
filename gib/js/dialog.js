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
                    el,
                    className;

                switch (type) {
                    case "error":
                        className = 'alert-error';
                        break;
                    case "warning" :
                        className = 'alert-block';
                        break;
                    case "success" :
                        className = "alert-success";
                        break;
                    default :
                        className = "alert-info";
                        break;
                }
                this.container = el = $('<div class="alert"></div>');
                if (parent.hasClass('ui-2')) {
                    el.html('<button type="button" class="close text-warning no-btn" data-dismiss="alert">&times;</button><h4>'+title+'</h4><p class="text">'+content+'</p>');
                    el.addClass("alert "+className);
                }
                else {
                    el.html('<div class="head"><h3 class="title">'+title+'</h3><button class="input-btn close">x</button></div><p class="content">'+content+'</p>');
                    el.addClass("dialog "+className);
                }
                el.appendTo(parent);
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
                this.container.remove();
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
