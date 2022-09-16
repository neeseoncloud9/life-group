import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import mysql from 'mysql';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
dotenv.config();
var bodyParser = require('body-parser');
const redis        = require('redis');
const connectRedis = require('connect-redis');
const app          = express();
const RedisStore   = connectRedis(session);
//Configure redis client
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
})
redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});
// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    sameSite: 'none',
    resave: false,
    store: new RedisStore({ client: redisClient }),
}));
// cookie parser middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
}));

const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    database: process.env.DB_DB,
    port: process.env.DB_PORT,
});

const sendInstruction = (template_id, temp_data, to_email) => {
    const url = "https://api.sendgrid.com/v3/mail/send";
		
	const MyHeaders = {
		"Authorization": "Bearer " + process.env.SEND_GRID_KEY,
		"Content-Type": "application/json"
	};
	const MyBody = {
		"personalizations": [{
			"to": [{
				"email": to_email
			}],
        "dynamic_template_data":temp_data
		}],
		"from": {
			"email": "lifegroups@northparksherman.com"
		},
		"template_id":template_id
	};

	return new Promise((resolve, reject) => {
            fetch(url, {
            "method": "POST",
            "headers": MyHeaders,
            "body": JSON.stringify(MyBody)
        })
        .then(Response => resolve(Response.statusText))
    });
}

const sendEmail = (temp_data, toEmail, res, tempID) => {
    const resultSend = sendInstruction(tempID, temp_data, toEmail);
    resultSend.then((sendGridResponse) => {
        if (sendGridResponse === 'Accepted') {
            res.json({
                error:false,
                msg: sendGridResponse
            })
        } else {
            res.json({
                error:true,
                msg: sendGridResponse
            })
        }
    })
}

const sendEmailMultiple = (temp_data, toEmails, res, tempID, sendErrorToAdmin = false) => {
    for (let i = 0; i < toEmails.length; i++) {
        const resultSend = sendInstruction(tempID, temp_data, toEmails[i]);
        resultSend.then((sendGridResponse) => {
            if (sendGridResponse === 'Accepted' && i === (toEmails.length - 1)) {
                res.json({
                    error:false,
                    msg: sendGridResponse
                })
            } else if (sendGridResponse !== 'Accepted') {
                if (sendErrorToAdmin) {
                    sendErrorAdmin(sendErrorToAdmin.church_id, sendErrorToAdmin.error_msg);
                }
                res.json({
                    error:true,
                    msg: sendGridResponse
                })
                return;
            }
        })
    }
}

const sendErrorAdmin = (church_id, error_msg) => {
    db.query(`SELECT email
            FROM users
            WHERE church_id = ?
            AND role = 1`,
    [church_id],
    (err, result) => {
        if (result.length !== 0) {
            const error_data = {
                "error":error_msg
            }
            sendEmail(error_data, result[0].email, false, 'd-bab01105dc4b46a18a1cc7f24a2b6242');
        }
    });
}

app.get('/', (req, res) => {
    const url       = req.headers.origin.includes('https') ? req.headers.origin.replace('https://','') : req.headers.origin.replace('http://','');
    const adminArea = req.body.adminArea ? true : false;
    console.log(url);

    db.query(`SELECT lg.*
            FROM churches c
            LEFT JOIN life_groups lg
            ON c.ID = lg.church_id
            WHERE url = ?
            AND deleted != 1
            AND display = 1`,
    [url],
    (err, result) => {
        if (err) {
            console.log(err);
            res.json({
                error:true,
                msg:err
            });
        } else if (result.length !== 0) {
            // let temp = result.reduce(function (r, a) {
            //     r[a.category] = r[a.category] || [];
            //     r[a.category].push(a);
            //     return r;
            // }, Object.create(null));
            // result = temp;
            res.json({
                error:false,
                msg:'success',
                life_groups:result,
            })
        } else {
            res.json({
                error:false,
                msg:'Sorry, Currently We Don\'t Have Any Life Groups Available'
            })
        }
    });
})

app.get('/adminArea', (req, res) => {
    const url       = req.headers.origin.includes('https') ? req.headers.origin.replace('https://','') : req.headers.origin.replace('http://','');
    console.log(url);

    db.query(`SELECT lg.*
            FROM churches c
            LEFT JOIN life_groups lg
            ON c.ID = lg.church_id
            WHERE url = ?
            AND deleted != 1`,
    [url],
    (err, result) => {
        if (err) {
            console.log(err);
            res.json({
                error:true,
                msg:err
            });
        } else if (result.length !== 0) {
            res.json({
                error:false,
                msg:'success',
                life_groups:result,
            })
        } else {
            res.json({
                error:false,
                msg:'Sorry, Currently We Don\'t Have Any Life Groups Available'
            })
        }
    });
})

app.get('/isLoggedIn', (req, res) => {
    console.log(req.sessionStore.sessions);
    console.log(req.session.isLoggedIn);
    if (req.session.isLoggedIn) {
        res.json({
            error: false
        });
    } else {
        req.session.destroy();
        res.json({
            error: true
        });
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy(function(err){
        if (err) {
            console.log(err);
            res.json({
                error:true,
                msg:err,
            })
        } else {
            res.json({
                error:false,
                msg:'logout success',
            })
        }
    });
})

app.post('/deleteGroup', (req, res) => {
    if (req.session.isLoggedIn) {
        const groupID = req.body.groupID;
        db.query(`UPDATE life_groups SET deleted = 1 WHERE ID = ?`,
        [groupID],
        (err, result) => {
            if (err) {
                console.log(err);
                res.json({
                    error:true,
                    msg:err
                });
            } else {
                res.json({
                    error:false,
                    msg:'Delete Successful'
                })
            }
        });
    } else {
        res.json({
            error:true,
            msg:'Not Logged In'
        });
    }
})

app.post('/updateDisplay', (req, res) => {
    if (req.session.isLoggedIn) {
        const groupID = req.body.groupID;
        const checked = req.body.checked ? 1 : 0;

        db.query(`UPDATE life_groups SET display = ? WHERE ID = ?`,
        [checked, groupID],
        (err, result) => {
            if (err) {
                console.log(err);
                res.json({
                    error:true,
                    msg:err
                });
            }
        });
    } else {
        res.json({
            error:true,
            msg:'Not Logged In'
        });
    }
})

app.post('/joinGroup', (req, res) => {
    const fullName = req.body.fullName;
    const email    = req.body.email;
    const phone    = req.body.phone;
    const groupID  = parseInt(req.body.groupID);

    db.query(`SELECT lg.group_leader_phone, lg.mobile_carrier_id, lg.email, lg.prefered_contact, lg.church_id, c.URL
            FROM life_groups lg
            LEFT JOIN carriers c
            ON c.ID = lg.mobile_carrier_id
            WHERE lg.ID = ?`,
    [groupID],
    (err, result) => {
        if (err) {
            console.log(err);
            res.json({
                error:true,
                msg:err
            });
        } else if (result.length !== 0) {
            const temp_data = {
                "fullName": fullName,
                "email": email,
                "phone": phone,
            };
            const prefered_contact = result[0].prefered_contact;
            const leader_email     = result[0].email;
            const carrier_url      = result[0].URL;
            const leader_phone     = result[0].group_leader_phone;
            switch(prefered_contact) {
                case 'email':
                    sendEmail(temp_data, leader_email, res, 'd-4e37b4301b7142e0a29782184b228709');
                    break;
                case 'text':
                    sendEmail(temp_data, `${leader_phone}@${carrier_url}`, res, 'd-4e37b4301b7142e0a29782184b228709');
                    break;
                case 'email&text':
                    const church_id = result[0].church_id;
                    const error_msg = `life group join sending to leader error. leader email failed to send! user info:${JSON.stringify(temp_data)}`;
                    sendEmailMultiple(
                        temp_data,
                        [`${leader_phone}@${carrier_url}`,leader_email],
                        res,
                        'd-4e37b4301b7142e0a29782184b228709',
                        {church_id:church_id, error_msg:error_msg}
                    );
                    break;
                default:
                    res.json({
                        error:true,
                        msg:'Sorry Life Group Cannot Be Found'
                    });
                    break;
            }
        } else {
            res.json({
                error:true,
                msg:'There Was An Error Try Again'
            });
        }
    });
})

app.post('/register', (req, res) => {
    const fullName = req.body.fullName;
    const email    = req.body.email;
    const password = req.body.password;

    db.query("SELECT email FROM users WHERE email = ?",
    [email],
    (err, result) => {
        if (err) {
            console.log(err);
            res.json({
                error:true,
                msg:err
            });
        } else if (result.length === 0) {
            bcrypt.genSalt(10, function(err, salt) {
                if (err) {
                    console.log(err);
                    res.json({
                        error:true,
                        msg:err
                    });
                } else {
                    bcrypt.hash(password, salt, function(err, hash) {
                        if (err) {
                            console.log(err);
                            res.json({
                                error:true,
                                msg:err
                            });
                        } else {
                            db.query("INSERT INTO users (name, email, password) VALUES (?,?,?)",
                                [fullName,email,hash],
                                (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.json({
                                            error:true,
                                            msg:err,
                                        });
                                    } else {
                                        req.session.key        = email;
                                        req.session.userID     = result.insertId;
                                        req.session.isLoggedIn = false;
                                        console.log(req.session);
                                        res.json({
                                            error:false,
                                            msg:'success adding user'
                                        });
                                    }
                                }
                            );
                        }
                    });
                }
            });
        } else {
            res.json({
                error:true,
                msg:'email already in use'
            });
        }
    });
})

app.post('/sendValidate', (req, res) => {
    console.log(req.session)
    if (req.session.userID) {
        db.query("SELECT name, valid_email FROM users WHERE ID = ?",
        [req.session.userID],
        (err, result) => {
            if (err) {
                res.json({
                    error: true,
                    msg: err
                });
                console.log(err);
            } else if (result.length !== 0) {
                if (result[0].valid_email !== 1) {
                    const encodedID = Buffer.from(String(req.session.userID)).toString('base64');
                    const temp_data = {
                        "name": result[0].name,
                        "userID": encodedID,
                        "hostURL": process.env.DEV_URL,
                    };
                    sendEmail(temp_data, req.session.key, res, 'd-b513575420a744fd9a66d0499146bfcd');
                } else if (result[0].valid_email === 1) {
                    res.json({
                        error:true,
                        msg: 'email is already verified'
                    });
                }
            }
        });
    } else if (req.body.email) {
        db.query("SELECT ID, valid_email, name FROM users WHERE email = ?",
        [req.body.email],
        (err, result) => {
            if (err) {
                console.log(err);
                res.json({
                    error:true,
                    msg:err
                });
            } else if (result.length !== 0) {
                console.log(result);
                if (result[0].valid_email !== 1) {
                    const encodedID = Buffer.from(String(result[0].ID)).toString('base64');
                    const temp_data = {
                        "name": result[0].name,
                        "userID": encodedID,
                        "hostURL": process.env.DEV_URL,
                    };
                    sendEmail(temp_data, req.body.email, res, 'd-b513575420a744fd9a66d0499146bfcd');
                } else if (result[0].valid_email === 1) {
                    res.json({
                        error:true,
                        msg: 'email is already verified'
                    });
                }
            } else {
                res.json({
                    error:true,
                    msg: 'Sign Up First <a href="/login">Sign Up Here<a/>'
                });
            }
        });
    } else {
        res.json({
            error:true,
            msg: 'invalid email'
        })
    }
})

app.post('/resetPass', (req, res) => {
    const email = req.body.email;
    const pass  = req.body.pass ? req.body.pass : null;
    if (email) {
        db.query("SELECT ID FROM users WHERE email = ? AND valid_email = 1",
        [email],
        (err, result) => {
            if (err) {
                console.log(err);
                res.json({
                    error:true,
                    msg:err
                });
            } else if (result.length !== 0) {
                const encodedID = Buffer.from(String(result[0].ID)).toString('base64');
                const verifyStr = uuidv4();
                db.query(`UPDATE users SET reset_pass_str = '${verifyStr}' WHERE ID = ?`,
                [result[0].ID],
                (err, result) => {
                    if (err) {
                        console.log(err);
                        res.json({
                            error:true,
                            msg:err
                        });
                    } else {
                        const temp_data = {
                            "verifiedStr": verifyStr,
                            "userID": encodedID,
                            "hostURL": process.env.DEV_URL,
                        };
                        sendEmail(temp_data, email, res, 'd-7c3b2ab7d00f475e8e353da65c286f25');
                    }
                });
            } else {
                res.json({
                    error:true,
                    msg: 'Sign Up First Or Verify Email <a href="/login">Sign Up Here<a/>'
                });
            }
        });
    } else if (pass) {
        const userID   = req.body.userID ? req.body.userID : 0;
        const verified = req.body.verified ? req.body.verified : '';
        db.query("SELECT reset_pass_str FROM users WHERE ID = ?",
        [userID],
        (err, result) => {
            if (err) {
                console.log(err);
                res.json({
                    error:true,
                    msg:err
                });
            } else if (result.length !== 0) {
                if (result[0].reset_pass_str === verified) {
                    bcrypt.genSalt(10, function(err, salt) {
                        if (err) {
                            console.log(err);
                            res.json({
                                error:true,
                                msg:err
                            });
                        } else {
                            bcrypt.hash(pass, salt, function(err, hash) {
                                if (err) {
                                    console.log(err);
                                    res.json({
                                        error:true,
                                        msg:err
                                    });
                                } else {
                                    db.query(`UPDATE users SET password = ?, reset_pass_str = NULL WHERE ID = ${userID}`,
                                        [hash],
                                        (err, result) => {
                                            if (err) {
                                                console.log(err);
                                                res.json({
                                                    error:true,
                                                    msg:err,
                                                });
                                            } else {
                                                res.json({
                                                    error:false,
                                                    msg:'success changing password'
                                                });
                                            }
                                        }
                                    );
                                }
                            });
                        }
                    });
                } else {
                    res.json({
                        error: true,
                        msg: 'Not Verified'
                    })
                }
            } else {
                res.json({
                    error: true,
                    msg: 'Not Verified'
                })
            }
        });
    } else {
        res.json({
            error: true,
            msg: 'No Email Provided'
        })
    }
})

app.post('/validateEmail', (req, res) => {
    if (req.body.userID) {
        db.query("SELECT valid_email FROM users WHERE ID = ?",
        [parseInt(req.body.userID)],
        (err, result) => {
            console.log(result[0].valid_email);
            if (err) {
                res.json({
                    error: true,
                    msg: err
                });
            } else if (result[0].valid_email !== 1) {
                db.query("UPDATE users SET valid_email = 1 WHERE ID = ?",
                [parseInt(req.body.userID)],
                (err, result) => {
                    if (err) {
                        res.json({
                            error: true,
                            msg: err
                        });
                    } else {
                        res.json({
                            error: false,
                            msg: 'email verified'
                        })
                    }
                });
            } else if (result[0].valid_email === 1) {
                res.json({
                    error: false,
                    msg: 'email verified'
                })
            } else {
                res.json({
                    error: true,
                    msg: 'email verifing failed'
                })
            }
        });
    } else {
        res.json({
            error: true,
            msg: 'email verifing failed'
        })
    }
})

app.post('/login', (req, res) => {
    const email    = req.body.email;
    const password = req.body.password;

    db.query("SELECT ID, password, email, valid_email FROM users WHERE email = ?",
    [email],
    (err, result) => {
        // console.log(result[0].password);
        if (err) {
            res.json({
                error:true,
                msg:err
            });
        } else if (result.length === 0) {
            res.json({
                error:true,
                msg:'wrong password or email',
            });
        } else if (result[0].email && result[0].valid_email === 1) {
            bcrypt.compare(password, result[0].password, async function(err, isPasswordMatch) {
                if (err) {
                    console.log(err);
                    res.json({
                        error:true,
                        msg:err,
                    });
                } else if (isPasswordMatch) {
                    req.session.key        = email;
                    req.session.isLoggedIn = true;
                    req.session.userID     = result[0].ID;
                    console.log(req.session);
                    res.json({
                        error: false,
                        msg: 'success'
                    });
                } else {
                    res.json({
                        error:true,
                        msg:'wrong password or email',
                    });
                }
            });
        } else if (result[0].valid_email !== 1) {
            res.json({
                error:true,
                msg:'please verify your email. This is required before logging in. <a href="/sendVerify">click here to send another verify email</a>',
            });
        } else {
            res.json({
                error:true,
                msg:'wrong password or email',
            });
        }
    });
})

app.listen(3001, () => console.log('Listening on port 3001'));