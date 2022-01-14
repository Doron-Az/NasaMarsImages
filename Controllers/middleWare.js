const jwt = require('jsonwebtoken');
const dbModels = require("../models"); //contain the User model


module.exports.checkToken = (req, res, next) => {

    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied!');

    try {
        const TOKEN_SECRET = "tokenSecret";
        const verified = jwt.verify(token, TOKEN_SECRET);
        req.user = verified;
        next();

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
}

module.exports.valitadeRgester = (req, res, next) => {

    const { firstNameInput, lastNameInput, emailInput, passwordInput } = req.body;

    return dbModels.User.findOne({ where: { email: emailInput } })
        .then((user) => {
            const v_email = user ? false : true;
            const v_first_name = /^[a-zA-Z]+$/.test(firstNameInput);
            const v_last_name = /^[a-zA-Z]+$/.test(lastNameInput);
            const v_password = passwordInput.length > 7;

            return v_first_name && v_last_name && v_email && v_password;
        }).then((v) => {
            if (v)
                next();
            else
                throw "";

        }).catch((msg) => {

            res.render('myError', {
                pageTitle: "NASA Error",
                scriptPath: "",
                message: 'Sorry we could not register you Please try again'
            })
        });


}

module.exports.checkTimerCookie = (req, res, next) => {

    const { cookies } = req;

    if (!('registerTimer' in cookies))
        return res.render('myError', {
            pageTitle: "NASA Error",
            scriptPath: "",
            message: "Too late, hurry up next time"
        });
    else
        next();
}


module.exports.isConnected = (req, res, next) => {

    if (req.session.isConnected)
        next();
    else
        res.redirect('login');
}
