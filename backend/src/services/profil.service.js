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
