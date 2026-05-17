//ce fichier recense l'ensemble des fonctions qui permettent
//de contrôler le contenu écrit renseigné dans les input
//de connection/inscriptio (mdp, email, nom...)

export const checkDataWithRegex = (name) => {
  //ce regex autorise tout sauf < > { } par exemple
  const Regex = /^[a-zA-ZÀ-ÿ\s'\-]+$/;

  const test = Regex.test(name);

  return test;
};

export const checkEmailWithRegex = (name) => {
  //Autorise lettres, chiffres, points, tirets avant le @, Exige le symbole arobase,
  //Autorise le nom de domaine (ex: gmail, yahoo)
  //Exige un point suivi d'une extension de 2 à 6 lettres (.com, .fr)
  const Regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  const test = Regex.test(name);

  return test;
};

export const checkPasswordWithRegex = (name) => {
  //Au moins une lettre minuscule, Au moins une lettre majuscule, Au moins un chiffre,
  //Au moins un caractère spécial , Une longueur minimum de 8 caractères au total
  const Regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const test = Regex.test(name);

  return test;
};
