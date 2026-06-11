import { supabase } from "../config/supabase.js";
import { getUUID } from "./profil.service.js";

// ============================================================================
// INSCRIPTION
// ============================================================================

export const registerUser = async (id, firstname, lastname, email_adress) => {
  //si le compte est accepté dans ce cas on enregistre les infos du compte
  // dans la table profil
  //ensuite on enregistre les autres éléments renseignés dans le formulaire angular
  //dans la table profils
  //On pourrait penser que l'injection sql est possible avec cette requette supabase
  //mais en fait non parce que avant de rentrer dans la base de donnée supabase a un outil
  //qui s'appelle postgREST qui va faire une requêt préparée qui est le standard de l'industrie
  //si un gars a mis du code malveillant à la place du prénom par exemple ça va transformer le
  //code en texte inactif
  //il est quand même intéressant de mettre un Regex avant l'enregistrement de la donnée pour éviter
  //d'avoir des prénoms débiles ou des risques de faille XSS pour le front (c'est à dire une
  //redirection vers des sites malveillants). Cette démarche se fait dans le controller avant de
  //lancer la fonction du service
  const profilRegister = await supabase.from("profils").insert([
    {
      id: id,
      firstname: firstname,
      lastname: lastname,
      email_adress: email_adress,
    },
  ]);

  if (profilRegister.error) {
    console.error("🚨 DÉTAIL DE L'ERREUR SUPABASE :", profilRegister.error);
    throw new Error("Une erreur est intervenu à la création du profil");
  }
  //mettre un id en retour permet à angular de directement
  //afficher le dashboard de l'utilisateur dès qu'il a appuyé sur s'inscrire
  //une fois qu'il s'est inscrit. Cela évite qu'il se réinscrive de nouveau
  return id;
};

// ============================================================================
// CONTROLE DU GROUPE A LA CONNECTION
// ============================================================================

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

  const groupName = await supabase
    .from("groups")
    .select("name")
    .eq("id", groupId);

  return {
    groupUUID: uuidgroup,
    groupName: groupName.data[0].name,
  };
};

// ============================================================================
// MISE A JOUR DONNEES PROFILS NON CONFIDENTIELS
// ============================================================================

export const updateNonConfidentialData = async (
  userId,
  //galère à gérer les photos pour le moment
  //donc pour le moment il n'y en a pas
  //photo,
  firstname,
  lastname,
) => {
  //On pourrait penser que l'injection sql est possible avec cette requette supabase
  //mais en fait non parce que avant de rentrer dans la base de donnée supabase a un outil
  //qui s'appelle postgREST qui va faire une requêt préparée qui est le standard de l'industrie
  //si un gars a mis du code malveillant à la place du prénom par exemple ça va transformer le
  //code en texte inactif
  //il est quand même intéressant de mettre un Regex avant l'enregistrement de la donnée pour éviter
  //d'avoir des prénoms débiles ou des risques de faille XSS pour le front (c'est à dire une
  //redirection vers des sites malveillants). Cette démarche se fait dans le controller avant de
  //lancer la fonction du service
  const updateData = await supabase
    .from("profils")
    .update({ firstname: firstname, lastname: lastname })
    .eq("id", userId)
    .select();

  if (updateData.error) throw new Error(updateData.error.message);

  return updateData.data[0].id;
};

// ============================================================================
// ENVOI MAIL POUR CHANGEMENT MDP ET REDIRECTION
// ============================================================================

export const pageForResetPassword = async (email_adress) => {
  //avec la fonction resetPasswordForEmail, supabase prépare un mail préétablit
  //ce mail est transmis à googlemail mon site pour envoyer des mails
  //googlemail envoit ensuite le mail sur la boîte mail de l'interessé
  //il a plus qu'à cliquer sur lien cela va le rediriger vers  ${process.env.FRONTEND_URL}${process.env.PORT}/update-password
  //il pourra changer son mot de passe
  const redirectPage = await supabase.auth.resetPasswordForEmail(email_adress, {
    redirectTo: `${process.env.FRONTEND_URL}4200/auth/reset-password`,
  });

  if (redirectPage.error) {
    throw new Error(redirectPage.error.message);
  }
};
