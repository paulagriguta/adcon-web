require('mongoose').connect('"mongodb+srv://paula:pw2020@pw2020-zxqyp.mongodb.net/proiect?retryWrites=true&w=majority"');

const faker = require('faker');
const Project = require('../models/project');

// empty the collection first
Project.remove({})
    .then(() => {
        const posts = [];
        for (let i = 0; i < 5; i++) {
            posts.push({
                title: faker.lorem.sentence(),
                body: faker.lorem.paragraph()
            });
        }
        return Post.create(posts);
    })
    .then(() => {
        process.exit();
    })
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
