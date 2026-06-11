import { supabase } from "../config/supabase.js";

export const getUUID = async (firstToken) => {
  //permet de prendre que le token et pas la mention Bearer avant
  const token = firstToken.split(" ")[1];
  const authResponse = await supabase.auth.getUser(token);

  if (authResponse.error) {
    console.error(
      "Erreur Supabase lors de la lecture du token :",
      authResponse.error.message,
    );
    throw new Error("Impossible de valider le token de l'utilisateur.");
  }

  if (!authResponse.data || !authResponse.data.user) {
    throw new Error("Le token est valide mais ne contient aucun utilisateur.");
  }

  const uuidValue = authResponse.data.user.id;

  return uuidValue;
};

export const getFirstNameAndInitials = async (groupId) => {
  const { data: names, error: errorProfil } = await supabase
    .from("memberships")
    //nom_table_cible!colonne_cle_etrangere_dans_table_source(...) toujours suivre ce schéma
    //dans le cas de jointure
    .select("profils!profil_id(firstname,lastname),profil_id")
    .eq("group_id", groupId);

  if (errorProfil) {
    throw new Error(
      `Erreur de récupération des prénom et nom des utilisateurs:${errorProfil.message}`,
    );
  }

  const finalData = names
    //on filtre tous les noms qui ont un profil_id différent de null
    //cela veut dire qu'ils sont authentifiés (ils ont choisi leur prenom dans le groupe
    .filter((name) => name.profil_id != null)
    //on transforme le tableau initial en un autre tableau avec map
    .map((name) => {
      const initials =
        `${name.profils.firstname.charAt(0)}${name.profils.lastname.charAt(0)}`.toUpperCase();

      return {
        initials: initials,
        firstname: name.profils.firstname,
        userId: name.profil_id,
      };
    });

  return finalData;
};

export const getNameById = async (userId) => {
  const response = await supabase
    .from("profils")
    .select("firstname, lastname")
    .eq("id", userId);

  const name = response.data[0];

  const initials = `${name.firstname[0]}${name.lastname[0]}`;
  return initials;
};

export const getDataProfil = async (userId) => {
  const response = await supabase
    .from("profils")
    .select("firstname, lastname, email_adress")
    .eq("id", userId);

  return response.data[0];
};

//attention pour pouvoir faire ça il faut mettre le mode cascade
//pour les colonnes relatives aux clés secondaires
export const deleteGroupData = async (groupId) => {
  const deleteData = await supabase.from("groups").delete().eq("id", groupId);
  if (deleteData.error) {
    throw new Error(deleteData.error.message);
  }
};
