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

export const newDebt = async (profilIdTable, debtAmount, expenseId) => {
  for (const profilId of profilIdTable) {
    const { data: debtRecord, error: debtError } = await supabase
      .from("expenses_profil")
      .insert([
        {
          profil_id: profilId,
          debt_amount: debtAmount,
          expenses_id: expenseId,
        },
      ]);

    if (debtError) {
      throw new Error(
        `Erreur au moment de l'enregistrement de la dette,${debtError.message}`,
      );
    }
  }
};

export const getDetailExpense = async (expenseId) => {
  const { data: expenseData, error: errorExpense } = await supabase
    .from("expenses")
    .select("article,date,expense_amount,profils!profil_id(firstname,lastname)")
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
  };
};

export const getdetailDebt = async (expenseId) => {
  const { data: debtData, error: errorDebt } = await supabase
    .from("expenses_profil")
    .select("debt_amount,profils!profil_id(firstname,lastname)")
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
    });
  }

  return { debt_amount: debtData[0].debt_amount, debtData: debtProfil };
};
