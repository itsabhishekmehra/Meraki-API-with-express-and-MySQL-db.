const axios = require("axios");
const courseUrl = "https://api.merakilearn.org/courses"

const express = require("express")
const app = express()

app.use(express.json())

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'Abhi@123',
        database: 'NG'
    }
});


// This Below code will make the table, if it(table) doesn't exists
knex.schema.hasTable('courses').then(function (exists) {
    if (!exists) {
        return knex.schema.createTable('courses', function (table) {
            table.increments('id').primary();
            table.string('name', 100).unique();
            table.string('logo', 100);
            table.string('notes', 100);
            table.string('days_to_complete', 100);
            table.text('short_description');
            table.string('type', 100);
            table.string('course_type', 100);
            table.string('lang_available', 100);
        }).then(() => {
            console.log('Courses Table Created Successfully.');
            axios.get("https://api.merakilearn.org/courses").then((Data) => {
                for (course of Data.data) {
                    course.lang_available = course.lang_available.join(", ")
                    knex('courses').insert(course).then((insertData) => {
                        console.log("data inserted: ", insertData);
                    }).catch((err) => {
                        console.log(err, "Error");
                    })
                }
            })
        }).catch((err) => {
            console.log("Error while creating table: ", err);
        })
    }
})


app.post("/addCourse", (req, res) => {
    const courseData = req.body;
    knex('courses').insert(courseData).then((Data) => {
        res.send({ 'status': 'success', 'data': courseData })
    }).catch((err) => {
        console.log(err, "Error");
        res.send({ 'Status': "error", 'Message': err.sqlMessage })
    })
})

app.get("/getCourse/:id", (req, res) => {
    knex('courses')
        .where({ id: parseInt(req.params.id) })
        .then((data) => {
            // console.log(data, "hello deleted data");
            if (data.length > 0) {
                // console.log("inside wala");
                res.send({ 'data': data, 'message': `${req.params.id} Data Got successfully!` })
            } else {
                // console.log("outsidewala");
                res.send({ 'message': `${req.params.id} user not found!`, 'errorCode': 404 })
            }
        }).catch((err) => {
            console.log(err, "Some Error Came.");
            res.send(err)
        })
})

app.get('/allcourses', (req, res) => {

    knex('courses').then((data) => {
        res.json(data)
    })
        .catch((err) => {
            console.log(err, "View ka data lane me error ara hai...");
        });
})


app.put('/updatecourse/:id', (req, res) => {
    const bodyData = req.body;
    knex('courses')
        .where({ id: req.params.id })
        .update({
            "name": req.body.name,
            "logo": req.body.logo,
            "notes": req.body.notes,
            "days_to_complete": req.body.days_to_complete,
            "short_description": req.body.short_description,
            "type": req.body.type,
            "course_type": req.body.course_type,
            "lang_available": req.body.lang_available
        }).then((updatedata) => {
            if (!updatedata) {
                console.log(updatedata, "id doesn't exists");
                res.send({ 'message': 'Invalid id' })
            } else {
                res.send("Data Updated")
            }
        }).catch((err) => {
            console.log(err, "Something went wrong");
        })
})


app.listen(3000, () => {
    console.log("Server is running at port 3000");
})