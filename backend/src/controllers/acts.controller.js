import * as actsService from "../services/acts.service.js";

export const newAct = async (req, res) => {
  const groupId = req.query.groupId;
  const date = req.body.date;
  const location = req.body.location;
  const typeLocation = req.body.typeLocation;
  const description = req.body.description;
  const title = req.body.title;
  const profilId = req.headers["authorization"];

  try {
    const newAct = await actsService.insertNewAct(
      profilId,
      title,
      description,
      typeLocation,
      location,
      date,
      groupId,
    );
    return res.status(200).json(newAct);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAllActs = async (req, res) => {
  const groupId = req.query.groupId;

  try {
    const allDetailActs = await actsService.allActs(groupId);
    return res.status(200).json(allDetailActs);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateStatus = async (req, res) => {
  const token = req.headers.authorization;
  const ParticipationStatus = req.body.participationStatus;
  const AuthorisationStatus = req.body.authorisationStatus;
  const actId = req.body.actId;

  try {
    const updateData = await actsService.updatStatusOfUser(
      token,
      ParticipationStatus,
      AuthorisationStatus,
      actId,
    );
    return res.status(200).json(updateData);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteAct = async (req, res) => {
  const actId = req.query.actId;

  try {
    const deletedAct = await actsService.deleteActColoc(actId);
    return res.status(200).json(deletedAct);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateAct = async (req, res) => {
  const actId = req.query.actId;
  const title = req.body.title;
  const description = req.body.description;
  const location = req.body.location;
  const typeLocation = req.body.typeLocation;
  const date = req.body.date;

  try {
    const updatedAct = await actsService.updateActColoc(
      actId,
      title,
      description,
      location,
      typeLocation,
      date,
    );
    return res.status(200).json(updatedAct);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getOneAct = async (req, res) => {
  const actId = req.query.actId;

  try {
    const Act = await actsService.getOneActColoc(actId);
    return res.status(200).json(Act);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
