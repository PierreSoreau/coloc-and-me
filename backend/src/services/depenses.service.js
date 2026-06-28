import { supabase } from "../config/supabase.js";
import { getDebtData } from "../controllers/remboursement.controller.js";
import { getUUID, getNameById, getInitials } from "./profil.service.js";
import { calculateUserBalance } from "./remboursement.service.js";

export const totalExpenseGroup = async (groupId) => {
  let expensesGroupValue = 0;
  const { data: expensesGroup, error: errorExpenses } = await supabase
    .from("expenses")
    .select("expense_amount")
    .eq("group_id", groupId);

  if (errorExpenses) {
    throw new Error(
      `Erreur lors de la récupération des montants de dépense:${errorExpenses.message}`,
    );
  }

  for (const expense of expensesGroup) {
    expensesGroupValue += expense.expense_amount;
  }

  return expensesGroupValue;
};

export const getExpensesData = async (groupId, token) => {
  const uuid = await getUUID(token);
  const debt = await calculateUserBalance(uuid);
  const totalGroupExpenses = await totalExpenseGroup(groupId);
  const { data: expensesData, error: expensesError } = await supabase
    .from("expenses")
    .select(
      `id,
      expense_amount,
      date,
      article,
      profils(firstname, lastname)`,
    )
    .eq("group_id", groupId);

  if (expensesError) {
    throw new Error(
      `Erreur lors de la récupération des données de dépenses:${expensesError.message}`,
    );
  }

  const finalExpenseData = expensesData.map((expense) => {
    const firstInitial = expense.profils.firstname.charAt(0).toUpperCase();
    const lastInitial = expense.profils.lastname.charAt(0).toUpperCase();

    return {
      expense_amount: expense.expense_amount,
      expense_date: expense.date,
      expense_title: expense.article,
      firstname: expense.profils.firstname,
      initials: `${firstInitial}${lastInitial}`,
      expense_id: expense.id,
    };
  });

  return {
    globalStats: {
      totalExpenseGroup: totalGroupExpenses,
      totalDebt: debt.debtAmount,
    },
    finalExpenseList: finalExpenseData,
  };
};

export const newExpense = async (
  expenseAmount,
  date,
  profilId,
  groupId,
  article,
) => {
  const { data: dataRecordExpense, error: errorRecord } = await supabase
    .from("expenses")
    .insert([
      {
        expense_amount: expenseAmount,
        date: date,
        profil_id: profilId,
        group_id: groupId,
        article: article,
      },
    ])
    .select();

  if (errorRecord) {
    throw new Error(
      `Erreur au moment de l'enregistrement de la dépense,${errorRecord.message}`,
    );
  }

  return {
    expense_id: dataRecordExpense[0].id,
    debtAmount: expenseAmount,
  };
};

export const calculateDebtDistribution = (totalAmount, payerIds) => {
  const count = payerIds.length;
  // On travaille en centimes pour éviter les erreurs de virgule flottante
  // En gros par exemple 9.65 donne 965
  const totalCents = Math.round(totalAmount * 100);
  //calcul du montant à rembourser pour chacun
  const basePartCents = Math.floor(totalCents / count);
  //calcul du reste après la division par le nombre de participant
  const remainder = totalCents % count;

  //   Explication du map avec un montant de 10 euros et 3 personnes en jeu :

  //   Index 0 : 0 < 1 est vrai. Il paie 333 + 1 = 334 centimes (3,34 €).

  //   Index 1 : 1 < 1 est faux. Il paie 333 + 0 = 333 centimes (3,33 €).

  //   Index 2 : 2 < 1 est faux. Il paie 333 + 0 = 333 centimes (3,33 €).

  return payerIds.map((id, index) => {
    let debtAmountInCents = basePartCents;

    // Si on a un reste de centimes à distribuer, on en ajoute un
    // aux premiers participants de la liste.
    if (index < remainder) {
      debtAmountInCents += 1;
    }

    const debtAmount = debtAmountInCents / 100;

    return {
      profilId: id,
      amount: debtAmount,
    };
  });
};

export const newDebt = async (profilIdTable, totalAmount, expenseId) => {
  const debtTable = await calculateDebtDistribution(totalAmount, profilIdTable);

  if (!debtTable) {
    throw new Error(
      "Erreur lors de la récupération du tableau de dépense par utilisateur",
    );
  }
  const dataToInsert = debtTable.map((item) => ({
    profil_id: item.profilId,
    debt_amount: item.amount,
    expenses_id: expenseId,
  }));

  const { error: debtError } = await supabase
    .from("expenses_profil")
    .insert(dataToInsert);

  if (debtError) {
    throw new Error(
      `Erreur au moment de l'enregistrement de la dette,${debtError.message}`,
    );
  }
};

export const getDetailExpense = async (expenseId) => {
  const { data: expenseData, error: errorExpense } = await supabase
    .from("expenses")
    .select(
      "article,date,expense_amount,profils!profil_id(firstname,lastname),profil_id",
    )
    .eq("id", expenseId)
    .single();
  //select permet de transformer expenseData en objet directement au lieu d'un tableau
  //mais attention ça le fait sur seulement sur un tableau qui a un seul objet
  //ça permet de lire  expenseData.profils.firstname directement au lieu de s'emmerder
  //avec un tableau
  // sans single:
  // {
  //   "article": "Liquide vaisselle",
  //   "date": "2026-06-12",
  //   "expense_amount": 3,
  //   "profils": {
  //     "firstname": "Pierre",
  //     "lastname": "Soreau"
  //   }
  // }

  // avec single:

  // {
  //   "article": "Liquide vaisselle",
  //   "date": "2026-06-12",
  //   "expense_amount": 3,
  //   "profils": {
  //     "firstname": "Pierre",
  //     "lastname": "Soreau"
  //   }
  // }
  if (errorExpense) {
    throw new Error(
      `Erreur au moment de la récupération de la dépense, ${errorExpense.message}`,
    );
  }

  const initials = await getInitials(
    expenseData.profils.firstname,
    expenseData.profils.lastname,
  );

  return {
    article: expenseData.article,
    date: expenseData.date,
    expense_amount: expenseData.expense_amount,
    initials: initials,
    firstnamePayer: expenseData.profils.firstname,
    payerId: expenseData.profil_id,
  };
};

export const getdetailDebt = async (expenseId) => {
  const { data: debtData, error: errorDebt } = await supabase
    .from("expenses_profil")
    .select("debt_amount,profils!profil_id(firstname,lastname),profil_id")
    .eq("expenses_id", expenseId);

  if (errorDebt) {
    throw new Error(
      `Erreur au moment de la récupération de la dette, ${errorDebt.message}`,
    );
  }
  const debtProfil = [];

  for (const debt of debtData) {
    const initials = await getInitials(
      debt.profils.firstname,
      debt.profils.lastname,
    );
    debtProfil.push({
      initials: initials,
      firstnameUserDebt: debt.profils.firstname,
      debtUserId: debt.profil_id,
      debtAmount: debt.debt_amount,
    });
  }

  return { debtData: debtProfil };
};

export const deleteExpense = async (expenseId) => {
  const { data: expenseDelete, error: deleteError } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (deleteError) {
    throw new Error(
      `Erreur lors de la suppression de la dépense, ${deleteError.message}`,
    );
  }
};
