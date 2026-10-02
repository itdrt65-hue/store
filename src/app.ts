import "dotenv/config";
import path from "node:path";
import express, { Request, Response } from "express";
import session from "express-session";
import { indexRouter } from "./routes/index";
import { adminRouter } from "./routes/admin";

const app = express();
const PORT = Number(process.env.PORT ?? 9000);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.set("trust proxy", 1);

const isDev = process.env.NODE_ENV !== "production";

if (isDev) {
  // Dev live reload: the page polls for this process's boot id; tsx watch
  // restarts the server on any src/views/public change, so a new id means reload.
  const bootId = String(Date.now());
  app.get("/__livereload", (req: Request, res: Response) => {
    res.set("Cache-Control", "no-store").type("text/plain").send(bootId);
  });

  const snippet = `<script>(function(){var id=null;function tick(){fetch("/__livereload",{cache:"no-store"}).then(function(r){return r.text()}).then(function(t){if(id&&t!==id)location.reload();id=t;}).catch(function(){}).finally(function(){setTimeout(tick,500)})}tick();})();</script>`;
  app.use((req, res, next) => {
    const send = res.send.bind(res);
    res.send = (body?: unknown) => {
      if (typeof body === "string" && body.includes("</body>")) {
        body = body.replace("</body>", snippet + "</body>");
      }
      return send(body as never);
    };
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
      secure: process.env.NODE_ENV === "production",
    },
  }),
);

app.use("/", indexRouter);
app.use("/admin", adminRouter);

app.use((req: Request, res: Response) => {
  res.status(404).render("404", { title: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
