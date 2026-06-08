import * as groupService from "../services/group.service.js";
import * as profilService from "../services/profil.service.js";
import * as authService from "../services/auth.service.js";

export const createGroup = async (req, res) => {
  try {
    const participants = req.body.participantsList;
    const groupName = req.body.groupName;
    const token = req.headers.authorization;

    const uuid = await profilService.getUUID(token);

    const namecreator = await profilService.getDataProfil(uuid);

    //création du groupe et récupération de l'id du groupe
    const groupId = await groupService.newGroup(groupName);

    //On ajoute d'abord le participant qui a créé le groupe
    await groupService.newParticipant(namecreator.firstname, groupId, token);

    // On ajoute ensuite les autres participants
    // On utilise for...of car c'est la seule boucle qui respecte le 'await'
    for (const participantName of participants) {
      // On passe 'null' pour l'ID car ils n'ont pas encore l'id réel
      // qui est leur id obtenu à leur inscription !
      await groupService.newParticipant(participantName, groupId, null);
    }

    return res.status(201).json({
      message: "Groupe et participants ajoutés avec succès",
      groupId: groupId,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getGroupId = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Accès refusé : Aucun token fourni." });
    }
    const groupData = await groupService.getGroup(token);

    return res.status(200).json(groupData);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getGroupName = async (req, res) => {
  try {
    const groupId = req.query.groupId;
    const groupName = await groupService.getGroupName(groupId);

    return res.status(200).json(groupName);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getMemberName = async (req, res) => {
  try {
    const groupId = req.query.groupId;
    const membersName = await groupService.getNameMember(groupId);
    return res.status(200).json({ memberList: membersName });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const recordMemberId = async (req, res) => {
  try {
    const groupId = req.query.groupId;
    const nickname = req.body.nickname;
    const token = req.headers.authorization;

    await groupService.recordMemberId(groupId, nickname, token);
    return res
      .status(200)
      .json({ message: "table membership mise à jour avec userid" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
