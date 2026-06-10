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

  const totalDebtAmount = totalExpenseAmount - totalFirstDebtAmount;

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

  const userIdTable = memberships
    .filter((user) => user.profil_id != null) // 1. On vire tous les objets où profil_id est null
    .map((user) => user.profil_id); // 2. On transforme le tableau propre en [1234, 45478]

  return userIdTable;
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

const debt_amount = 0;

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
    let amount = Math.min(Math.abs(debt.debtAmount), credit.debtAmount);

    // On insère tout de suite la ligne dans Supabase
    await debtLineInSupabase(groupId, debt, credit, amount);

    //On met à jour les portefeuilles en mémoire
    debt.debtAmount += amount; // La dette remonte vers 0
    credit.debtAmount -= amount; // La créance descend vers 0

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
  await supabase.from("remboursement").insert([
    {
      profil_indebted_id: debt.userId,
      group_id: groupId,
      debt_amount: debt_amount,
      profil_creditor_id: credit.userId,
    },
  ]);
};
