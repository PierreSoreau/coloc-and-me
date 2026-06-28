import { supabase } from "../config/supabase.js";

//voici les étapes à respecter pour obtenir une valeur de dette à rembourser dans la page
//remboursement:
// 1. Calculer la balance nette de chacun (ce qu'il a payé *moins* ce qu'il aurait dû payer).
// 2. Scinder en deux groupes : les débiteurs (en négatif) et les créanciers (en positif)
// 3. prendre le tableau des débiteurs et le trier (celui qui doit le plus d'argent en premier).
// 4. prendre le tableau des créanciers et le trier (celui qui doit recevoir le plus d'argent en premier).
// 5. regarder le premier débiteur et le premier créancier.
// 6. Le montant de la transaction sera le **minimum** entre la dette et la créance.
// 7. déduire ce montant des deux. Si la dette de l'un tombe à zéro, on passe au suivant dans sa liste.

export const calculateUserBalance = async (userId) => {
  let totalFirstDebtAmount = 0;
  let totalExpenseAmount = 0;
  const { data: debtTable, error: debtError } = await supabase
    .from("expenses_profil")
    .select("debt_amount")
    .eq("profil_id", userId);

  if (debtError) throw new Error(`Erreur dettes: ${debtError.message}`);

  for (const debtAmount of debtTable) {
    totalFirstDebtAmount = totalFirstDebtAmount + debtAmount.debt_amount;
  }

  const { data: totalExpense, error: expenseError } = await supabase
    .from("expenses")
    .select("expense_amount")
    .eq("profil_id", userId);

  if (expenseError) throw new Error(`Erreur dépenses: ${expenseError.message}`);

  for (const expenseAmount of totalExpense) {
    totalExpenseAmount = totalExpenseAmount + expenseAmount.expense_amount;
  }

  let totalDebtAmount = totalExpenseAmount - totalFirstDebtAmount;

  //indispensable pour éviter les buggs de calcul de javascript quand
  //il fait des additions et soustractions
  totalDebtAmount = Math.round(totalDebtAmount * 100) / 100;

  return { userId: userId, debtAmount: totalDebtAmount };
};

export const getUserIdByGroupName = async (groupId) => {
  const { data: memberships, error: idError } = await supabase
    .from("memberships")
    .select("profil_id")
    .eq("group_id", groupId);

  if (idError) {
    throw new Error(`Erreur récupération des ids: ${idError.message}`);
  }

  const finalUserId = memberships
    .filter((membership) => membership.profil_id != null)
    .map((membership) => membership.profil_id);

  return finalUserId;
};

export const allUserBalance = async (groupId) => {
  let userBalanceTable = [];
  const userIdTable = await getUserIdByGroupName(groupId);

  for (const userId of userIdTable) {
    const userbalance = await calculateUserBalance(userId);
    userBalanceTable.push(userbalance);
  }

  return userBalanceTable;
};

export const getDebtUserTable = async (groupId) => {
  let debtUserTable = [];
  let creditUserTable = [];
  const userBalanceTable = await allUserBalance(groupId);
  for (const userbalance of userBalanceTable) {
    if (userbalance.debtAmount < 0) {
      debtUserTable.push(userbalance);
    } else if (userbalance.debtAmount > 0) {
      creditUserTable.push(userbalance);
    }
  }

  return { debtors: debtUserTable, creditors: creditUserTable };
};

//fonction qui permet de trier le tableau des créditeurs et endetteurs de manière
//à avoir la dette la plus élevée en premier du tableau endetté (le moins le plus élevé)
//et le credit le plus élevé en premier du tableau crediteur
export const sortDebtAndCreditTable = async (groupId) => {
  const DebtUserObject = await getDebtUserTable(groupId);

  let debtUserTable = DebtUserObject.debtors;
  let creditUserTable = DebtUserObject.creditors;

  //fonction sort permet de trier un tableau a représente l'élement du tableau à gauche
  //b l'élément à droite si la valeur de la soustraction est positive c'est que l'élément
  //de gauche était plus élevé que celui de droite donc on intervertit et si c'est l'inverse on bouge pas
  //donc si on veut trier par ordre croissant on fait a-b et si par ordre décroissant b-a
  debtUserTable.sort((a, b) => a.debtAmount - b.debtAmount);
  creditUserTable.sort((a, b) => b.debtAmount - a.debtAmount);

  return { creditors: creditUserTable, debtors: debtUserTable };
};

//fonction qui permet d'évaluer le montant à rembourser pour chaque utilisateur
//vis-a-vis d'un autre utilisateur
export const insertDebtValue = async (groupId) => {
  //attention surtout à ne pas oublier cette ligne qui permet de supprimer
  //toutes les lignes de la zone remboursement avant de recalculer le remboursement
  //parce que sinon à chaque recalcul de dette (en appuyant sur un bouton par exemple)
  //on obtiendra une nouvelle ligne donc le montant de la dette augmenterait au lieu de
  //juste se mettre à jour à la hausse ou à la baisse
  await supabase.from("remboursement").delete().eq("group_id", groupId);

  const debtAndCreditTable = await sortDebtAndCreditTable(groupId);
  let debtUserTable = debtAndCreditTable.debtors;
  let creditUserTable = debtAndCreditTable.creditors;

  let i = 0; // Pointe sur le débiteur actuel (dans debtUserTable)
  let j = 0; // Pointe sur le créancier actuel (dans creditUserTable)

  // Tant qu'il reste des gens dans les deux listes, on continue
  while (i < debtUserTable.length && j < creditUserTable.length) {
    let debt = debtUserTable[i];
    let credit = creditUserTable[j];

    // On trouve le montant à échanger (le plus petit des deux)
    // On utilise Math.abs() car la dette est un nombre négatif
    let amountBrut = Math.min(Math.abs(debt.debtAmount), credit.debtAmount);
    //On arrondit le montant de la transaction avant de l'insérer
    //toujours pour éviter les buggs de javascript
    let amount = Math.round(amountBrut * 100) / 100;

    // On insère tout de suite la ligne dans Supabase
    await debtLineInSupabase(groupId, debt, credit, amount);

    //On met à jour les portefeuilles en mémoire
    debt.debtAmount = Math.round((debt.debtAmount + amount) * 100) / 100; // La dette remonte vers 0
    credit.debtAmount = Math.round((credit.debtAmount - amount) * 100) / 100; // La créance descend vers 0

    // Si la dette du débiteur 'i' est réglée, on ajoute 1 à 'i' pour passer au débiteur suivant.
    if (Math.abs(debt.debtAmount) < 0.01) {
      i++;
    }

    // Si la créance du créancier 'j' est comblée, on ajoute 1 à 'j' pour passer au créancier suivant.
    if (credit.debtAmount < 0.01) {
      j++;
    }
  }
};

export const debtLineInSupabase = async (
  groupId,
  debt,
  credit,
  debt_amount,
) => {
  const { data: insertLine, error: errorLine } = await supabase
    .from("remboursement")
    .insert([
      {
        profil_indebted_id: debt.userId,
        group_id: groupId,
        debt_amount: debt_amount,
        profil_creditor_id: credit.userId,
      },
    ]);

  if (errorLine) {
    throw new Error(
      `Erreur de l'insertion de la ligne de remboursement: ${errorLine.message}`,
    );
  }
};

export const getLineRemboursement = async (userId) => {
  const { data: dataRemboursement, error: errorRemboursement } = await supabase
    .from("remboursement")
    .select(
      `profil_indebted_id,      
       profil_creditor_id,
       debt_amount,
       endette:profils!profil_indebted_id(firstname,lastname),
       crediteur:profils!profil_creditor_id(firstname,lastname)`,
    )
    .or(`profil_creditor_id.eq.${userId},profil_indebted_id.eq.${userId}`);

  if (errorRemboursement) {
    throw new Error(
      `Erreur de récupération des lignes de remboursement: ${errorRemboursement.message}`,
    );
  }

  const finalData = dataRemboursement.map((remboursement) => {
    let firstname = "";
    let initials = "";
    let type_de_dette = "";
    let debtAmount = 0;

    if (remboursement.profil_indebted_id != userId) {
      firstname = remboursement.endette.firstname;
      const lastname = remboursement.endette.lastname;
      initials = `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
      type_de_dette = "à recevoir de";
      debtAmount = remboursement.debt_amount;
    } else if (remboursement.profil_creditor_id != userId) {
      firstname = remboursement.crediteur.firstname;
      const lastname = remboursement.crediteur.lastname;
      initials = `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
      type_de_dette = "à payer à";
      debtAmount = remboursement.debt_amount * -1;
    }

    return {
      firstname: firstname,
      initials: initials,
      debtAmount: debtAmount,
      type_de_dette: type_de_dette,
    };
  });

  return finalData;
};
