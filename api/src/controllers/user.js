
function addJob(req, res) {

    console.log(req.query);
    console.log(req.body);

    return res.send(req.query)
};

module.exports = {
    addJob 
}