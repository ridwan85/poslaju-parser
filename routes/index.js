var express = require("express");
var router = express.Router();
var xlsxParser = require("xls-parser");
const multer = require("multer");
var sql = require("../db.js");

// SET STORAGE
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

var upload = multer({ storage: storage });

/* GET home page. */
router.get("/", function(req, res, next) {
  // console.log(req);
  // xlsxParser.onFileSelection(req.file).then(data => {
  //   var parsedData = data;
  // });
  res.render("index", { title: "POSLAJU PARSER" });
});

router.post("/upload", upload.single("myFile"), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  // res.send(file);
  node_xj = require("xls-to-json");
  node_xj(
    {
      input: file.path, // input xls
      output: "output.json" // output json
      // sheet: "sheetname", // specific sheetname
      // rowsToSkip: 5 // number of rows to skip at the top of the sheet; defaults to 0
    },
    function(err, result) {
      if (err) {
        console.error(err);
      } else {
        async function returnExcel() {
          var poslaju = [];
          var u = 0;
          const alasql = require("alasql");
          var date = new Date();

          for (var i of result) {
            u++;
            var address = i["MAILING ADDRESS"].split(",");
            if (address[3]) {
              address[3].replace(/[0-9]/g, "");
            }
            var poscode = parseInt(
              i["POSTCODE/ZIPCODE"].replace(/[^0-9\.]/g, ""),
              10
            );
            var cityAndState = JSON.parse(await getCity(poscode));
            var city;

            if (cityAndState.length > 0) {
              city = cityAndState[0].city;
            }
            // console.log(u);
            poslaju.push({
              NO: u,
              "Parcel Content": "Fashion & Apparel - Sports",
              "Content Description":
                i["TICKET VARIANT"] + " " + i["T-SHIRT SIZE"] || "",
              "Value of goods(RM)": 1,
              "Weight(Kg)*": "0.5",
              "Send Method*": "drop off",
              "Send Date*": "2019-12-30",
              "Sender Name": "Oh My Run Asia",
              "Sender Company": "",
              "Sender Phone*": "0173112801",
              "Sender Email*": "support@ohmyrun.com",
              "Sender Address Line 1*": "F111",
              "Sender Address Line 2*": "Apartment Saujana",
              "Sender Address Line 3": "Jalan PJU 10/1c",
              "Sender Address Line 4": "Damansara Damai",
              "Sender Postcode*": "47820",
              "Sender City": "Petaling Jaya",
              "Sender State": "Selangor",
              "Receiver Name": i["FULL NAME"],
              "Receiver Company": "",
              "Receiver Contact*": i["MOBILE NUMBER"],
              "Receiver Email": i["E-MAIL ADDRESS"],
              "Receiver Address Line 1*": address[0] || "",
              "Receiver Address Line 2": address[1] || "",
              "Receiver Address Line 3": address[2] || "",
              "Receiver Address Line 4": address[3] || "",
              "Receiver Postcode*": poscode,
              "Receiver City": city || "",
              "Receiver State": address[4] || ""
            });
            var d = result.length - 1;
            if (u === d) {
              console.log(d);
              var json2xls = require("json2xls");
              // var xls = json2xls(poslaju);
              // res.send(xls);

              res.xls("data.xlsx", poslaju);
              // return res.json(poslaju);
              // return alasql(`SELECT * INTO XLSX("test411.xlsx",{headers:true})`, [
              //   poslaju
              // ]);
            }
          }
        }

        async function getCity(poscode) {
          // console.log(poscode);
          return new Promise((resolve, reject) => {
            sql.query(
              "Select city,state from poscode where postcode = ? ",
              poscode,
              function(err, res) {
                if (err) {
                  console.log("error: ", err);
                  // result(err, null);
                } else {
                  // result(null, res);
                  // console.log(res);
                  return resolve(JSON.stringify(res));
                }
              }
            );
          });
        }

        returnExcel();

        // console.log(result);

        // return res.json(result);
      }
    }
  );
});

module.exports = router;
