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

    return res.status(200).json(finalNewTask[0]);
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

export const taskDelete = async (req, res) => {
  const taskId = req.query.taskId;
  const frequency = req.query.frequence ? req.query.frequence : null;

  try {
    const deleteTask = await TachesService.deleteTask(taskId, frequency);

    return res.status(200).json(deleteTask);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const allTasksDelete = async (req, res) => {
  const modelId = req.query.taskId;
  try {
    const deleteAllTasks = await TachesService.deleteAllTask(modelId);

    return res.status(200).json(deleteAllTasks);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  const taskId = req.query.taskId;

  try {
    const Task = await TachesService.getTask(taskId);

    return res.status(200).json(Task);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateTaskDetail = async (req, res) => {
  const taskId = req.query.taskId;
  const comments = req.body.comments;
  const title = req.body.title;
  const date = req.body.date;
  const profilId = req.body.profilId;
  const frequence = req.body.frequence;

  try {
    const updateTasks = await TachesService.updateTask(
      taskId,
      comments,
      title,
      date,
      profilId,
      frequence,
    );
    return res.status(200).json(updateTasks);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteAfterCurrentDay = async (req, res) => {
  const modelTaskId = req.query.taskId;

  try {
    await TachesService.deleteTaskAfterCurrentDay(modelTaskId);
    return res.status(200).json({
      message:
        "Suppression des occurences du modèle après la date d'aujourd'hui effectuées",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const createAfterCurrentDay = async (req, res) => {
  const modelTaskId = req.body.taskId;

  try {
    const newTasks =
      await TachesService.createNewTasksAfterCurrentDay(modelTaskId);
    return res.status(200).json(newTasks);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
