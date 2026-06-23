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
