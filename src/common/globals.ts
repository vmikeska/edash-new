

export enum LayoutSize { Mobile, Web }
export enum OS { A, WP, IOS, Other }





export function $(selector): MyDomOperations {
    // if (selector.startsWith("#")) {
    //     var s = selector.substring(1);
    //     var elm = document.getElementById(s);
    //     var md = new MyDomOperations(elm);
    //     return md;
    // }

    var elemsList = [];

    if (typeof selector === "string"){
        var elems = document.querySelectorAll(selector);
        elemsList = Array.prototype.slice.call(elems, 0);
    } else {
        elemsList.push(selector)
    }

    var md = new MyDomOperations(elemsList);
    return md;
}

export class MyDomOperations {

    public elements: HTMLElement[];

    constructor(element: HTMLElement[]) {
        this.elements = element;
    }

    private forEach(callback) {
        this.elements.forEach((element) => {
            callback(element);
        });
    }

    private get first() {
        return this.elements[0];
    }

    public addClass(name) {
        this.forEach((element) => {
            this.addClassInner(element, name);
        })
    }

    private addClassInner(element, name) {
        if (element.classList) {
            element.classList.add(name);
        } else {
            element.className += ' ' + name;
        }
    }

    public removeClass(name) {
        this.forEach((element) => {
            this.removeClassInner(element, name);
        })
    }

    private removeClassInner(element, name) {
        if (element.classList) {
            element.classList.remove(name);
        }
        else {
            element.className = element.className.replace(new RegExp('(^|\\b)' + name.split(' ').join('|') + '(\\b|$)', 'gi'), ' ')
        }
    }

    public closest(cls) {
        var res = this.closestInner(this.first, cls);
        return res;
    }

    private closestInner(element, cls) {
        while ((element = element.parentElement) && !element.classList.contains(cls));
        return element;
    }



}