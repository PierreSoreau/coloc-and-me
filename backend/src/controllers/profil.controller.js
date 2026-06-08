import * as profilService from "../services/profil.service.js";

export const getProfilInitials = async (req, res) => {
  try {
    console.log("requete reçue");
    const tokenUser = req.headers.authorization;

    if (!tokenUser || !tokenUser.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ error: "Accès refusé token invalide ou manquant" });
    }

    const uuid = await profilService.getUUID(tokenUser);

    const name = await profilService.getNameById(uuid);

    console.log(name);

    return res.status(200).json(name);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getDataProfil = async (req, res) => {
  try {
    console.log("requette infos du profil reçue");

    const tokenUser = req.headers.authorization;

    if (!tokenUser || !tokenUser.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ error: "Accès refusé token invalide ou manquant" });
    }

    const uuid = await profilService.getUUID(tokenUser);

    const dataProfil = await profilService.getDataProfil(uuid);

    console.log("infos du profil transmises", dataProfil);
    return res.status(200).json(dataProfil);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const groupId = req.query.groupId;

    await profilService.deleteGroupData(groupId);
    console.log("groupe supprimé");
    return res.status(200).json({ message: "Groupe supprimé" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
