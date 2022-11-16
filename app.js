require('dotenv/config');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const methodOverride = require("method-override");
const SqlString = require('sqlstring');
const mysql = require("mysql");

//testing

//Creating Database

var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "charlkomdb"
  });

  

// creating table properties
//   const con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "charlkomdb"
//   });

//   con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//     var sql = "CREATE TABLE properties (id INT, estateName VARCHAR(255), address VARCHAR(255), beds INT, kitchen INT, parking INT, livingRoom INT, pools INT, mapURL VARCHAR(4000), units INT, price VARCHAR(250), shortDescription VARCHAR(250), img BLOB, detailDescription VARCHAR(8000), PRIMARY KEY (id))";
//     con.query(sql, function (err, result) {
//       if (err) throw err;
//       console.log("Table created");
//     });
//   });

// const pool = createPool({
//     host: "localhost",
//     user: "root",
//     password: "",
//     connectionLimit: 10
// });

// pool.query("SELECT * FROM charlkomDB.properties", (err, result)=>{
//     console.log(result);
// });





const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

//! Use of Multer
const storage = multer.memoryStorage({
    destination: (req, file, callBack) => {
        callBack(null, path.join(__dirname, '/uploads/'))  
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
const upload = multer({
    storage: storage
});



//Date
const date = Date.now();
const today = new Date(date);
const postDate = today.toDateString().split(' ').slice(1).join(' ');



// Image uploads
// var con = mysql.createConnection({
//     host: "localhost",
//     user: "charlkom_charlkom",
//     password: "Property1234$",
//     database: "charlkom_charlkomdb"
// });

// Home Route

app.get("/", function (req, res) {
    pool.getConnection(function (err) {
        if (err) throw err;
        pool.query("SELECT * FROM properties", function (err, foundProperties) {
            if (err) {
                console.log(err);
            } else {
                res.render("index", { allProperties: foundProperties });
            }
        });
    });
});

app.get("/properties", function (req, res) {
    pool.getConnection(function (err) {
        if (err) throw err;
        pool.query("SELECT * FROM properties", function (err, foundProperties) {
            if (err) {
                console.log(err);
            } else {
                res.render("property", { allProperties: foundProperties });;
            }
        });
    });
});

// Property Details
app.get("/property/:id", function (req, res) {
    const requestedId = req.params.id;
    pool.getConnection(function (err) {
        pool.query(`SELECT * FROM properties WHERE id = '${requestedId}'`, function (err, foundProperties) {
            if (err) {
                console.log(err);
            } else {
                res.render("propertydetails", { foundProp: foundProperties });
            }

        });
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
    pool.getConnection(function (err) {
        pool.query(`SELECT * FROM properties`, function (err, foundProp) {
            if (err) {
                console.log(err);
            } else {
                res.render("admin", { foundProp: foundProp });
            }

        });
    });
});


app.get("/table", function (req, res) {
    pool.getConnection(function (err) {
        pool.query(`SELECT * FROM properties`, function (err, foundProp) {
            if (err) {
                console.log(err);
            } else {
                res.render("admin", {foundProp: foundProp });
            }
        });
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
    console.log(image)

    pool.getConnection(function (err) {

        var sql = `INSERT INTO properties (id, estateName, address, beds,  kitchen, livingRoom, parking, pools, mapURL, units, price, shortDescription, img, detailDescription) VALUES ('${propertyId}', '${estateName}', '${address}', '${beds}', '${kitchen}', '${livingRoom}', '${parking}', '${pools}', '${mapURL}', '${units}', '${price}', '${shortDesc}', '${image}', '${detailDesc}')`;
        pool.query(sql, function (err, result) {
            if (err) {
                console.log(err);
            }
            console.log("1 record inserted");
            res.redirect('/admins');
        });
    });
});

app.post("/delete", function (req, res) {
    const requestedId = req.body.propertyId;
    pool.getConnection(function (err) {
        var sql = `DELETE FROM properties WHERE id = '${requestedId}'`;
        pool.query(sql, function (err, result) {
            if (err) {
                console.log(err);
            }
            console.log("Number of records deleted: " + result.affectedRows);
            res.redirect("/admin");
        });
    });
    // const deletedId = req.body.propertyId;
    // Property.findByIdAndRemove(deletedId, function (err) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log("Deleted Successfully");
    //         res.redirect("/admin");
    //     }
    // });
});

app.get("/edit/:id", function (req, res, next) {
    const requestedId = req.params.id;
    pool.getConnection(function (err) {
        pool.query(`SELECT * FROM properties WHERE id = '${requestedId}'`, function (err, foundProperties) {
            if (err) {
                console.log(err);
            } else {
                res.render("edit", { toUpdate: foundProperties });
            }

        });

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
            res.render("blog", {posts: foundPosts });
        }
    });
});
    
app.get("/blog/:id", function (req, res) {
    const requestedId = req.params.id;
    pool.getConnection(function (err) {
        pool.query(`SELECT * FROM blog WHERE id = '${requestedId}'`, function (err, foundPosts) {
            if (err) {
                console.log(err);
            } else {
                res.render("blogdetail", { posts: foundPosts });
            }

        });

    });
});

//Register
app.get("/register", function (req, res) {
    res.render("register");
});

// app.post("/register", function (req, res) {
//     if (req.body.password === req.body.confirmpass) {
//         User.register({username: req.body.email}, req.body.password, function(err, user){
//             if (err) {
//               console.log(err);
//             //   res.redirect("/register");
//             } else {
//               passport.authenticate("local")(req, res, function(){
//                 res.redirect("/admin");
//               });
//             }
//           });
//     }else{
//         console.log("Password does not match");
//         res.redirect("/register");
//     }
// });

//Login
app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", function (req, res) {
    const username = req.body.email
    const password = req.body.password

    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function (err, result) {
                    if (result === true) {
                        res.redirect("/admin");
                    }
                });
            }
        }
    });
});

//Logout
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.listen(port = process.env.PORT || 3000, function () {
    console.log("Server Started");
});