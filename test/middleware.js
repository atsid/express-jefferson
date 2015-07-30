module.exports = {
    append(value) {
        return (req, res, next) => {
            req.result = (req.result || '') + value;
            next();
        };
    },

    sendResult(req, res) {
        res.send(req.result);
    },
};
