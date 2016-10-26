exports.replaceStringWithIndexPosition = function (a, firstIndex, lastIndex, value) {

    var first = a.substring(0, firstIndex);
    var last = a.substring(lastIndex, a.length);
    a = first + value + last;
    return a;

};