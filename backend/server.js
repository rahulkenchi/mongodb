const PORT = 7799
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const nodemailer = require("nodemailer");
const path = require('path')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const jwtSecret = "randomtext"
const db = "mongodb://localhost:27017/taskpdf"
const userSchema = require('./db/userDatabase')
const invoiceSchema = require('./db/invoiceDatabase')
const mail = require('./pass.json')
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static("../frontend/public/images/"))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../frontend/public/images/')
    },
    filename: (req, file, cb) => {
        const filename = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
        cb(null, filename)
    }
})
var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            req.fileValidationError = "Forbidden extension"
            cb(null, false, req.fileValidationError);
        }
    }
});
var uploadpdf = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "application/pdf") {
            cb(null, true);
        } else {
            req.fileValidationError = "Forbidden extension"
            cb(null, false, req.fileValidationError);
        }
    }
});

const connectDB = async () => {
    try {
        await mongoose.connect(db, { useNewUrlParser: true })
        console.log("Mongodb connected")
    }
    catch (err) {
        console.error(err.message)
    }
}
connectDB();

app.post('/api/image/:email', upload.single('file'), async (req, res) => {
    let imagePath = '/images/' + req.file.filename;
    let up = await userSchema.findOneAndUpdate({ email: req.params.email }, { companyLogo: imagePath })
    //, cname: req.body.cname, address: req.body.cadd })
    up.save();
})

app.post("/signup", (req, res) => {
    let body = req.body
    const databaseSave = () => {
        let tmp = new userSchema({
            name: body.name,
            lastName: body.lastName,
            userName: body.userName,
            email: body.email,
            password: body.password
        })
        tmp.save((err) => {
            if (err) { res.send({ err: 1, msg: "Error creating new user" }) }
            else { res.send({ err: 0 }) }
        })
    }
    userSchema.findOne({ $or: [{ email: body.email }, { userName: body.userName }] }, (err, data) => {
        if (err) throw err;
        else if (data === null) {
            databaseSave();
        }
        else {
            let emailmsg = ""
            let userNamemsg = ""
            if (data.email === body.email)
                emailmsg = "Email Already registered please login to continue."
            if (data.userName === body.userName)
                userNamemsg = "Username exists"
            res.send({ err: 1, msg: { email: emailmsg, userName: userNamemsg } })
        }
    })

})

app.post("/login", (req, res) => {
    let body = req.body
    userSchema.findOne({ $or: [{ email: body.email }, { userName: body.email }] }, (err, data) => {
        if (err) throw err;
        else if (data == null) {
            res.send({ err: 1, msg: { email: "User does not exist please signup first.", password: '' } })
        }
        else if (data != null) {
            if (data.password == body.password) {
                let payload = {
                    name: data.name,
                    lastName: data.lastName,
                    userName: data.userName,
                    email: data.email,
                    companyLogo: data.companyLogo
                }
                const token = jwt.sign(payload, jwtSecret, { expiresIn: 3600000 })
                res.json({ err: 0, msg: "Login Successfully", token: token })
            }
            else {
                res.send({ err: 1, msg: { email: "", password: "Password incorrect." } })
            }
        }
    })
})

app.post("/dashboard", authenticateToken, (req, res) => {
    let body = req.body
    invoiceSchema.find({ email: body.email }, (err, data) => {
        if (err) throw err;
        else if (data == null) {
            console.log("OK")
            res.send({ err: 1, msg: "DATA not found." })
        }
        else if (data != null) {
            console.log("OK")
            let paid = data.filter((ele) => ele.status === 'PAID')
            let unpaid = data.filter((ele) => ele.status === 'UNPAID')
            let total = data.length
            res.send({ total: total, unpaid: unpaid.length, paid: paid.length })
        }
    })
})

app.post("/api/mail/:email", uploadpdf.single('file'), (req, res) => {
    if (req.fileValidationError) {
        res.send({ error: 'type invalid' })
    }
    else {
        console.log(req.file.destination);
        let pdfpath = req.file.destination + req.file.filename;
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',   //use gmail then works
            port: 465,
            auth: {
                user: mail.user,
                pass: mail.pass
            }
        });
        var mailOption = {
            from: "rahulskenchi0@gmail.com",
            //to: req.params.email,
            to: "rahulskenchi0@gmail.com",
            subject: 'attachment',
            html: `<b>welcome</b>`,
            attachments: [
                { path: pdfpath }
            ]
        };
        setTimeout(() => {
            transporter.sendMail(mailOption)
        }, 2000);
    }
})

app.post("/settings", authenticateToken, (req, res) => {
    let body = req.body
    userSchema.find({ email: body.email }, (err, data) => {
        if (err) throw err;
        else if (data == null) {
            res.send([])
        }
        else if (data != null) {
            res.send({ total: total, unpaid: unpaid, paid: paid })
        }
    })
})

app.post("/invoice", authenticateToken, (req, res) => {
    let body = req.body.body
    // console.log(body)
    let tmp = new invoiceSchema({
        sender: body.sender,
        receiver: body.receiver,
        receiverAddress: body.receiverAddress,
        invoiceDate: body.invoiceDate,
        dueDate: body.dueDate,
        products: body.products,
        amount: body.amount,
        status: body.status
    })
    tmp.save((err) => {
        if (err) { res.send({ err: 1, msg: "Error creating new user" }) }
        else { res.send({ err: 0 }) }
    })
})

app.post("/invoice2", authenticateToken, (req, res) => {
    let last = ''
    invoiceSchema.findOne({ sender: "vipul@gmail.com" }).sort({ _id: -1 }).limit(1).exec((err, data) => {
        if (err) throw err;
        else if (data == null)
            last = 0
        else if (data != null) {
            last = data.invoiceNumber
        }
    });

    userSchema.findOne({ email: req.body.email }, (err, data) => {
        if (err) throw err;
        else if (data == null)
            res.send({ err: 1, msg: "data not found." })
        else if (data != null) {
            let tmp = {
                "email": data.email,
                "name": data.name,
                "lastName": data.lastName,
                "companyName": data.companyName,
                "companyAddress": data.companyAddress,
                "companyLogo": data.companyLogo,
                "invoiceNumber": Number(last) + 1
            }
            res.send(tmp)
        }
    })
})

app.post("/invoice3", authenticateToken, (req, res) => {
    let body = req.body.email
    let status = req.body.status
    if (status == 'total') {
        invoiceSchema.find({ sender: body }, (err, data) => {
            if (err) throw err;
            else if (data == null)
                res.send({ err: 1, msg: "data not found." })
            else if (data != null) {
                res.send(data)
            }
        })
    }
    else if (status == 'PAID' || status == 'UNPAID') {
        invoiceSchema.find({ sender: body, status: status }, (err, data) => {
            if (err) throw err;
            else if (data == null)
                res.send({ err: 1, msg: "data not found." })
            else if (data != null) {
                res.send(data)
            }
        })
    }
})

app.post("/update", authenticateToken, (req, res) => {
    let body = req.body
    res.end()
})

app.post("/file", (req, res) => {
    res.end()
})

function mailer() {
    const nodemailer = require("nodemailer");
    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
        console.log("IN Checkmail")
        const order = []
        let total = 0
        let orderList = ''
        order.map((val, i) => {
            orderList += `<tr key=${i}>
                <td>${val.name}</td>
                <td>${val.quantity}</td>
                <td>$ ${val.price}</td>
                <td>${val.price * val.quantity}</td>
            </tr>`
            total += val.price * val.quantity
        }
        )
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        // let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',   //use gmail then works
            port: 465,
            auth: {
                user: mail.user,
                pass: mail.pass
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '<rahulskenchi0@gmail.com>', // sender address
            to: "rahulskenchi0@gmail.com", // list of receivers
            subject: "Hello ", // Subject line
            // plain text body
            html: body.toString() + orderList + `</tbody></table><h2 style="text-align:right">$ ${total}</h2></</body></html>`,
            attachments: [
                {
                    filename: 'mailtrap.gif',
                    path: "https://media1.giphy.com/media/vXufyZ1LxgV6iQ4jfO/giphy.gif"
                }
            ]
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
    main().catch(console.error);
}

app.listen(PORT, (err) => {
    if (err) throw err;
    else console.log(`Workin on PORT ${PORT}`)
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    //console.log(toekn)
    if (token == null) {
        res.json({ err: 1, msg: "Token not found" })
    }
    else {
        jwt.verify(token, jwtSecret, (err, data) => {
            if (err) {
                res.json({ err: 1, msg: "Token invalid" })
            }
            else {
                console.log("Match")
                next()
            }
        })
    }
}