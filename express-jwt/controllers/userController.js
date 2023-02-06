const data = {
    employees: require('../model/employees.json')
}

const getAllUsers = (req, res) => {
    res.json(data.employees);
}

module.exports = {
    getAllUsers,
}