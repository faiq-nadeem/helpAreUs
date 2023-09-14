const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");

const { getProjects, getProjectImage, createProject, updateProject, deleteProject } = require("../controllers/projects.js");
const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const multerMiddleware = require("../middlewares/storage/multerMiddleware.js");

const router = express.Router();

router.get("/", getProjects);
router.post("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), createProject);
router.put("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), updateProject);
router.delete("/", jwtAuthentication, userAuthorization(["admin"]), deleteProject);

router.get("/image", getProjectImage);

module.exports = router;
