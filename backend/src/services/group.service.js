import { supabase } from "../config/supabase.js";
import { getUUID } from "./profil.service.js";

//select() permet d'obtenir l'id de la ligne
//il suffit juste après de le return
export const newGroup = async (groupName) => {
  const insertNewGroup = await supabase
    .from("groups")
    .insert([{ name: groupName }])
    .select();

  if (insertNewGroup.error || !insertNewGroup.data) {
    console.error("Erreur création groupe:", insertNewGroup.error);
    throw new Error("Supabase a refusé la création du groupe.");
  }

  return insertNewGroup.data[0].id;
};

export const newParticipant = async (participant, groupId, token) => {
  let userid = null;

  if (token) {
    userid = await getUUID(token);
  }

  const insertNewParticipant = await supabase.from("memberships").insert([
    {
      display_name: participant,
      group_id: groupId,
      profil_id: userid ? userid : null,
    },
  ]);

  if (insertNewParticipant.error) {
    console.error(
      `Erreur pour le participant ${participant} :`,
      insertNewParticipant.error,
    );
    throw new Error(insertNewParticipant.error.message);
  }
};

export const getGroup = async (token) => {
  const uuid = await getUUID(token);
  const uuidgroup = await supabase
    .from("memberships")
    .select("group_id")
    .eq("profil_id", uuid);

  if (uuidgroup.error) {
    throw new Error(
      `Erreur de récupération du groupe: ${uuidgroup.error.message}`,
    );
  }

  //Voici l'exemple d'une réponse supabase:
  // {
  //   "data": [
  //     {
  //       "group_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  //     }
  //   ],
  //   "error": null,
  //   "count": null,
  //   "status": 200,
  //   "statusText": "OK"
  // }
  //attention à ne pas oublier de mettre uuidgroup.data.length === 0
  //parce que si la recherche supabase ne plante pas mais que l'utilisateur
  //n'a pas de groupe supabase répond quand même mais sans contenu

  if (!uuidgroup.data || uuidgroup.data.length === 0) {
    throw new Error("Aucun groupe trouvé pour cet utilisateur");
  }

  // 3. On extrait la vraie chaîne de caractères (l'ID du groupe)
  const groupId = uuidgroup.data[0].group_id;

  return {
    groupId: groupId,
  };
};

export const getGroupName = async (groupId) => {
  const groupName = await supabase
    .from("groups")
    .select("name")
    .eq("id", groupId);

  if (groupName.error) {
    throw new Error(
      `Erreur de récupération du nom du groupe: ${groupName.error.message}`,
    );
  }

  const finalGroupName = groupName.data[0].name;

  return {
    groupName: finalGroupName,
  };
};
