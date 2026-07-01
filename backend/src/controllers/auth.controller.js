import * as authService from "../services/auth.service.js";
import {
  checkDataWithRegex,
  checkPasswordWithRegex,
  checkEmailWithRegex,
} from "../utils/validators.js";
import * as profilService from "../services/profil.service.js";

// ============================================================================
// INSCRIPTION
// ============================================================================

export const register = async (req, res) => {
  //ici on utilise un try catch pour que dans tous le cas à réception de la requete d'angular
  //on "try" la fonction du fichier ath.service
  //si elle renvoit une erreur dans ces cas là avec le throw de la fonction le code s'arrête
  //et vu qu'on a une erreur qui est balancé et bien on arrive dans le catch du register
  try {
    const id = req.body.id;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const password = req.body.password;
    const email_adress = req.body.email_adress;
    //la gestion de la mise à jour de la photo est complexe donc pour le moment standby
    //const photo = req.body.photo;

    if (firstname && !checkDataWithRegex(firstname)) {
      return res.status(400).json({
        error: "Le format du prénom est invalide.",
      });
    }

    if (lastname && !checkDataWithRegex(lastname)) {
      return res.status(400).json({
        error: "Le format du nom est invalide.",
      });
    }

    if (email_adress && !checkEmailWithRegex(email_adress)) {
      return res.status(400).json({
        error: "Le format de l'adresse mail est invalide.",
      });
    }

    const resultRegister = await authService.registerUser(
      id,
      firstname,
      lastname,
      email_adress,
      //la gestion de la mise à jour de la photo est complexe donc pour le moment standby
      //photo,
    );
    //le 201 est utilisé ici parce qu'on a créé spécifiquement un élément supplémentaire dans la bdd
    //pour les autres actions suppression, Modification, lecture, vérification c'est 200
    return res.status(201).json({
      message: "Compte et profil créé avec succès",
      userId: resultRegister,
    });
  } catch (error) {
    //Dans cette sitution le error.message représente soit l'error du premier throw
    //du authservice parce que l'email existe déjà
    //soit le deuxième parce que erreur au moment de l'enregistrement des données dans la table profil

    return res.status(400).json({ error: error.message });
  }
};

// ============================================================================
// CONNECTION
// ============================================================================

export const signIn = async (req, res) => {
  try {
    const email_adress = req.body.email_adress;
    const password = req.body.password;

    const logIn = await authService.logIn(email_adress, password);

    return res.status(200).json(logIn);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// ============================================================================
// CONTROLE DU GROUPE A LA CONNECTION
// ============================================================================

export const controlGroup = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const groupData = await authService.getGroup(token);

    return res.status(200).json(groupData);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// ============================================================================
// DECONNECTION
// ============================================================================
export const signOut = async (req, res) => {
  try {
    const logOut = await authService.logOut();

    return res.status(200).json(logOut);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// ============================================================================
// MISE A JOUR DONNEES PROFILS NON CONFIDENTIELS
// ============================================================================

export const updateAccount = async (req, res) => {
  try {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    //la gestion de la mise à jour de la photo est complexe donc pour le moment standby
    //const photo = req.body.photo;
    const token = req.headers.authorization;

    const uuid = await profilService.getUUID(token);

    if (firstname && !checkDataWithRegex(firstname)) {
      return res.status(400).json({
        error: "Le format du prénom est invalide.",
      });
    }

    if (lastname && !checkDataWithRegex(lastname)) {
      return res.status(400).json({
        error: "Le format du nom est invalide.",
      });
    }

    const updateData = await authService.updateNonConfidentialData(
      uuid,
      //la gestion de la mise à jour de la photo est complexe donc pour le moment standby
      //photo,
      firstname,
      lastname,
    );

    return res.status(200).json({
      message: "Modification des informations du profil effectuée",
      userId: updateData,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// ============================================================================
// ENVOI MAIL POUR CHANGEMENT MDP ET REDIRECTION
// ============================================================================

export const pageResetPassword = async (req, res) => {
  try {
    const email_adress = req.body.email_adress;

    const redirectForNewPassword =
      await authService.pageForResetPassword(email_adress);

    return res.status(200).json({
      message: "Envoi du mail pour changement de mot de passe effectué",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
