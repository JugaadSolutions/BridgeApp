exports.createQuery = function (filter) {

    var query = {};
    var page = 1;
    var limit = 20;
    var fields = {};
    var sort = {};
    var populate = {};

    if (filter) {

        var q = JSON.parse(filter);

        if (q['where']) {
            query = q['where'];
        }

        if (q['page']) {
            page = q['page'];
        }

        if (q['limit']) {
            limit = q['limit'];
        }

        if (q['fields']) {
            fields = q['fields'];
        }

        if (q['order']) {
            sort = q['order'];
        }

        if (q['populate']) {
            populate = q['populate'];
        } else {
            populate = ''
        }

    } else {
        populate = '';
    }

    return {
        query: query,
        options: {
            page: page,
            limit: limit,
            select: fields,
            sort: sort,
            populate: populate

        }
    };

};