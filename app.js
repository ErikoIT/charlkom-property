
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const methodOverride = require("method-override");
const SqlString = require('sqlstring');
const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config({ path: process.cwd() + '/config/config.env' });
const multer = require('multer');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");



const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(session({
    key: "id",
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    // cookie: {
    //     expires: 60 * 60 * 24,
    // }
}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '_' + Date.now()
            + path.extname(file.originalname))
    }
})
var upload = multer({ storage: storage })

var pool = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "charlkomdb"
});



//Date
const date = Date.now();
const today = new Date(date);
const postDate = today.toDateString().split(' ').slice(1).join(' ');



app.get("/", function (req, res) {

    pool.query("SELECT * FROM properties", function (err, foundProperties) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", { allProperties: foundProperties });
        }
    });
});

app.get("/properties", function (req, res) {

    pool.query("SELECT * FROM properties", function (err, foundProperties) {
        if (err) {
            console.log(err);
        } else {
            res.render("property", { allProperties: foundProperties });
        }
    });

});

// Property Details
app.get("/property/:id", function (req, res) {
    const requestedId = req.params.id;

    pool.query(`SELECT * FROM properties WHERE id = '${requestedId}'`, function (err, foundProperties) {
        if (err) {
            console.log(err);
        } else {
            res.render("propertydetails", { foundProp: foundProperties });
        }

    });


});


app.get("/properties", function (req, res) {
    res.render("property");
});

app.get("/contact", function (req, res) {
    res.render("contact");
});

app.get("/about", function (req, res) {
    res.render("about");
});



app.get("/admin", function (req, res) {
    if (req.session.user) {
        pool.query(`SELECT * FROM properties`, function (err, foundProp) {
            if (err) {
                console.log(err);
            } else {
                res.render("admin", { foundProp: foundProp });
            }
        });
    } else {
        res.redirect("/login");
    }

});


app.get("/table", function (req, res) {

    pool.query(`SELECT * FROM properties`, function (err, foundProp) {
        if (err) {
            console.log(err);
        } else {
            res.render("admin", { foundProp: foundProp });
        }
    });

});

app.get("/admins", function (req, res) {
    res.render("input");
});



app.post('/admins', upload.single("image"), (req, res, next) => {
    const requestedId = req.params.id;


    const propertyId = Math.floor(Math.random() * 1000000) + 1;
    const estateName = req.body.estname;
    const address = req.body.address;
    const beds = req.body.beds;
    const kitchen = req.body.kitchen;
    const livingRoom = req.body.rooms;
    const parking = req.body.parking;
    const pools = req.body.pool;
    const mapURL = req.body.map;
    const units = req.body.units;
    const price = req.body.price;
    const shortDesc = req.body.shortDesc;
    const image = req.file.filename;
    const detailDesc = req.body.detailDesc;


    var sql = `INSERT INTO properties (id, estateName, address, beds,  kitchen, livingRoom, parking, pools, mapURL, units, price, shortDescription, img, detailDescription) VALUES ('${propertyId}', '${estateName}', '${address}', '${beds}', '${kitchen}', '${livingRoom}', '${parking}', '${pools}', '${mapURL}', '${units}', '${price}', '${shortDesc}', '${image}', '${detailDesc}')`;
    pool.query(sql, function (err, result) {
        if (err) {
            console.log(err);
        }
        console.log("1 record inserted");
        res.redirect('/admins');
    });

});

app.post("/delete", function (req, res) {
    const requestedId = req.body.propertyId;

    var sql = `DELETE FROM properties WHERE id = '${requestedId}'`;
    pool.query(sql, function (err, result) {
        if (err) {
            console.log(err);
        }
        console.log("Number of records deleted: " + result.affectedRows);
        res.redirect("/admin");
    });

});

app.get("/edit/:id", function (req, res, next) {
    const requestedId = req.params.id;

    pool.query(`SELECT * FROM properties WHERE id = '${requestedId}'`, function (err, foundProperties) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit", { toUpdate: foundProperties });
        }

    });


});

app.put("/edit/:id", function (req, res, next) {
    const requestedId = req.params.id;

    const estateName = req.body.estname;
    const address = req.body.address;
    const beds = req.body.beds;
    const kitchen = req.body.kitchen;
    const livingRoom = req.body.rooms;
    const parking = req.body.parking;
    const pools = req.body.pool;
    const mapURL = req.body.map;
    const units = req.body.units;
    const price = req.body.price;
    const shortDesc = req.body.shortDesc;
    const image = req.body.image;
    const detailDesc = req.body.detailDesc;

    var sql = `UPDATE properties 
    SET estateName = ${SqlString.escape(estateName)}, 
    address = ${SqlString.escape(address)},
    beds = ${SqlString.escape(beds)},
    kitchen = ${SqlString.escape(kitchen)},
    parking = ${SqlString.escape(parking)},
    livingRoom = ${SqlString.escape(livingRoom)},
    pools = ${SqlString.escape(pools)},
    mapURL = ${SqlString.escape(mapURL)},
    units = ${SqlString.escape(units)}, 
    price = ${SqlString.escape(price)},
    shortDescription = ${SqlString.escape(shortDesc)},
    img = ${image},
    detailDescription = ${SqlString.escape(detailDesc)} 
   
    WHERE id = "${requestedId}"`;
    pool.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
        res.redirect("/admin");
    });
});


//Blog
app.get("/blog", function (req, res) {

    pool.query(`SELECT * FROM blog`, function (err, foundPosts) {
        if (err) {
            console.log(err);
        } else {
            res.render("blog", { posts: foundPosts });
        }
    });
});

app.get("/blog/:id", function (req, res) {
    const requestedId = req.params.id;

    pool.query(`SELECT * FROM blog WHERE id = '${requestedId}'`, function (err, foundPosts) {
        if (err) {
            console.log(err);
        } else {
            res.render("blogdetail", { posts: foundPosts });
        }

    });
});

app.get("/post-blog", function (req, res) {
    res.render("post-blog");
});

app.post("/post-blog", function (req, res) {
    const title = req.body.title;
    console.log(title);
    const body = req.body.body;
    console.log(body);
    const image = req.file;
    var sql = `INSERT INTO blog (title, img, date, body) VALUES('${title}', '${image}', '${postDate}', '${body}')`;
        pool.query(sql, (err)=>{
        if (err) {
            console.log(err);
        } else {
            return res.render("post-blog",
                {
                    successMessage: "Blog added successfully"
                });
        }
    });
});

//Register
app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {

    const { username, email, password, confirmpassword } = req.body;


    pool.query(`SELECT email FROM users WHERE email = ?`, [email], async (err, result) => {
        if (err) {
            console.log(err);
        }
        if (result.length > 0) {
            return res.render("register",
                {
                    message: "The email is already registered"
                });
        } else if (password !== confirmpassword) {
            return res.render("register",
                {
                    message: "Password do not match"
                });
        }
        let hashedPassword = await bcrypt.hash(password, 10);
        pool.query(`INSERT INTO users SET ?`, { name: username, email: email, password: hashedPassword }, (err) => {
            if (err) {
                console.log(err);
            } else {
                return res.render("register",
                    {
                        successMessage: "User registered successfully"
                    });
            }
        });
    });
});

//Login
app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", function (req, res) {
    const { username, password } = req.body;
    pool.query("SELECT * FROM users WHERE email = ?;", [username], (err, result) => {
        if (err) {
            console.log(err);
        }
        if (result.length > 0) {
            bcrypt.compare(password, result[0].password, (err, response) => {
                if (response) {
                    req.session.user = result;
                    res.redirect("/admin");
                } else {
                    return res.render("login",
                        {
                            message: "Wrong username or password"
                        });
                }
            });
        } else {
            res.render("login",
                { message: "User doesn't exists" });
        }
    }
    );
});

//Logout
app.get("/logout", function (req, res) {
    res.clearCookie('user');
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Server Started");
});

