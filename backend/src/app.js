//express c'est le framework pour node.js. Node.js c'est le moteur qui permet de lire le js
//et d'obtenir des réactions sur l'ordinateur par exemple accéder
//à une base de données ou créer une API. mais sans express c'est hyper galère,
// express apporte un cadre de travail
// et des outils plus rapide pour obtenir finalement les même résultats
//ici on importe donc le framework

import express from "express";
import dotenv from "dotenv";
import apiRouter from "./routes/index.js";

//on instancie express pour pouvoir utiliser ses outils
const app = express();

//permet de transformer en objet js un message qui est en json de base pour pouvoir le manipuler
//c'est indispensable parce que angular va envoyer que du json au serveur donc faut forcément un traducteur
//pour pouvoir manipuler les données d'angular qui envoit en json
// use veut dire pour toutes les requêtes qui passent
// par ici, applique cette règle
app.use(express.json());

app.use("/api", apiRouter);

//s'il y a une requête au guichet "/" on renvoit le message le serveur....
app.get("/", (req, res) => {
  res.json({
    message: "le serveur pour l'app de gestion de colocation est prêt",
  });
});

// On branche le chef de gare sur /api
app.use("/api", apiRouter);

const PORT = process.env.PORT || 4000;

//on ouvre la porte qui donne accès aux conversations avec le serveur
//requette/réponse
app.listen(PORT, () =>
  console.log("la conversation avec le Serveur peut commencer!"),
);
