const jwt = require('jsonwebtoken');

// const authenWeb = (req, res, next) => {
//     const { session } = req;
//     const url = req.originalUrl.toLowerCase();
//     if (!session) {
//         // nếu chưa login
//         if (url.includes('login')) {
//             next();
//         } else {
//             res.redirect('/login');
//         }
//     } else {
//         const { token } = session;
//         if (!token) {
//             if (url.includes('login')) {
//                 next();
//             } else {
//                 res.redirect('/login');
//             }
//         } else {
//             jwt.verify(token, 'secret', function (error, decoded) {
//                 const { role } = decoded;
//                 if (error) {
//                     if (url.includes('login')) {
//                         next();
//                     } else {
//                         res.redirect('/login');
//                     }
//                 } else {
//                     // nếu đã login
//                     if (role === 0 || role === 1) {
//                         if (url.includes('login')) {
//                             // qua home
//                             res.redirect('/');
//                         } else {
//                             next();
//                         }
//                     }else{
//                         res.json("You are not admin")
//                     }

//                 }
//             })
//         }
//     }
// }

const authenWeb = (req, res, next) => {
    const { session } = req;
    const url = req.originalUrl.toLowerCase();

    // Kiểm tra nếu chưa login
    if (!session || !session.token) {
        if (url.includes('login')) {
            return next();
        }
        return res.redirect('/login');
    }

    // Kiểm tra token
    jwt.verify(session.token, 'secret', (error, decoded) => {
        if (error) {
            if (url.includes('login')) {
                return next();
            }
            return res.redirect('/login');
        }
        const { role } = decoded;
        // Nếu đã login với role 0 hoặc 1
        if (role === 0 || role === 1) {
            if (url.includes('login')) {
                return res.redirect('/');
            }
            return next();
        } else {
            if (url.includes('login')) {
                return next()
            }
            // Nếu không phải admin hoặc user có role 0 hoặc 1
            // res.status(403).json({ message: "You are not admin" });
            // return res.redirect('/error', {message: you are not admin});
            req.session.errorMessage = 'You are not admin';
            return res.redirect('/notification');


        }
    });
};

const authenUserPermission = (req, res, next) => {
    const { session } = req;
    const { token } = session;

    if (!token) {
        return res.redirect('/login');
    }
    jwt.verify(token, 'secret', (error, decoded) => {
        if (error) {
            return res.redirect('/login');
        }
        const { role, id } = decoded;
        req.user = { id, role }; // Lưu trữ thông tin người dùng vào req để sử dụng trong router
        if (role === 0) {
            next();
        } else {
            // res.json('Not Permission')
            req.session.errorMessage = 'Not permission';
            return res.redirect('/notification');
        }
    });
};


const authenAPI = (req, res, next) => {
    let token = null;
    if (req.headers.authorization &&
        req.headers.authorization.split(' ')[0] == 'Bearer')
        token = req.headers.authorization.split(' ')[1];

    if (token) {
        jwt.verify(token, 'secret', function (error, decoded) {
            if (error) {
                return res.status(401).json({ status: false })
            } else {
                return next();
            }
        })
    } else {
        return res.status(401).json({ status: false })
    }
}

module.exports = { authenWeb, authenAPI, authenUserPermission };