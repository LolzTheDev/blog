const express = require("express")
const marked = require("marked")
const ejs = require("ejs")
const fs = require("fs")
const morgan = require("morgan")
const matter = require("gray-matter")
const cookieParser = require("cookie-parser")
const _ = require("underscore")

const app = express()
app.set("view engine", "ejs")

app.use(
    morgan("[:status] :method \":url\" - :response-time ms")
)

app.use("/static", express.static("./public"))
app.use(cookieParser())

ejs.delimiter = "%"

let posts = []
posts = fs.readdirSync("./posts/")
posts.forEach((post, i) => {
    posts[i] = posts[i].charAt(0).toUpperCase()
    + posts[i].slice(1).replace(".md", "")
})

app.get("/", async (req, res) => {
    res.redirect("/posts/home")
})

app.get("/posts/:post", async (req, res) => {
    const themeID = req.cookies.theme || null
    const themes = await fs.promises.readFile(`./themes.json`, "utf-8")

    console.log(_.where(themes, { name: themeID }))
    console.log(themes)

    const path = req.params.post
    const data = await fs.promises.readFile(`./posts/${path.toLowerCase()}.md`, "utf-8")
    const post = matter.read(`./posts/${path.toLowerCase()}.md`)

    res.render(
        "post.ejs", {
            title: post.data.title , 
            post: marked.parse(post.content) , 
            description: post.data.description ,
            posts: posts ,
            theme: _.where(themes, { name: themeID })
        }
    )
})

app.get("/api", (req, res) => {
    res.json({
        version: "v1",
        endpoint: "/api/"
    })
})

app.get("/api/posts/:post", async (req, res) => {
    const post = req.params.post
    const postFile = fs.readFileSync(`./posts/${post}`)

    res.json({
        content: "Testing content",
        meta: {
            title: "Title",
            description: "Description!",
            created: null
        }
    })
})

app.listen(8080, () => {
    console.info("* Listening on port 8080")
})