import * as TachesService from "../services/taches.service.js";
import * as ProfilService from "../services/profil.service.js";

export const newTask = async (req, res) => {
  const taskName = req.body.taskName;
  const taskDescription = req.body.taskDescription;
  const frequency = req.body.frequency;
  const date = req.body.date;
  const userForTask = req.body.userForTask;
  const ancre = req.body.ancre;
  const groupId = req.query.groupId;

  //on reconvertit l'ancre en date parce que sinon
  //on pourra pas calculer les différentes dates
  const ancreDate = ancre ? new Date(ancre) : null;

  try {
    const finalNewTask = await TachesService.newTaskData(
      taskName,
      frequency,
      ancreDate,
      taskDescription,
      date,
      userForTask,
      groupId,
    );

    return res.status(200).json(finalNewTask);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getTasks = async (req, res) => {
  const groupId = req.query.groupId;

  try {
    const allTasks = await TachesService.getallTasks(groupId);

    return res.status(200).json(allTasks);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getDates = async (req, res) => {
  const groupId = req.query.groupId;
  try {
    const allDates = await TachesService.getAllLimitDateOfTask(groupId);

    return res.status(200).json(allDates);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateStatus = async (req, res) => {
  const status = req.body.status;
  const dateDone = req.body.date;
  const taskId = req.body.taskId;
  try {
    const updateTask = await TachesService.updateStatusTask(
      status,
      dateDone,
      taskId,
    );

    return res.status(200).json(updateTask);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
