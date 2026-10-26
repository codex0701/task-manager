const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 9000;
const TASKS_DIR = path.join(__dirname, "files");

// make sure the "files" folder exists
fs.mkdirSync(TASKS_DIR, { recursive: true });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); // parses form data into req.body
app.use(express.json());

// Home: list all tasks as cards (fs.readdir)
app.get("/", (req, res) => {
  fs.readdir(TASKS_DIR, (err, files) => {
    if (err) return res.status(500).send("Could not read tasks");
    const tasks = files.filter((f) => f.endsWith(".txt"));
    res.render("index", { tasks });
  });
});

// Create a task (fs.writeFile)
app.post("/create", (req, res) => {
  const { title = "", details = "" } = req.body;

  // keep filename safe (no slashes / special chars)
  const safeTitle = title
    .trim()
    .replace(/[^a-zA-Z0-9 _-]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  if (!safeTitle) return res.redirect("/");

  fs.writeFile(path.join(TASKS_DIR, `${safeTitle}.txt`), details, (err) => {
    if (err) return res.status(500).send("Could not save task");
    res.redirect("/");
  });
});

// Read one task (fs.readFile + req.params)
app.get("/file/:filename", (req, res) => {
  const filename = path.basename(req.params.filename); // blocks ../ tricks
  fs.readFile(path.join(TASKS_DIR, filename), "utf-8", (err, content) => {
    if (err) return res.status(404).send("Task not found");
    res.render("show", { filename, content });
  });
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
