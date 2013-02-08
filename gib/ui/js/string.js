;(function ($) {
    IB.Util.String = {
        lpad : function (str, length, padString) {
            padString = padString || '0';
            while (str.length < length) {
                str = padString + str;
            }
            return str;
        },

        formatDate : function (d) {
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
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
            mins = IB.Util.String.lpad(mins.toString(), 2);
            timeString = month + " " + day + " " + hrs + ":" + mins + ' ' + amPm;
            return timeString;
        },

        trim : function (str) {
            return str.replace(/^\s+|\s+$/g, '');
        }
    };
}($));
