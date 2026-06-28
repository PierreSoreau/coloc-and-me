import { supabase } from "../config/supabase.js";
import { getUUID } from "./profil.service.js";
import { getProfilIdByGroup } from "./group.service.js";

export const insertNewAct = async (
  profilId,
  title,
  description,
  typeLocation,
  location,
  date,
  groupId,
) => {
  const newProfilId = await getUUID(profilId);
  const { data: newAct, error: errorNewAct } = await supabase
    .from("activites")
    .insert([
      {
        title: title,
        description: description,
        type_location: typeLocation,
        location: location,
        date: date,
        group_id: groupId,
      },
    ])
    .select()
    .single();

  if (errorNewAct) {
    throw new Error(
      `Erreur lors de la création de l'activité: ${errorNewAct.message}`,
    );
  }

  const newStatus = await insertPlurialStatus(groupId, newAct.id, newProfilId);

  const finalNewAct = {
    actId: newAct.id,
    title: newAct.title,
    description: newAct.description,
    typeLocation: newAct.type_location,
    location: newAct.location,
    date: newAct.date,
    authorisationAndParticipationStatus: newStatus,
    numberYes: 1,
    numberMaybe: 0,
    numberNo: 0,
    numberWaiting: newStatus.length - 1,
  };

  return finalNewAct;
};

export const insertPlurialStatus = async (groupId, actId, profilId) => {
  const profilsIdTable = await getProfilIdByGroup(groupId);

  const dataForSupabase = [];
  const dataForAngular = [];

  profilsIdTable.forEach((profil) => {
    const isOrganizer = profil.profil_id === profilId;

    const authStatus = isOrganizer ? "accepte" : "en attente";
    const partStatus = isOrganizer ? "participe" : "en attente";
    const profStatus = isOrganizer ? "organisateur" : "invité";

    dataForSupabase.push({
      profil_id: profil.profil_id,
      activites_id: actId,
      authorisation_status: authStatus,
      participation_status: partStatus,
      profil_status: profStatus,
    });

    dataForAngular.push({
      profilId: profil.profil_id,
      firstname: profil.profils.firstname,
      authorisationStatus: authStatus,
      participationStatus: partStatus,
      profilStatus: profStatus,
    });
  });

  const { data: newStatus, error: errorNewStatus } = await supabase
    .from("activites_profil")
    .insert(dataForSupabase);

  if (errorNewStatus) {
    throw new Error(
      `Erreur lors de la création des statuts des colocataires pour l'activité: ${errorNewStatus.message}`,
    );
  }

  return dataForAngular;
};

export const allActs = async (groupId) => {
  const { data: getAllActs, error: errorAllActs } = await supabase
    .from("activites")
    .select(
      `
      id,
      description,
      title,
      type_location,
      location,
      date,
      activites_profil!activites_id (
        authorisation_status,
        participation_status,
        profil_status,
        profil_id,
        profils!profil_id (firstname)
      )
    `,
    )
    .eq("group_id", groupId)
    .order("date", { ascending: true });

  if (errorAllActs) {
    throw new Error(
      `Erreur lors de la récupération du détail des activités: ${errorAllActs.message}`,
    );
  }

  const finalAllTasks = getAllActs.map((act) => {
    let numberYes = 0;
    let numberMaybe = 0;
    let numberNo = 0;
    let numberWaiting = 0;

    const formattedStatusList = act.activites_profil.map((status) => {
      if (status.participation_status === "participe") numberYes++;
      if (status.participation_status === "peut-être") numberMaybe++;
      if (status.participation_status === "ne participe pas") numberNo++;
      if (status.participation_status === "en attente") numberWaiting++;

      return {
        profilId: status.profil_id,
        initial: null,
        firstname: status.profils.firstname,
        participationStatus: status.participation_status,
        authorisationStatus: status.authorisation_status,
        profilStatus: status.profil_status,
      };
    });

    return {
      actId: act.id,
      title: act.title,
      description: act.description,
      typeLocation: act.type_location,
      location: act.location,
      date: act.date,
      numberYes: numberYes,
      numberMaybe: numberMaybe,
      numberNo: numberNo,
      numberWaiting: numberWaiting,
      authorisationAndParticipationStatus: formattedStatusList,
    };
  });
  return finalAllTasks;
};

export const updatStatusOfUser = async (
  token,
  participationStatus,
  authorisationStatus,
  actId,
) => {
  const userId = await getUUID(token);

  if (!userId) {
    throw new Error(`Erreur lors de la récupération du userId`);
  }

  const { data: updateStatus, error: errorUpdateStatus } = await supabase
    .from("activites_profil")
    .update({
      authorisation_status: authorisationStatus,
      participation_status: participationStatus,
    })
    .eq("profil_id", userId)
    .eq("activites_id", actId)
    .select("*")
    .single();

  if (errorUpdateStatus) {
    throw new Error(
      `Erreur lors de la de la mise à jour des statuts du coloc pour l'activité: ${errorUpdateStatus.message}`,
    );
  }

  const finalStatus = {
    userId: userId,
    participationStatus: updateStatus.participation_status,
    authorisationStatus: updateStatus.authorisation_status,
    actId: updateStatus.activites_id,
  };

  return finalStatus;
};

export const deleteActColoc = async (actId) => {
  //ne jamais utiliser single sur un delete ça fait planter supabase
  //qui s'attend à avoir un id dans la database alors qu'elle a été supprimée
  const { data: deleteAct, error: errordeleteAct } = await supabase
    .from("activites")
    .delete()
    .eq("id", actId)
    .select("id");

  if (errordeleteAct) {
    throw new Error(
      `Erreur lors de la suppression de l'activité: ${errordeleteAct.message}`,
    );
  }

  return deleteAct[0];
};

export const updateActColoc = async (
  actId,
  title,
  description,
  location,
  typeLocation,
  date,
) => {
  const { data: updateData, error: errorUpdateData } = await supabase
    .from("activites")
    .update({
      title: title,
      description: description,
      location: location,
      type_location: typeLocation,
      date: date,
    })
    .eq("id", actId)
    .select("id,title,description,location,type_location,date")
    .single();

  if (errorUpdateData) {
    throw new Error(
      `Erreur lors de la mise à jour de l'activité: ${errorUpdateData.message}`,
    );
  }

  return updateData;
};

export const getOneActColoc = async (actId) => {
  const { data: oneAct, error: errorOneAct } = await supabase
    .from("activites")
    .select("title,location,type_location,date,description")
    .eq("id", actId)
    .single();

  if (errorOneAct) {
    throw new Error(
      `Erreur lors de la récupération de l'activité: ${errorOneAct.message}`,
    );
  }

  return oneAct;
};
