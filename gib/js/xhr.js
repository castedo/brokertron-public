;(function ($) {
    IB.Util.Xhr = {
        cache : function (status) {
            if (status === false) {
                $.ajaxSetup({
                    headers: { "cache-control": "no-cache" }
                });
            }
            else {
                $.ajaxSetup({});
            }
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