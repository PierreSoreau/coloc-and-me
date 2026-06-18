import { supabase } from "../config/supabase.js";
import {
  getProfilNamesByGroup,
  randomProfilNamesTable,
} from "./profil.service.js";

import {
  addDays,
  addWeeks,
  addMonths,
  differenceInDays,
  getDaysInYear,
  format,
} from "date-fns";

//-------------------------------------------
//GESTION DE L'AFFICHAGE DES TACHES ACTUELLES
//-------------------------------------------

export const getallTasks = async (groupId) => {
  const { data: allTasks, error: errorTasks } = await supabase
    .from("model_task")
    .select(
      `title,frequency,comments,id,
      tasks (
      id,
      date_limite,
      profil_id,
      fait_le,
      status,
      retard,
      profils!profil_id(firstname)
    )`,
    )
    .eq("group_id", groupId);

  if (errorTasks) {
    throw new Error(`Erreur de récupération des tâches: ${errorTasks.message}`);
  }

  let flatTasksTable = [];

  allTasks.forEach((model) => {
    model.tasks.forEach((taskOccurrence) => {
      flatTasksTable.push({
        title: model.title,
        description: model.comments,
        frequence: model.frequency,
        date: taskOccurrence.date_limite, // On renomme en 'date' pour Angular
        userTaskId: taskOccurrence.profil_id,
        firstname: taskOccurrence.profils?.firstname || "Non assigné",
        status: taskOccurrence.status,
        taskId: model.id,
        modelTaskId: taskOccurrence.id,
        fait_le: taskOccurrence.fait_le,
      });
    });
  });

  return flatTasksTable;
};

//Fonction pour récupérer directement les dates limites des taches
//pour afficher les valeurs des semaines
export const getAllLimitDateOfTask = async (groupId) => {
  const { data: allLimitDates, error: errorDates } = await supabase
    .from("tasks")
    .select("date_limite")
    .eq("group_id", groupId);

  if (errorDates) {
    throw new Error(
      `Erreur de récupération des dates limite des tâches: ${errorDates.message}`,
    );
  }
  const allDatesTable = allLimitDates.map((date) => date.date_limite);

  return allDatesTable;
};

//---------------------------
//GESTION D'UNE NOUVELLE TACHE
//----------------------------

export const profilIdOrder = async (groupId) => {
  const profilNamesTable = await getProfilNamesByGroup(groupId);
  //on modifie la position des noms dans le tableau
  //de façon aléatoire
  const newprofilNamesTable = await randomProfilNamesTable(profilNamesTable);
  return newprofilNamesTable;
};

export const newTaskData = async (
  title,
  frequency,
  ancre,
  comments,
  date_limite,
  userForTask,
  groupId,
) => {
  if (frequency === null) {
    const { data: taskDetails, error: errorTask } = await supabase
      .from("model_task")
      .insert([{ title: title, comments: comments, group_id: groupId }])
      .select()
      .single();

    if (errorTask) {
      throw new Error(
        `Erreur de l'insertion de la ligne de tache unique dans la table task model: ${errorTask.message}`,
      );
    }

    const { data: taskWhoAndWhen, error: errorWhoAndWhenTask } = await supabase
      .from("tasks")
      .insert([
        {
          profil_id: userForTask,
          date_limite: date_limite,
          status: false,
          model_task_id: taskDetails.id,
          group_id: groupId,
        },
      ])
      .select(`*,profils!profil_id(firstname)`);

    if (errorWhoAndWhenTask) {
      throw new Error(
        `Erreur de l'insertion de la ligne de tache unique dans la table tasks: ${errorWhoAndWhenTask.message}`,
      );
    }

    const finalTaskTable = taskWhoAndWhen.map((task) => ({
      title: taskDetails.title,
      description: taskDetails.comments,
      frequence: "",
      date: task.date_limite,
      userTaskId: task.profil_id,
      firstname: task.profils.firstname,
      status: task.status,
      taskId: task.model_task_id,
      modelTaskId: task.id,
      fait_le: task.fait_le,
    }));
    return finalTaskTable;
  }

  const profilNameTable = await profilIdOrder(groupId);

  const { data: taskDetails, error: errorTaskModel } = await supabase
    .from("model_task")
    .insert([
      {
        title: title,
        comments: comments,
        date_ancre: format(ancre, "yyyy-MM-dd"),
        profil_id_order: profilNameTable,
        frequency: frequency,
        group_id: groupId,
      },
    ])
    .select()
    .single();

  if (errorTaskModel) {
    throw new Error(
      `Erreur de l'insertion de la ligne du modèle de tache dans la table task model: ${errorTaskModel.message}`,
    );
  }

  const newTasks = await createCascadeTasks(
    frequency,
    profilNameTable,
    ancre,
    groupId,
    taskDetails.id,
  );

  const finalTaskTable = newTasks.map((task) => ({
    title: taskDetails.title,
    description: taskDetails.comments,
    frequence: taskDetails.frequency,
    date: task.date_limite,
    userTaskId: task.profil_id,
    firstname: task.profils.firstname,
    status: task.status,
    taskId: task.model_task_id,
    modelTaskId: task.id,
    fait_le: task.fait_le,
  }));
  return finalTaskTable;
};

export const findNumberOfTasks = (frequency, ancre) => {
  let i = 0;
  if (frequency === "quotidienne") {
    //permet de prévoir l'évenualité de l'année bisextile (366 jours) tous
    //les 4 ans
    i = getDaysInYear(ancre);
  } else if (frequency === "hebdomadaire") {
    i = 52;
  } else if (frequency === "bimensuelle") {
    i = 26;
  } else if (frequency === "mensuelle") {
    i = 12;
  }

  return i;
};

export const findDateLimite = (frequency, ancre, iteration) => {
  let dateLimite = "";
  if (frequency === "quotidienne") {
    //permet de prévoir l'évenualité de l'année bisextile (366 jours) tous
    //les 4 ans
    dateLimite = addDays(ancre, iteration);
  } else if (frequency === "hebdomadaire") {
    dateLimite = addWeeks(ancre, iteration);
  } else if (frequency === "bimensuelle") {
    dateLimite = addWeeks(ancre, iteration * 2);
  } else if (frequency === "mensuelle") {
    dateLimite = addMonths(ancre, iteration);
  }

  return format(dateLimite, "yyyy-MM-dd");
};

export const createCascadeTasks = async (
  frequency,
  profilNameTable,
  ancre,
  groupId,
  taskModelId,
) => {
  const numberofTasks = findNumberOfTasks(frequency, ancre);

  let tasksTable = [];
  for (let i = 0; i < numberofTasks; i++) {
    const profilIdForTask = profilNameTable[i % profilNameTable.length];

    const dateLimite = findDateLimite(frequency, ancre, i);

    const task = {
      group_id: groupId,
      status: false,
      model_task_id: taskModelId,
      profil_id: profilIdForTask,
      date_limite: dateLimite,
    };

    tasksTable.push(task);
  }

  const { data: dataTasks, error: errorTasks } = await supabase
    .from("tasks")
    .insert(tasksTable)
    .select(`*,profils!profil_id(firstname)`);

  if (errorTasks) {
    throw new Error(
      `Erreur lors de l'insertion groupée :${errorTasks.message}`,
    );
  }

  return dataTasks;
};

export const updateStatusTask = async (status, date, taskId) => {
  const { data: updateTask, error: errorUpdate } = await supabase
    .from("tasks")
    .update({ status: status, fait_le: date })
    .eq("id", taskId)
    .select();

  if (errorUpdate) {
    throw new Error(
      `Erreur lors de la mise à jour du statut de la tâche :${errorUpdate.message}`,
    );
  }

  return updateTask;
};
