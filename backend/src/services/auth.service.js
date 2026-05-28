import { supabase } from "../config/supabase.js";

// ============================================================================
// INSCRIPTION
// ============================================================================

export const registerUser = async (
  password,
  firstname,
  lastname,
  email_adress,
) => {
  //l'utilisateur renseigne sur le formulaire angular ses informations d'inscription
  // (password, firstname, lastname...),
  // l'email et le password sont ensuite enregistrés dans l'onglet authentification de supabase
  // c'est dans cet onglet qu'il y a une table User ou email et password sont renseignés en hachés
  // par supabase en automatique
  //La fonction SIGNUP de supabase hache le mot de passe enregistré, créé une uuid unique, vérifie si l'email existe déjà
  const authResponse = await supabase.auth.signUp({
    email: email_adress,
    password: password,
  });

  //si l'email existe déjà dans la base
  // ou que le format est mauvais ça renvoit un message d'erreur
  if (authResponse.error) {
    const supabaseMessage = authResponse.error.message;

    console.log("🚨 VRAIE ERREUR SUPABASE :", supabaseMessage);

    if (supabaseMessage === "User already registered") {
      throw new Error("Cet email est déjà utilisé");
    } else if (supabaseMessage === "Password should be at least 6 characters") {
      throw new Error(
        "Le mot de passe est trop faible (6 caractères minimum).",
      );
    } else {
      throw new Error("Une erreur est survenue lors de l'inscription.");
    }
  }

  //si le compte est accepté dans ce cas on enregistre les infos du compte
  // dans la table profil
  //pour cela on va déjà reprendre le même id que la table d'authentification

  const userId = authResponse.data.user.id;

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
      id: userId,
      firstname: firstname,
      lastname: lastname,
      email_adress: email_adress,
    },
  ]);

  if (profilRegister.error) {
    throw new Error(
      "Une erreur est intervenu au moment de l'enregistrement de vos données",
    );
  }
  //mettre un userId en retour permet à angular de directement
  //afficher le dashboard de l'utilisateur dès qu'il a appuyé sur s'inscrire
  //une fois qu'il s'est inscrit. Cela évite qu'il se réinscrive de nouveau
  return userId;
};

// ============================================================================
// CONNECTION
// ============================================================================

//la fonction signInWithPassword hache le password
//check le password haché avec la base des mdp hachés pour voir si correspondance
//il envoie une info comme quoi c'est bon à angular si correspondance et du coup l'utilisateur est connecté
export const logIn = async (email_adress, password) => {
  const checkLogin = await supabase.auth.signInWithPassword({
    email: email_adress,
    password: password,
  });

  if (checkLogin.error) {
    const supabaseMessage = checkLogin.error.message;

    if (supabaseMessage === "Invalid login credentials") {
      throw new Error("Email ou mot de passe incorrect.");
    } else if (supabaseMessage === "Email not confirmed") {
      throw new Error("Veuillez valider votre adresse email pour continuer.");
    } else if (supabaseMessage === "Too many requests") {
      throw new Error("Trop de tentatives, merci de réessayer plus tard.");
    }

    // Si c'est une erreur qu'on n'a pas prévue, on renvoie le message de base
    throw new Error(supabaseMessage);
  }

  return {
    token: checkLogin.data.session.access_token,
    refresh_token: checkLogin.data.session.refresh_token,
  };
};

// ============================================================================
// DECONNECTION
// ============================================================================

export const logOut = async () => {
  const endSession = await supabase.auth.signOut();
  if (endSession.error) {
    throw new Error(endSession.error.message);
  }

  return { message: "Deconnection résussie" };
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
  //ce mail est transmis à Brevo mon site pour envoyer des mails
  //Brevo envoit ensuite le mail sur la boîte mail de l'interessé
  //il a plus qu'à cliquer sur lien cela va le rediriger vers  ${process.env.FRONTEND_URL}${process.env.PORT}/update-password
  //il pourra changer son mot de passe
  const redirectPage = await supabase.auth.resetPasswordForEmail(email_adress, {
    redirectTo: `${process.env.FRONTEND_URL}4200/auth/reset-password`,
  });

  if (redirectPage.error) {
    throw new Error(redirectPage.error.message);
  }
};
