
const errorHandler = (err, req, res, next) => {
    res.status(err.status).send("An error occurred: " + err.message);
}