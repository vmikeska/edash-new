import { OS } from "./globals";


export class Utils {

    public static isNullOrUndefined(val) {
        if (val === null) {
            return true;
        }

        if (val === undefined) {
            return true;
        }

        return false;
    }

    public static any(array) {
        return array && array.length > 0;
    }

    public static downloadFile(sUrl) {

        //iOS devices do not support downloading. We have to inform user about this.
        if (/(iP)/g.test(navigator.userAgent)) {
            //alert('Your device does not support files downloading. Please try again in desktop browser.');
            window.open(sUrl, '_blank');
            return false;
        }

        let isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
        let isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

        //If in Chrome or Safari - download via virtual link click
        if (isChrome || isSafari) {
            //Creating new link node.
            var link = document.createElement('a');
            link.href = sUrl;
            link.setAttribute('target', '_blank');

            if (link.download !== undefined) {
                //Set HTML5 download attribute. This will prevent file from opening if supported.
                var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
                link.download = fileName;
            }

            //Dispatching click event.
            if (document.createEvent) {
                var e = document.createEvent('MouseEvents');
                e.initEvent('click', true, true);
                link.dispatchEvent(e);
                return true;
            }
        }

        // Force file download (whether supported by server).
        if (sUrl.indexOf('?') === -1) {
            sUrl += '?download';
        }

        window.open(sUrl, '_blank');
        return true;
    }



    public static getMobileOS(): OS {
        var userAgent = navigator.userAgent || navigator.vendor || window["opera"];

        // Windows Phone must come first because its UA also contains "Android"
        if (/windows phone/i.test(userAgent)) {
            return OS.WP;
        }

        if (/android/i.test(userAgent)) {
            return OS.A;
        }

        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        if (/iPad|iPhone|iPod/.test(userAgent) && !window["MSStream"]) {
            return OS.IOS;
        }

        return OS.Other;
    }

    public static getFontSize(elem) {
        let str = window.getComputedStyle(elem, null).getPropertyValue('font-size');
        let num = parseFloat(str.replace("px", ""));
        return num;
    }

    public static parseBool(val: string) {

        if (typeof (val) === typeof (true)) {
            return val;
        }

        if (val === "true") {
            return true;
        }

        if (val === "false") {
            return false;
        }

        return false;
    }

    public static randomString(length, chars) {
        var mask = '';
        if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
        if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (chars.indexOf('#') > -1) mask += '0123456789';
        if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
        var result = '';
        for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
        return result;
    }


    public static assureRange(val, min?: number, max?: number) {

        if (min !== null) {
            if (val < min) {
                val = min;
            }
        }

        if (max !== null) {
            if (val > max) {
                val = max;
            }
        }

        return val;
    }

    public static clone(obj) {
        let newObj = JSON.parse(JSON.stringify(obj));
        return newObj;
    }

    public static isInt(n) {
        return Number(n) === n && n % 1 === 0;
    }

    public static isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
    }

    public static isArray(obj) {
        let is = Object.prototype.toString.call(obj) === '[object Array]'
        return is;
    }

}