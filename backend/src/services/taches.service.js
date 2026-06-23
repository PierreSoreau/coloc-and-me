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
    .select(
      "*, model_task!model_task_id(comments,title,frequency),profils!profil_id(firstname)",
    )
    .single();

  if (errorUpdate) {
    throw new Error(
      `Erreur lors de la mise à jour du statut de la tâche :${errorUpdate.message}`,
    );
  }

  const finalUpdateTask = {
    title: updateTask.model_task.title,
    description: updateTask.model_task.comments,
    frequence: updateTask.model_task.frequency,
    date: updateTask.date_limite,
    userTaskId: updateTask.profil_id,
    firstname: updateTask.profils.firstname,
    status: updateTask.status,
    taskId: updateTask.model_task_id,
    modelTaskId: updateTask.id,
    fait_le: updateTask.fait_le,
  };

  return finalUpdateTask;
};

export const deleteTask = async (taskId, frequency) => {
  const { data: deleteTask, error: errorDelete } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .select(
      "*, model_task!model_task_id(comments,title,frequency),profils!profil_id(firstname)",
    );

  if (errorDelete) {
    throw new Error(
      `Erreur lors de la suppression de la tâche :${errorDelete.message}`,
    );
  }

  if (!deleteTask || deleteTask.length === 0) {
    throw new Error(
      "Impossible de supprimer : Aucune tâche trouvée avec cet ID.",
    );
  }

  console.log("🔍 DONNÉES SUPPRIMÉES :", JSON.stringify(deleteTask, null, 2));

  const deletedTask = deleteTask[0];

  if (!frequency) {
    const taskModelId = deletedTask.model_task_id;
    const { data: deleteTaskModel, error: errorDeleteModel } = await supabase
      .from("model_task")
      .delete()
      .eq("id", taskModelId);

    if (errorDeleteModel) {
      throw new Error(
        `Erreur lors de la suppression du modèle:${errorDeleteModel.message}`,
      );
    }
  }

  const finaldeleteTask = {
    title: deletedTask.model_task.title,
    description: deletedTask.model_task.comments,
    frequence: deletedTask.model_task.frequency,
    date: deletedTask.date_limite,
    userTaskId: deletedTask.profil_id,
    firstname: deletedTask.profils.firstname,
    status: deletedTask.status,
    taskId: deletedTask.model_task_id,
    modelTaskId: deletedTask.id,
    fait_le: deletedTask.fait_le,
  };

  return finaldeleteTask;
};

export const deleteAllTask = async (modelId) => {
  const { data: deletedArray, error: errorDelete } = await supabase
    .from("model_task")
    .delete()
    .eq("id", modelId)
    .select(
      "*,tasks!id(date_limite,profil_id,status,model_task_id,id,fait_le,profils!profil_id(firstname))",
    );

  if (errorDelete) {
    throw new Error(
      `Erreur lors de la suppression de toutes les tâches :${errorDelete.message}`,
    );
  }

  const deletedTasks = deletedArray[0];

  const finaldeletedTasks = deletedTasks.tasks.map((task) => {
    return {
      title: deletedTasks.title,
      description: deletedTasks.comments,
      frequence: deletedTasks.frequency,
      date: task.date_limite,
      userTaskId: task.profil_id,
      firstname: task.profils.firstname,
      status: task.status,
      taskId: task.model_task_id,
      modelTaskId: task.id,
      fait_le: task.fait_le,
    };
  });

  return finaldeletedTasks;
};

export const getTask = async (taskId) => {
  const { data: Task, error: errorGetTask } = await supabase
    .from("tasks")
    .select(
      "*, model_task!model_task_id(comments,title,frequency),profils!profil_id(firstname)",
    )
    .eq("id", taskId)
    .single();

  if (errorGetTask) {
    throw new Error(
      `Erreur lors de la récupération de la tâche :${errorGetTask.message}`,
    );
  }

  const finalTask = {
    title: Task.model_task.title,
    description: Task.model_task.comments,
    frequence: Task.model_task.frequency,
    date: Task.date_limite,
    userTaskId: Task.profil_id,
    firstname: Task.profils.firstname,
    status: Task.status,
    taskId: Task.model_task_id,
    modelTaskId: Task.id,
    fait_le: Task.fait_le,
  };

  return finalTask;
};

export const updateTask = async (
  taskId,
  comments,
  title,
  date,
  profilId,
  frequence,
) => {
  const { data: taskModelId, error: errorId } = await supabase
    .from("tasks")
    .select("model_task_id")
    .eq("id", taskId)
    .single();

  if (errorId) {
    throw new Error(
      `Erreur lors de la récupération de l'id du modèle de la tâche :${errorId.message}`,
    );
  }

  const { data: updateTaskModel, error: errorUpdateTaskModel } = await supabase
    .from("model_task")
    .update({ comments: comments, title: title, frequency: frequence })
    .eq("id", taskModelId.model_task_id)
    .select("*")
    .single();

  if (errorUpdateTaskModel) {
    throw new Error(
      `Erreur lors de la modification du modèle de la tâche :${errorUpdateTaskModel.message}`,
    );
  }

  if (frequence === null) {
    const { data: updateTask, error: errorUpdateTask } = await supabase
      .from("tasks")
      .update({ date_limite: date, profil_id: profilId })
      .eq("model_task_id", taskModelId.model_task_id)
      .select("*,profils!profil_id(firstname)")
      .single();

    if (errorUpdateTask) {
      throw new Error(
        `Erreur lors de la modification de la tâche :${errorUpdateTask.message}`,
      );
    }

    const finalUpdateTask = {
      title: updateTaskModel.title,
      description: updateTaskModel.comments,
      frequence: null,
      date: updateTask.date_limite,
      userTaskId: updateTask.profil_id,
      firstname: updateTask.profils.firstname,
      status: false,
      taskId: updateTask.model_task_id,
      modelTaskId: updateTask.id,
      fait_le: null,
    };

    return finalUpdateTask;
  } else {
    const { data: taskList, error: errorTaskList } = await supabase
      .from("tasks")
      .select("*,profils!profil_id(firstname)")
      .eq("model_task_id", taskModelId.model_task_id);

    if (errorTaskList) {
      throw new Error(
        `Erreur lors de la récupération des occurences :${errorTaskList.message}`,
      );
    }

    const updateTasks = taskList.map((task) => {
      task = {
        title: updateTaskModel.title,
        description: updateTaskModel.comments,
        frequence: updateTaskModel.frequence,
        date: task.date_limite,
        userTaskId: task.profil_id,
        firstname: task.profils.firstname,
        status: task.status,
        taskId: task.model_task_id,
        modelTaskId: task.id,
        fait_le: task.fait_le,
      };

      return task;
    });

    return updateTasks;
  }
};

export const deleteTaskAfterCurrentDay = async (modelTaskId) => {
  //toISOString() donne ça pour la date 2026-06-22T14:16:35.000Z
  //split('T')[0] permet de spliter en deux la chaîne de
  //caractère et de prendre le premier élément
  const today = new Date().toISOString().split("T")[0];

  const { data: tasksDeleted, error: errorTaskDeleted } = await supabase
    .from("tasks")
    .delete()
    .eq("model_task_id", modelTaskId)
    .gt("date_limite", today);

  if (errorTaskDeleted) {
    throw new Error(
      `Erreur lors de la suppression des occurences :${errorTaskDeleted.message}`,
    );
  }
};

export const createNewTasksAfterCurrentDay = async (modelTaskId) => {
  const { data: taskModel, error: errorTaskModel } = await supabase
    .from("model_task")
    .select("*")
    .eq("id", modelTaskId)
    .single();

  if (errorTaskModel) {
    throw new Error(
      `Erreur lors de la récupération du modèle de tâche :${errorTaskModel.message}`,
    );
  }

  const today = new Date().toISOString().split("T")[0];

  const newTasks = await createCascadeTasks(
    taskModel.frequency,
    taskModel.profil_id_order,
    today,
    taskModel.groupId,
    modelTaskId,
  );

  const finalTaskTable = newTasks.map((task) => ({
    title: taskModel.title,
    description: taskModel.comments,
    frequence: taskModel.frequency,
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
